import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { checkpointById } from '../../data/locations.js'
import { elderById } from '../../data/elders.js'
import { BADGES } from '../../data/rewards.js'
import { workshopSuggestionsFor } from '../../data/workshops.js'
import { storage } from '../../lib/storage.js'
import { useStore } from '../../lib/useStore.js'
import { usePosition } from '../../lib/position.jsx'
import {
  bearing,
  distanceM,
  fmtDistance,
  FOUND_RADIUS_M,
  hintFor,
  NEAR_RADIUS_M,
  relativeAngle,
} from '../../lib/geo.js'
import { useHeading } from '../../lib/useHeading.js'
import ClipPlayer, { ElderReveal } from '../../components/ClipPlayer.jsx'
import EncourageBox from '../../components/EncourageBox.jsx'
import WorkshopInvite from '../../components/WorkshopInvite.jsx'
import { Button } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'

/**
 * The hunt runs in one of two modes.
 *
 * live — real GPS fix plus a real compass heading. The arrow points at the
 *   checkpoint's true bearing and "ซ้าย/ขวา/ข้างหลัง" is where the explorer
 *   must actually turn. Still not computer vision: nothing tracks the world
 *   through the lens, it is sensors plus geometry.
 * demo — no compass (desktop, denied permission, in-app browser) or a
 *   simulated position. Synthetic hints on a timer, exactly as before.
 */
const SIM_HINTS = [
  { text: 'ซ้าย!', rot: -90 },
  { text: 'ขวา!', rot: 90 },
  { text: 'ข้างหลัง!', rot: 180 },
  { text: 'ตรงไป!', rot: 0 },
]

const heatOf = (v) =>
  v > 66 ? { label: 'เย็น', tone: '#B38CC0' } : v > 33 ? { label: 'อุ่น', tone: '#FFD3A2' } : { label: 'ร้อนมาก!', tone: '#D9502F' }

