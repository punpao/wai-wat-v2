import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { beatsFor, checkpointById, placeById } from '../data/places.js'
import { storage } from '../lib/storage.js'
import NarratorSpeech from '../components/Narrator.jsx'
import ScanFrame from '../components/ScanFrame.jsx'
import InteractivePuppet from '../components/InteractivePuppet.jsx'
import PhotoBooth from '../components/PhotoBooth.jsx'
import PuppetShow from '../components/PuppetShow.jsx'
import BookingSheet from '../components/BookingSheet.jsx'
import { Button } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'

/**
 * The walk itself — one checkpoint's script, played beat by beat.
 *
 * This page owns the two things that have to survive a beat change: the
 * scene behind everything, and whatever is standing in front of it. Every
 * scene in the checkpoint is mounted at once and cross-faded, which both
 * preloads them and means a swap never shows a white gap; the puppet is
 * keyed on its own image, so walking from the reveal into the photo keeps
 * the exact angle it was left at instead of springing back.
 *
 * Where each AR element sits comes from the beat, in percentages of the
 * frame, lifted off the placement references that shipped with the artwork.
 * The frame is a fixed phone crop and every scene photograph was cut to it,
 * so a percentage means the same thing on every screen.
 *
 * There is no camera and no computer vision anywhere in here. The "camera
 * view" is a photograph of the spot the visitor is standing in front of,
 * which is what makes the whole tour work offline on a borrowed phone.
 */
