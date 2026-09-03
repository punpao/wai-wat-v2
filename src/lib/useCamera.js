import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * The live camera behind the AR hunt.
 *
 * Phones are the whole point of this screen, so every awkward part of
 * getUserMedia on iOS and Android is handled here instead of in the page:
 *
 * - The <video> has to already be in the DOM when the stream arrives. The
 *   caller renders it unconditionally and only fades it in; attaching is done
 *   in an effect, never inside the async start.
 * - iOS Safari plays an inline stream only when the element is muted, carries
 *   playsinline, and is told to play(). autoPlay alone leaves a black box.
 * - `facingMode: exact` is what actually picks the rear camera on Android;
 *   laptops have no rear camera at all, so the constraint chain loosens twice
 *   before giving up.
 * - Backgrounding the app on iOS suspends the track and leaves a frozen frame
 *   behind. Coming back needs a play(), and a killed track needs a new stream.
 *
 * Everything is best-effort: when the camera cannot be opened the hunt still
 * runs on the painted background, which is what a desktop demo uses anyway.
 */

/** Loosened one step at a time — the first one that opens, wins. */
const CONSTRAINTS = [
  (facing) => ({
    video: {
      facingMode: { exact: facing },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  }),
  (facing) => ({ video: { facingMode: { ideal: facing } }, audio: false }),
  () => ({ video: true, audio: false }),
]

function describe(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'ยังไม่ได้อนุญาตให้ใช้กล้อง — กดอนุญาตในเบราว์เซอร์ แล้วลองอีกครั้ง'
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'ไม่พบกล้องบนอุปกรณ์นี้'
    case 'NotReadableError':
    case 'AbortError':
      return 'มีแอปอื่นใช้กล้องอยู่ ปิดแอปกล้องหรือวิดีโอคอลแล้วลองอีกครั้ง'
    default:
      return 'เปิดกล้องไม่ได้ — ถ้าเปิดจากในแอป (LINE, Facebook, IG) ให้เลือก “เปิดในเบราว์เซอร์” แล้วลองใหม่'
  }
}

const stopStream = (s) => s?.getTracks().forEach((t) => t.stop())

export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const aliveRef = useRef(true)
  const facingRef = useRef('environment')
  // Every start gets a ticket; only the newest one is allowed to land. This is
  // what keeps StrictMode's double mount from leaving an orphaned stream on.
  const attemptRef = useRef(0)

  const [stream, setStream] = useState(null)
  const [state, setState] = useState('starting') // starting | on | blocked | idle
  const [message, setMessage] = useState('')
  const [denied, setDenied] = useState(false)
  const [facing, setFacing] = useState('environment')
  const [canSwitch, setCanSwitch] = useState(false)

  const start = useCallback(async (mode) => {
    const want = mode || facingRef.current
    const ticket = ++attemptRef.current

    // getUserMedia exists only on secure origins — https, or localhost.
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('blocked')
      setDenied(false)
      setMessage(
        window.isSecureContext
          ? 'เบราว์เซอร์นี้ไม่รองรับการเปิดกล้อง ลองเปิดด้วย Chrome หรือ Safari'
          : 'ต้องเปิดหน้านี้ผ่าน https จึงจะใช้กล้องได้',
      )
      return
    }

    setState('starting')
    setMessage('')

    let next = null
    let lastErr = null
    for (const build of CONSTRAINTS) {
      try {
        next = await navigator.mediaDevices.getUserMedia(build(want))
        break
      } catch (err) {
        lastErr = err
        // A refusal is final. Looser constraints would only prompt again.
        if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') break
      }
    }

    // A newer attempt started, or the screen closed, while we were waiting.
    if (ticket !== attemptRef.current || !aliveRef.current) {
      stopStream(next)
      return
    }

    if (!next) {
      setState('blocked')
      setDenied(lastErr?.name === 'NotAllowedError' || lastErr?.name === 'SecurityError')
      setMessage(describe(lastErr))
      return
    }

    stopStream(streamRef.current)
    streamRef.current = next
    facingRef.current = want
    setFacing(want)
    setStream(next)
    setDenied(false)
    setMessage('')
    setState('on')

    // Offer the flip only when there really is a second camera. Labels and
    // counts are only trustworthy after permission was granted, so this runs
    // here rather than up front.
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      if (aliveRef.current) {
        setCanSwitch(devices.filter((d) => d.kind === 'videoinput').length > 1)
      }
    } catch {
      /* enumerateDevices is optional — no flip button is fine */
    }
  }, [])

  const switchCamera = useCallback(
    () => start(facingRef.current === 'environment' ? 'user' : 'environment'),
    [start],
  )

  /* ── open on arrival, and hand the camera back on the way out ── */
  useEffect(() => {
    aliveRef.current = true
    start()
    return () => {
      aliveRef.current = false
      attemptRef.current += 1 // invalidate any start still in flight
      stopStream(streamRef.current)
      streamRef.current = null
    }
  }, [start])

  /* ── attach: the element is mounted by now, so this always lands ── */
  useEffect(() => {
    const v = videoRef.current
    if (!v || !stream) return
    if (v.srcObject !== stream) v.srcObject = stream
    // Old iOS reads the attributes, not the React props.
    v.setAttribute('playsinline', '')
    v.setAttribute('webkit-playsinline', '')
    v.muted = true
    const play = () => {
      const p = v.play()
      if (p?.catch) p.catch(() => {})
    }
    play()
    v.addEventListener('loadedmetadata', play)
    return () => v.removeEventListener('loadedmetadata', play)
  }, [stream])

  /* ── survive backgrounding, screen lock and camera hand-offs ── */
  useEffect(() => {
    if (!stream) return
    const track = stream.getVideoTracks()[0]

    const onEnded = () => {
      if (!aliveRef.current) return
      streamRef.current = null
      setStream(null)
      setState('idle')
    }

    const revive = () => {
      if (document.visibilityState !== 'visible') return
      // A dead track needs a whole new stream; a live one was only paused.
      if (!track || track.readyState === 'ended') {
        start()
      } else {
        const p = videoRef.current?.play()
        if (p?.catch) p.catch(() => {})
      }
    }

    track?.addEventListener('ended', onEnded)
    document.addEventListener('visibilitychange', revive)
    window.addEventListener('pageshow', revive)
    return () => {
      track?.removeEventListener('ended', onEnded)
      document.removeEventListener('visibilitychange', revive)
      window.removeEventListener('pageshow', revive)
    }
  }, [stream, start])

  return {
    videoRef,
    /** starting | on | blocked | idle */
    state,
    isOn: state === 'on',
    message,
    /** true when the browser refused: only a tap can re-open the prompt */
    denied,
    facing,
    canSwitch,
    start,
    switchCamera,
  }
}
