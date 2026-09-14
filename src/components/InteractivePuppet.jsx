import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Icon from './Icon.jsx'

/**
 * The puppet that lifts out of the case and can be pushed around.
 *
 * A real หนังใหญ่ panel is rigid — the puppeteer moves the whole thing, it
 * never bends. So this does not deform: it swings on its sticks like the
 * genuine article, tilting into whatever pushes it and settling back under
 * spring and damping when let go.
 *
 * Two things can push it. Tilting the phone is the one worth having, because
 * that is how you hold a panel up: the device's own gamma/beta feed the same
 * spring the finger does, so the puppet leans as the handset leans. iOS will
 * only hand over motion after an explicit tap, so there is a button for it,
 * and dragging always works whether or not the sensor ever appears.
 *
 * The parent needs the live transform for other things on screen, so the
 * current pose is exposed through a ref rather than lifted into state —
 * sixty setStates a second while dragging would be a bad trade.
 */
const InteractivePuppet = forwardRef(function InteractivePuppet(
  { src, at, onFirstMove },
  ref,
) {
  const wrapRef = useRef(null)
  const imgRef = useRef(null)
  const moved = useRef(false)

  // position, tilt and their velocities live outside React for the raf loop
  const s = useRef({ x: 0, y: 0, vx: 0, rot: 0, vrot: 0, dragging: false, px: 0, py: 0, tx: 0, trot: 0 })
  /* The handset angle this puppet calls "level". It has to outlive the
     listener: the effect that attaches it re-runs whenever the parent
     re-renders, and a base kept in that closure would be re-taken from
     whatever angle the phone happened to be at — so a tilt left would read
     as level, and returning to level would read as a tilt right. */
  const level = useRef(null)
  const [entered, setEntered] = useState(false)
  const [motion, setMotion] = useState('idle') // idle | live | denied | unavailable

  useImperativeHandle(ref, () => ({
    current: () => ({ ...s.current }),
    node: () => imgRef.current,
  }))

  const nudged = useCallback(() => {
    if (moved.current) return
    moved.current = true
    onFirstMove?.()
  }, [onFirstMove])

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60)
    return () => clearTimeout(t)
  }, [])

  /* ── the phone's own tilt ───────────────────────────────────────────── */
  const attachMotion = useCallback(() => {
    const onTilt = (e) => {
      // gamma is the left/right roll, beta the front/back pitch
      if (e.gamma == null && e.beta == null) return
      const g = e.gamma ?? 0
      const b = e.beta ?? 0
      if (!level.current) level.current = { g, b }
      const dg = Math.max(-28, Math.min(28, g - level.current.g))
      const db = Math.max(-22, Math.min(22, b - level.current.b))
      const st = s.current
      st.tx = dg * 2.6
      st.trot = dg * 0.42
      st.ty = db * 0.9
      if (Math.abs(dg) > 3) nudged()
      setMotion('live')
    }
    window.addEventListener('deviceorientation', onTilt)
    return () => window.removeEventListener('deviceorientation', onTilt)
  }, [nudged])

  useEffect(() => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      setMotion('unavailable')
      return
    }
    // iOS gates the sensor behind a user gesture; everyone else just gets it
    if (typeof DeviceOrientationEvent.requestPermission === 'function') return
    return attachMotion()
  }, [attachMotion])

  const askForMotion = async () => {
    try {
      const res = await DeviceOrientationEvent.requestPermission()
      if (res === 'granted') {
        attachMotion()
        setMotion('live')
      } else {
        setMotion('denied')
      }
    } catch {
      setMotion('denied')
    }
  }

  const needsPermission =
    motion === 'idle' &&
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'

  /* ── the spring ─────────────────────────────────────────────────────── */
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const st = s.current
      if (!st.dragging) {
        // home is wherever the phone is currently tilted to, so letting go
        // of a tilted handset settles against the tilt rather than to zero
        st.vx += (st.tx - st.x) * 0.06
        st.vx *= 0.86
        st.x += st.vx
        st.vrot += (st.trot - st.rot) * 0.08
        st.vrot *= 0.88
        st.rot += st.vrot
        st.y += ((st.ty ?? 0) - st.y) * 0.1
      }
      if (imgRef.current) {
        imgRef.current.style.transform =
          `translate3d(${st.x.toFixed(2)}px, ${st.y.toFixed(2)}px, 0) rotate(${st.rot.toFixed(2)}deg)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const down = (e) => {
    const st = s.current
    st.dragging = true
    st.px = e.clientX
    st.py = e.clientY
    wrapRef.current?.setPointerCapture?.(e.pointerId)
    nudged()
  }

  const move = (e) => {
    const st = s.current
    if (!st.dragging) return
    const dx = e.clientX - st.px
    const dy = e.clientY - st.py
    st.px = e.clientX
    st.py = e.clientY
    // the sticks are held at the bottom, so sideways push mostly becomes tilt
    st.x = Math.max(-90, Math.min(90, st.x + dx))
    st.y = Math.max(-40, Math.min(40, st.y + dy * 0.45))
    st.rot = Math.max(-16, Math.min(16, st.rot + dx * 0.14))
    st.vx = dx * 0.4
    st.vrot = dx * 0.08
  }

  const up = (e) => {
    s.current.dragging = false
    wrapRef.current?.releasePointerCapture?.(e.pointerId)
  }

  const { w = 52, left = 46, top = 30 } = at ?? {}

  return (
    <>
      <div
        ref={wrapRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="absolute z-20 cursor-grab touch-none active:cursor-grabbing"
        style={{ width: `${w}%`, left: `${left}%`, top: `${top}%` }}
      >
        <img
          ref={imgRef}
          src={src}
          alt="ตัวหนังใหญ่"
          draggable={false}
          className="w-full select-none drop-shadow-[0_22px_34px_rgba(0,0,0,0.55)]"
          style={{
            opacity: entered ? 1 : 0,
            scale: entered ? '1' : '0.72',
            transition: 'opacity .55s ease, scale .55s cubic-bezier(.2,1.3,.4,1)',
          }}
        />
      </div>

      {needsPermission && (
        <button
          onClick={askForMotion}
          className="absolute left-1/2 top-[20%] z-30 flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full bg-black/60 px-4 py-2.5 text-xs font-semibold text-gold200 backdrop-blur-sm"
        >
          <Icon name="compass" size={16} />
          เปิดให้เอียงเครื่องเพื่อขยับตัวหนัง
        </button>
      )}
    </>
  )
})

export default InteractivePuppet