export default function ARScan() {
  const { checkpointId } = useParams()
  const navigate = useNavigate()
  const state = useStore()
  const pos = usePosition()
  const cp = checkpointById(checkpointId)
  const elder = cp ? elderById(cp.elderId) : null

  const compass = useHeading()

  const [phase, setPhase] = useState('hunting') // hunting | found | clip | reward
  const [cam, setCam] = useState('starting') // starting | on | off | blocked
  const [camMsg, setCamMsg] = useState('')
  const [simHeat, setSimHeat] = useState(100)
  const [simHint, setSimHint] = useState(SIM_HINTS[0])
  const [stream, setStream] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  // Bumped whenever a camera attempt is superseded, so a getUserMedia
  // that resolves late cannot hand its stream to a screen that moved on.
  const camGen = useRef(0)
  const wasNew = useRef(false)

  const realDist =
    cp && pos.position ? distanceM(pos.position, [cp.lat, cp.lng]) : null

  // Real tracking needs both halves: a genuine fix and a genuine heading.
  const liveTracking = !!cp && !pos.isSimulated && realDist != null && compass.isLive

  let hint, heat
  if (liveTracking) {
    const delta = relativeAngle(compass.heading, bearing(pos.position, [cp.lat, cp.lng]))
    hint = hintFor(delta)
    heat = Math.max(0, Math.min(100, (realDist / NEAR_RADIUS_M) * 100))
  } else {
    hint = simHint
    heat = simHeat
  }

  const onTarget = liveTracking && realDist <= FOUND_RADIUS_M && Math.abs(hint.rot) <= 45

  /* ── camera ── */
  const startCamera = useCallback(async () => {
    // getUserMedia only exists on secure origins (https or localhost).
    if (!navigator.mediaDevices?.getUserMedia) {
      setCam('blocked')
      setCamMsg(
        window.isSecureContext
          ? 'เบราว์เซอร์นี้ไม่รองรับการเปิดกล้อง ลองเปิดด้วย Chrome หรือ Safari'
          : 'ต้องเปิดผ่าน https จึงจะใช้กล้องได้',
      )
      return
    }
    const gen = ++camGen.current
    setCam('starting')
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      // A remount or a fast retry can land here after this attempt was
      // superseded — hand the camera straight back rather than leaving a
      // second one running behind the screen.
      if (gen !== camGen.current) {
        s.getTracks().forEach((t) => t.stop())
        return
      }
      streamRef.current = s
      // Handing the stream to the element is the attach effect's job. Doing
      // it here used to mean assigning to a ref that was still null, because
      // the <video> did not exist until setCam('on') had already run.
      setStream(s)
      setCam('on')
    } catch (err) {
      setCam('blocked')
      setCamMsg(
        err?.name === 'NotAllowedError'
          ? 'ยังไม่ได้อนุญาตให้ใช้กล้อง — กดอนุญาตในเบราว์เซอร์แล้วลองอีกครั้ง'
          : err?.name === 'NotFoundError'
            ? 'ไม่พบกล้องบนอุปกรณ์นี้'
            : 'เปิดกล้องไม่ได้ (บางแอปที่เปิดเว็บในตัว เช่น LINE หรือ Facebook ไม่อนุญาต) — ลองเปิดใน Chrome หรือ Safari',
      )
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      camGen.current += 1
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [startCamera])

  /* The <video> is mounted for the whole hunt, so by the time a stream
     exists there is always a real element to give it to. */
  useEffect(() => {
    const el = videoRef.current
    if (!el || !stream) return
    el.srcObject = stream
    // iOS Safari will not start a stream on autoplay alone.
    el.play().catch(() => {
      /* muted + playsInline lets it start on its own */
    })
    return () => {
      el.srcObject = null
    }
  }, [stream])

  // Keep a live GPS watch running for the whole hunt.
  useEffect(() => {
    if (!pos.isSimulated) pos.startWatching()
  }, [pos])

  /* ── demo hunt: heat decays on its own so a presentation always converges ── */
  useEffect(() => {
    if (phase !== 'hunting' || liveTracking) return
    const decay = setInterval(() => setSimHeat((v) => Math.max(0, v - 3.5)), 500)
    const swap = setInterval(
      () => setSimHint(SIM_HINTS[Math.floor(Math.random() * SIM_HINTS.length)]),
      2200,
    )
    return () => {
      clearInterval(decay)
      clearInterval(swap)
    }
  }, [phase, liveTracking])

  /* ── found: real arrival, or the demo hunt reaching zero ── */
  useEffect(() => {
    if (phase !== 'hunting') return
    if (liveTracking ? onTarget : heat <= 0) {
      setPhase('found')
      if (navigator.vibrate) navigator.vibrate([40, 60, 90])
    }
  }, [phase, liveTracking, onTarget, heat])

  const step = () => {
    setSimHeat((v) => Math.max(0, v - 22))
    setSimHint(SIM_HINTS[Math.floor(Math.random() * SIM_HINTS.length)])
  }

  const finishClip = useCallback(() => {
    if (!cp) return
    wasNew.current = !storage.isDiscovered(cp.id)
    storage.addDiscovery(cp)
    setPhase('reward')
  }, [cp])

  if (!cp) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="text-lg font-semibold">ไม่พบจุดตรวจนี้</p>
          <Button className="mt-4" onClick={() => navigate('/map')}>
            กลับไปที่แผนที่
          </Button>
        </div>
      </div>
    )
  }

  const heatInfo = heatOf(heat)
  const found = state.discoveries.find((d) => d.checkpointId === cp.id)
  const earned = BADGES.filter((b) => b.need === state.discoveries.length)
  // Null only where the whole trail teaches nothing.
  const suggestion = workshopSuggestionsFor(cp)

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-black">
      {/* ── camera feed (or its stand-in) ──
          The <video> is never unmounted: a video element that only appears
          once the camera is already open is one the stream was never handed
          to, which is a black screen over a camera that is genuinely on. */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`fixed inset-0 h-full w-full object-cover ${cam === 'on' ? '' : 'opacity-0'}`}
      />
      {cam !== 'on' && (
        <div
          className="fixed inset-0"
          style={{
            background:
              'radial-gradient(120% 80% at 30% 20%, #653877 0%, #501D65 45%, #2B0F30 100%)',
          }}
        />
      )}
      {/* The scrim keeps white text legible over whatever the lens sees, so
          it lifts once there is a real feed underneath to look at — every
          text block on this screen carries its own backing anyway. */}
      {cam === 'on' ? (
        <>
          <div className="fixed inset-0 bg-gradient-to-b from-[#2B0F30]/55 via-[#2B0F30]/20 to-[#2B0F30]/75" />
          <div
            className="fixed inset-0"
            style={{ background: 'radial-gradient(120% 70% at 50% 45%, transparent 0%, rgba(43,15,48,.45) 100%)' }}
          />
        </>
      ) : (
        <>
          <div className="fixed inset-0 bg-gradient-to-b from-[#2B0F30]/85 via-[#2B0F30]/55 to-[#2B0F30]/95" />
          <div
            className="fixed inset-0"
            style={{ background: 'radial-gradient(120% 70% at 50% 45%, transparent 0%, rgba(43,15,48,.72) 100%)' }}
          />
        </>
      )}

      {/* ── top bar ── */}
      <div
        className="fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <button
          onClick={() => navigate('/map')}
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/20 backdrop-blur"
          aria-label="ปิดหน้าสแกน"
        >
          <Icon name="close" size={20} />
        </button>
        <div className="max-w-[62%] rounded-2xl bg-black/50 px-3.5 py-2 text-right ring-1 ring-white/15 backdrop-blur">
          <p className="text-[13px] font-semibold text-white">{cp.name}</p>
          <p className="text-[11px] text-lavender300">
            {pos.isSimulated
              ? 'ตำแหน่งจำลอง (โหมดสาธิต)'
              : realDist != null
                ? `GPS ห่าง ${fmtDistance(realDist)}${pos.accuracy ? ` · ±${Math.round(pos.accuracy)} ม.` : ''}`
                : pos.geoState === 'denied'
                  ? 'ยังไม่ได้อนุญาตตำแหน่ง'
                  : 'กำลังหาสัญญาณ GPS'}
          </p>
          <p className={`text-[11px] font-semibold ${liveTracking ? 'text-gold200' : 'text-lavender300'}`}>
            {liveTracking ? 'เข็มทิศจริง · ติดตามทิศทางอยู่' : 'ทิศทางจำลอง'}
          </p>
        </div>
      </div>

      {cam === 'blocked' && phase === 'hunting' && (
        <div className="fixed inset-x-0 top-24 z-30 mx-auto max-w-xs rounded-2xl bg-black/60 px-4 py-3 text-center ring-1 ring-white/15">
          <p className="text-xs leading-relaxed text-lavender300">{camMsg}</p>
          <button
            onClick={startCamera}
            className="mt-2 min-h-[40px] cursor-pointer rounded-full bg-white/15 px-4 text-xs font-semibold text-white hover:bg-white/25"
          >
            ลองเปิดกล้องอีกครั้ง
          </button>
          <p className="mt-2 text-[11px] text-lavender300">ขั้นตอนอื่นยังทำงานได้ตามปกติ</p>
        </div>
      )}

      {/* ── phase: hunting ── */}
      {phase === 'hunting' && (
        <div className="relative z-20 flex min-h-dvh flex-col items-center justify-center px-6 pb-32 pt-24">
          <div className="relative grid h-64 w-64 place-items-center">
            <div className="orbit-ring absolute h-64 w-64" />
            <div className="orbit-ring absolute h-44 w-44 opacity-70" />
            <div
              className="anim-ring absolute h-64 w-64 rounded-full"
              style={{ border: `2px solid ${heatInfo.tone}` }}
            />
            <div className="anim-sweep absolute h-64 w-64">
              <div
                className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom"
                style={{ background: `linear-gradient(to top, ${heatInfo.tone}, transparent)` }}
              />
            </div>
            <div
              className={`grid h-28 w-28 place-items-center rounded-full ${
                liveTracking ? 'transition-transform duration-150' : 'transition-transform duration-500'
              }`}
              style={{ transform: `rotate(${hint.rot}deg)` }}
            >
              <svg width="70" height="70" viewBox="0 0 70 70" aria-hidden="true">
                <path
                  d="M35 10 L52 46 L35 37 L18 46 Z"
                  fill={heatInfo.tone}
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <p
            className="mt-6 font-display text-5xl tracking-tight"
            style={{ color: heatInfo.tone }}
            aria-live="polite"
          >
            {hint.text}
          </p>
          <p className="mt-2 text-sm text-white/80">
            สัญญาณตอนนี้: <span className="font-semibold">{heatInfo.label}</span>
          </p>

          <div className="mt-5 w-full max-w-xs">
            <div
              className="h-2.5 overflow-hidden rounded-full bg-white/15"
              role="progressbar"
              aria-valuenow={Math.round(100 - heat)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="ความใกล้ผู้สูงอายุ"
            >
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${100 - heat}%`, background: heatInfo.tone }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-lavender300">
              {liveTracking
                ? `หันตัวตามลูกศร แล้วเดินต่อจนเหลือไม่เกิน ${FOUND_RADIUS_M} เมตร`
                : 'กวาดกล้องไปตามลูกศร แล้วกดยืนยันเมื่อหันไปทางนั้นแล้ว'}
            </p>
          </div>

          {liveTracking ? (
            <div className="mt-5 w-full max-w-xs text-center">
              <p className="font-display text-3xl text-white">{fmtDistance(realDist)}</p>
              <p className="mt-1 text-xs text-lavender300">
                เหลืออีกเท่านี้ถึงจุดตรวจ · ลูกศรชี้ตามเข็มทิศจริงของเครื่อง
              </p>
              <button
                onClick={() => pos.simulateNear(cp)}
                className="mt-4 min-h-[44px] w-full cursor-pointer rounded-full border border-gold200/35 text-sm font-semibold text-gold200 transition-colors hover:bg-gold200/10"
              >
                ข้ามไปโหมดสาธิตแทน
              </button>
            </div>
          ) : (
            <>
              {compass.state === 'needs-permission' && !pos.isSimulated && (
                <button
                  onClick={compass.request}
                  className="mt-5 flex min-h-[48px] w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-full border border-gold200/45 text-sm font-semibold text-gold200 transition-colors hover:bg-gold200/10"
                >
                  <Icon name="compass" size={18} />
                  เปิดเข็มทิศ เพื่อชี้ทิศทางจริง
                </button>
              )}
              <Button size="lg" className="mt-4 w-full max-w-xs" onClick={step}>
                <Icon name="compass" size={20} />
                หันไปทาง{hint.text.replace('!', '')}แล้ว
              </Button>
              <p className="mt-3 max-w-xs text-center text-[11px] leading-relaxed text-lavender300">
                {pos.isSimulated
                  ? 'กำลังใช้ตำแหน่งจำลองจากโหมดสาธิต'
                  : compass.state === 'denied'
                    ? 'ไม่ได้อนุญาตให้ใช้เข็มทิศ จึงใช้ทิศทางจำลองแทน'
                    : compass.state === 'unsupported'
                      ? 'อุปกรณ์นี้ไม่มีเข็มทิศ (เช่น คอมพิวเตอร์) จึงใช้ทิศทางจำลองแทน'
                      : 'กำลังรอสัญญาณเข็มทิศ'}
              </p>
            </>
          )}
        </div>
      )}

      {/* ── phase: found ── */}
      {phase === 'found' && (
        <div className="anim-risein relative z-20 flex min-h-dvh flex-col items-center justify-center px-6 pb-28 pt-24 text-center">
          <ElderReveal elder={elder} talking={false} />
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold200">
            พบผู้สูงอายุแล้ว
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{elder?.name}</h2>
          <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-lavender300">{elder?.craft}</p>
          <Button size="lg" className="mt-6 w-full max-w-xs" onClick={() => setPhase('clip')}>
            <Icon name="ear" size={20} />
            ฟังเรื่องที่ท่านอยากเล่า
          </Button>
        </div>
      )}

      {/* ── phase: clip ── */}
      {phase === 'clip' && (
        <div className="relative z-20 flex min-h-dvh flex-col justify-end px-4 pb-8 pt-24">
          <div className="pointer-events-none absolute inset-x-0 top-24 grid place-items-center">
            <ElderReveal elder={elder} talking />
          </div>
          <div className="anim-risein relative mx-auto w-full max-w-lg rounded-3xl bg-[#3A1244]/92 p-5 ring-1 ring-white/15 backdrop-blur-lg">
            <ClipPlayer clip={cp.clip} elder={elder} onEnded={finishClip} />
            <button
              onClick={finishClip}
              className="mt-4 w-full cursor-pointer rounded-full border border-white/15 py-3 text-sm font-semibold text-lavender300 transition-colors hover:text-white"
            >
              จบการฟัง และเก็บเรื่องนี้ไว้
            </button>
          </div>
        </div>
      )}

      {/* ── phase: reward ── */}
      {phase === 'reward' && (
        <div className="anim-risein relative z-20 flex min-h-dvh flex-col items-center justify-center px-6 pb-28 pt-24 text-center">
          <div className="relative grid place-items-center">
            <div className="orbit-ring absolute h-40 w-40" />
            <div className="grid h-24 w-24 place-items-center rounded-full bg-gold200 text-maroon900">
              <Icon name="check" size={44} stroke={2.6} />
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-semibold">
            {wasNew.current ? 'เก็บเรื่องเล่าใหม่แล้ว' : 'ฟังซ้ำเรียบร้อย'}
          </h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-lavender300">
            “{cp.clip.title}” ถูกบันทึกไว้ในประวัติการค้นพบของคุณแล้ว
          </p>

          <div className="mt-6 flex gap-3">
            <div className="glass rounded-2xl px-5 py-3">
              <p className="gold-number font-display text-2xl">+{wasNew.current ? cp.clip.points : 0}</p>
              <p className="mt-1 text-[11px] text-lavender300">แต้มภูมิปัญญา</p>
            </div>
            <div className="glass rounded-2xl px-5 py-3">
              <p className="gold-number font-display text-2xl">{state.discoveries.length}</p>
              <p className="mt-1 text-[11px] text-lavender300">จุดที่ค้นพบ</p>
            </div>
          </div>

          {wasNew.current && earned.length > 0 && (
            <div className="mt-5 flex items-center gap-2.5 rounded-full bg-coral500 px-4 py-2.5 text-sm font-semibold">
              <Icon name="medal" size={18} />
              ได้เหรียญใหม่: {earned.map((b) => b.name).join(', ')}
            </div>
          )}

          {/* Going and doing it belongs here too. The craft was just
              explained by the person who does it, and the points to book
              with are the ones awarded two lines up. */}
          {suggestion && (
            <div className="mt-6">
              <WorkshopInvite
                workshop={suggestion.primary}
                reason={suggestion.reason}
                others={suggestion.others}
                elder={elder}
              />
            </div>
          )}

          {/* Answering back belongs here, while the story is still in the ear —
              not three taps away in the history screen. */}
          <div className="mt-6 w-full max-w-sm rounded-3xl bg-black/35 p-4 ring-1 ring-white/12">
            <EncourageBox clip={cp.clip} elder={elder} checkpointName={cp.name} />
          </div>

          <div className="mt-6 flex w-full max-w-sm flex-col gap-2.5">
            <Button
              size="lg"
              onClick={() => {
                pos.clearSim()
                navigate('/map')
              }}
            >
              กลับไปเดินต่อ
              <Icon name="arrowRight" size={18} />
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/profile')}>
              ดูประวัติการค้นพบ
            </Button>
          </div>

          {found && (
            <p className="mt-4 text-[11px] text-lavender300">
              ค้นพบครั้งแรกเมื่อ{' '}
              {new Date(found.at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long' })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