export default function Journey() {
  const { placeId, checkpointId } = useParams()
  const navigate = useNavigate()

  const place = placeById(placeId)
  const cp = checkpointById(place, checkpointId)
  const beats = useMemo(() => beatsFor(place, checkpointId), [place, checkpointId])

  const [i, setI] = useState(() => {
    const p = storage.get().progress[placeId]
    if (!p || (p.done ?? []).includes(checkpointId)) return 0
    return Math.min(p.beat?.[checkpointId] ?? 0, Math.max(beats.length - 1, 0))
  })
  const [booth, setBooth] = useState(false)
  const [booking, setBooking] = useState(false)
  const [moved, setMoved] = useState(false)
  const puppetRef = useRef(null)
  // stable, so the puppet's motion listener is not torn down and re-armed
  // every time this page re-renders
  const onFirstMove = useCallback(() => setMoved(true), [])

  /* Every scene used in this checkpoint, and which one each beat sits on —
     a beat without its own scene (the ending card) keeps the last one. */
  const sceneAt = useMemo(() => {
    let last = null
    return beats.map((b) => (last = b.scene ?? last))
  }, [beats])
  const scenes = useMemo(() => [...new Set(sceneAt.filter(Boolean))], [sceneAt])

  const beat = beats[Math.min(i, beats.length - 1)]
  const scene = sceneAt[Math.min(i, beats.length - 1)]
  const ending = beat?.type === 'done'

  useEffect(() => {
    if (!place || !cp || !beats.length) return
    storage.setBeat(placeId, checkpointId, i)
  }, [i, placeId, checkpointId, place, cp, beats.length])

  // Reaching the ending card is what counts as having walked this stop.
  useEffect(() => {
    if (ending) storage.completeCheckpoint(placeId, checkpointId)
  }, [ending, placeId, checkpointId])

  // จบเส้นทาง — the workshop offer is the point of the whole tour, so it
  // comes up on its own rather than waiting to be found.
  useEffect(() => {
    if (!ending || beat.next) return
    const t = setTimeout(() => setBooking(true), 700)
    return () => clearTimeout(t)
  }, [ending, beat])

  useEffect(() => {
    setMoved(false)
  }, [beat?.id])

  if (!place || !cp || !beats.length) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-lavender300">ไม่พบจุดนี้ในเส้นทาง</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>
          กลับหน้าแรก
        </Button>
      </div>
    )
  }

  const next = () => setI((v) => Math.min(v + 1, beats.length - 1))
  const leave = () => navigate(`/place/${placeId}/map`)

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#150618]">
      {/* the scene — a photograph of where the visitor is standing */}
      {scenes.map((src) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden={src !== scene}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            src === scene ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div
        className={`pointer-events-none absolute inset-0 transition-colors duration-500 ${
          ending
            ? 'bg-[#150618]/75'
            : 'bg-gradient-to-b from-[#150618]/45 via-transparent to-[#150618]/65'
        }`}
      />

      {/* what is standing in the scene */}
      {beat.puppet && !ending && (
        <InteractivePuppet
          key={beat.puppet}
          ref={puppetRef}
          src={beat.puppet}
          at={beat.puppetAt}
          onFirstMove={onFirstMove}
        />
      )}
      {beat.performers && <PuppetShow performers={beat.performers} />}

      {/* chrome */}
      <div
        className="absolute inset-x-0 top-0 z-30 flex items-center gap-3 px-4 pb-3 pt-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <button
          onClick={leave}
          aria-label="ออกจากเส้นทาง"
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm"
        >
          <Icon name="close" size={18} />
        </button>
        <div className="min-w-0 flex-1 rounded-full bg-black/45 px-3.5 py-2 backdrop-blur-sm">
          <p className="truncate text-[13px] font-semibold leading-tight text-white">{cp.name}</p>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gold200 transition-[width] duration-500"
              style={{ width: `${((i + 1) / beats.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* the beat */}
      {beat.type === 'scan' && (
        <ScanFrame key={beat.id} title={beat.title} hint={beat.hint} cta={beat.cta} onScanned={next} />
      )}

      {beat.type === 'narrate' && (
        <NarratorSpeech key={beat.id} lines={beat.lines} onDone={next} at={beat.at} />
      )}

      {beat.type === 'reveal' && (
        <>
          {beat.interactHint && !moved && (
            <div className="pointer-events-none absolute inset-x-0 top-[13%] z-30 flex justify-center px-4">
              <span className="anim-floaty rounded-full bg-black/60 px-4 py-2 text-center text-xs font-semibold text-gold200 backdrop-blur-sm">
                {beat.interactHint}
              </span>
            </div>
          )}
          <NarratorSpeech key={beat.id} lines={beat.lines} onDone={next} tap="panel" at={beat.at} />
        </>
      )}

      {beat.type === 'photo' && (
        <>
          <NarratorSpeech
            key={beat.id}
            lines={beat.lines}
            onDone={() => setBooth(true)}
            cta="ถ่ายรูป"
            tap="panel"
            at={beat.at}
          />
          <button
            onClick={next}
            className="absolute right-4 z-40 cursor-pointer rounded-full bg-black/50 px-3.5 py-2 text-xs font-semibold text-lavender300 backdrop-blur-sm"
            style={{ top: 'calc(max(1rem, env(safe-area-inset-top)) + 3.5rem)' }}
          >
            ข้ามการถ่ายรูป
          </button>
        </>
      )}

      {beat.type === 'show' && (
        <NarratorSpeech key={beat.id} lines={beat.lines} onDone={next} tap="panel" at={beat.at} />
      )}

      {ending && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-gold200 text-maroon900">
            <Icon name="check" size={40} stroke={2.6} />
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-white">
            {beat.next ? `${cp.short}เรียบร้อย` : 'จบเส้นทางแล้ว'}
          </h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-lavender300">
            {beat.next
              ? 'เดินต่อไปที่จุดถัดไปในแผนที่ เดี๋ยวลุงวิรัชรออยู่'
              : 'ขอบคุณที่มาเดินกับลุงวิรัชจนจบ ถ้าอยากลองจับตัวหนังจริง มีรอบเวิร์กช็อปให้จองด้วย'}
          </p>

          <div className="mt-6 w-full max-w-xs space-y-2">
            {beat.next ? (
              <Button size="lg" className="w-full" onClick={leave}>
                <Icon name="pin" size={20} />
                ไปที่จุดถัดไป
              </Button>
            ) : (
              <>
                <Button size="lg" className="w-full" onClick={() => setBooking(true)}>
                  <Icon name="calendar" size={20} />
                  จองรอบเวิร์กช็อป
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
                  กลับหน้าแรก
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {booth && beat.post && (
        <PhotoBooth
          post={beat.post}
          onClose={() => {
            setBooth(false)
            next()
          }}
        />
      )}

      <BookingSheet open={booking} onClose={() => setBooking(false)} />
    </div>
  )
}
