import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { checkpointById } from '../../data/locations.js'
import { elderById } from '../../data/elders.js'
import { BADGES } from '../../data/rewards.js'
import { storage } from '../../lib/storage.js'
import { useStore } from '../../lib/useStore.js'
import { usePosition } from '../../lib/position.jsx'
import { distanceM, fmtDistance, NEAR_RADIUS_M } from '../../lib/geo.js'
import ClipPlayer, { ElderReveal } from '../../components/ClipPlayer.jsx'
import { Button, useToast } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'

/** Simulated hot/cold hints. No CV, no SLAM — a synthetic bearing on a timer. */
const HINTS = [
  { text: 'ซ้าย!', rot: -90 },
  { text: 'ขวา!', rot: 90 },
  { text: 'ข้างหลัง!', rot: 180 },
  { text: 'ตรงไป!', rot: 0 },
  { text: 'เงยขึ้นอีกนิด!', rot: -45 },
]

const heatOf = (v) =>
  v > 66 ? { label: 'เย็น', tone: '#B38CC0' } : v > 33 ? { label: 'อุ่น', tone: '#FFD3A2' } : { label: 'ร้อนมาก!', tone: '#D9502F' }

export default function ARScan() {
  const { checkpointId } = useParams()
  const navigate = useNavigate()
  const state = useStore()
  const pos = usePosition()
  const toast = useToast()
  const cp = checkpointById(checkpointId)
  const elder = cp ? elderById(cp.elderId) : null

  const [phase, setPhase] = useState('hunting') // hunting | found | clip | reward
  const [cam, setCam] = useState('starting') // starting | on | off
  const [heat, setHeat] = useState(100)
  const [hint, setHint] = useState(HINTS[0])
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const wasNew = useRef(false)

  /* ── camera ── */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        streamRef.current = s
        if (videoRef.current) videoRef.current.srcObject = s
        setCam('on')
      } catch {
        // Camera blocked or unavailable — the demo continues on a painted backdrop.
        setCam('off')
      }
    })()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  /* ── the hunt: heat decays on its own so a demo always converges ── */
  useEffect(() => {
    if (phase !== 'hunting') return
    const decay = setInterval(() => setHeat((v) => Math.max(0, v - 3.5)), 500)
    const swap = setInterval(
      () => setHint(HINTS[Math.floor(Math.random() * HINTS.length)]),
      2200,
    )
    return () => {
      clearInterval(decay)
      clearInterval(swap)
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'hunting' && heat <= 0) {
      setPhase('found')
      if (navigator.vibrate) navigator.vibrate([40, 60, 90])
    }
  }, [heat, phase])

  const step = () => {
    setHeat((v) => Math.max(0, v - 22))
    setHint(HINTS[Math.floor(Math.random() * HINTS.length)])
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

  const realDist = pos.position ? distanceM(pos.position, [cp.lat, cp.lng]) : null
  const heatInfo = heatOf(heat)
  const found = state.discoveries.find((d) => d.checkpointId === cp.id)
  const earned = BADGES.filter((b) => b.need === state.discoveries.length)

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black">
      {/* ── camera feed (or its stand-in) ── */}
      {cam === 'off' ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 80% at 30% 20%, #653877 0%, #501D65 45%, #2B0F30 100%)',
          }}
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2B0F30]/85 via-[#2B0F30]/55 to-[#2B0F30]/95" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 70% at 50% 45%, transparent 0%, rgba(43,15,48,.72) 100%)' }}
      />

      {/* ── top bar ── */}
      <div
        className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <button
          onClick={() => navigate('/map')}
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/20 backdrop-blur"
          aria-label="ปิดหน้าสแกน"
        >
          <Icon name="close" size={20} />
        </button>
        <div className="rounded-2xl bg-black/45 px-3.5 py-2 text-right ring-1 ring-white/15 backdrop-blur">
          <p className="text-[13px] font-semibold text-white">{cp.name}</p>
          <p className="text-[11px] text-lavender300">
            {pos.isSimulated ? 'ตำแหน่งจำลอง (โหมดสาธิต)' : realDist != null ? `GPS ห่าง ${fmtDistance(realDist)}` : 'ไม่มีสัญญาณ GPS'}
          </p>
        </div>
      </div>

      {cam === 'off' && phase === 'hunting' && (
        <p className="absolute inset-x-0 top-24 z-30 mx-auto max-w-xs rounded-2xl bg-black/50 px-4 py-2.5 text-center text-xs leading-relaxed text-lavender300 ring-1 ring-white/15">
          ไม่ได้เปิดกล้อง จึงแสดงพื้นหลังจำลองแทน — ขั้นตอนอื่นทำงานตามปกติ
        </p>
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
              className="grid h-28 w-28 place-items-center rounded-full transition-transform duration-500"
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
              aria-label="ความใกล้ผู้เฒ่า"
            >
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${100 - heat}%`, background: heatInfo.tone }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-lavender300">
              กวาดกล้องไปตามลูกศร แล้วกดยืนยันเมื่อหันไปทางนั้นแล้ว
            </p>
          </div>

          <Button size="lg" className="mt-5 w-full max-w-xs" onClick={step}>
            <Icon name="compass" size={20} />
            หันไปทาง{hint.text.replace('!', '')}แล้ว
          </Button>
        </div>
      )}

      {/* ── phase: found ── */}
      {phase === 'found' && (
        <div className="anim-risein relative z-20 flex min-h-dvh flex-col items-center justify-center px-6 pb-28 pt-24 text-center">
          <ElderReveal elder={elder} talking={false} />
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold200">
            พบผู้เฒ่าแล้ว
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
        <div className="anim-risein relative z-20 flex min-h-dvh flex-col items-center justify-center px-6 pb-24 pt-24 text-center">
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

          <div className="mt-7 flex w-full max-w-xs flex-col gap-2.5">
            <Button size="lg" onClick={() => navigate('/profile')}>
              ดูประวัติการค้นพบ
              <Icon name="arrowRight" size={18} />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                pos.clearSim()
                navigate('/map')
              }}
            >
              กลับไปเดินต่อ
            </Button>
            <button
              onClick={() => {
                storage.sendEncouragement({
                  clipId: cp.clip.id,
                  text: 'ขอบคุณที่เล่าให้ฟังครับ/ค่ะ',
                  kind: 'cheer',
                })
                toast('ส่งกำลังใจถึงผู้เฒ่าแล้ว', 'good')
              }}
              className="flex cursor-pointer items-center justify-center gap-2 py-2 text-sm font-semibold text-gold200 hover:text-white"
            >
              <Icon name="heart" size={17} />
              ส่งกำลังใจให้{elder?.short}
            </button>
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
