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
 * The walk itself — the trail's stops, played beat by beat, end to end.
 *
 * The stops run together: finishing the museum does not drop the visitor
 * back on the map to set off again, it rolls straight into the theatre.
 * The guide's last line at one stop is already the handoff to the next
 * ("เดินออกไปทางนั้น…"), so putting a map screen in between broke a
 * sentence in half. The only thing between them now is a chapter card that
 * marks the boundary and moves on by itself.
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

  /* Resuming is for arriving at a stop, not for flowing into one. Someone
     who walked half the theatre last week and is now replaying the trail
     from the museum wants the theatre from its first beat, so only a
     direct entry (this component mounting) picks the stored beat back up. */
  const resumeAt = (cpId) => {
    const prog = storage.get().progress[placeId]
    if (!prog || (prog.done ?? []).includes(cpId)) return 0
    return Math.min(prog.beat?.[cpId] ?? 0, Math.max(beatsFor(place, cpId).length - 1, 0))
  }

  const [cursor, setCursor] = useState(() => ({ cp: checkpointId, i: resumeAt(checkpointId) }))
  // The route is the single source of truth for which stop is playing; when
  // it moves on, the beat index resets in the same render rather than in an
  // effect, so the new stop never renders for a frame at the old index.
  if (cursor.cp !== checkpointId) setCursor({ cp: checkpointId, i: 0 })
  const i = cursor.cp === checkpointId ? cursor.i : 0
  const setI = (fn) =>
    setCursor((c) => ({ cp: c.cp, i: typeof fn === 'function' ? fn(c.i) : fn }))
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
  const handingOver = ending && !!beat.next

  /* The bar measures the whole trail, not the current stop. In a run that
     never leaves the player, a bar that fills up and starts again at the
     halfway point would read as the tour having ended. */
  const trail = place?.checkpoints ?? []
  const walked = useMemo(() => {
    const lengths = trail.map((c) => beatsFor(place, c.id).length)
    const here = trail.findIndex((c) => c.id === checkpointId)
    const before = lengths.slice(0, Math.max(here, 0)).reduce((a, b) => a + b, 0)
    const total = lengths.reduce((a, b) => a + b, 0) || 1
    return { before, total, order: here + 1, of: trail.length }
  }, [place, trail, checkpointId])

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

  /* The handover. Long enough to read which stop is finished and which is
     coming, short enough that it is a chapter mark rather than a stop —
     and tapping it skips the wait. */
  const goNextStop = useCallback(() => {
    if (!beat?.next) return
    // replace, not push: the trail is one run, so Back should leave the
    // player rather than walk the visitor through stops they already saw
    navigate(`/place/${placeId}/journey/${beat.next}`, { replace: true })
  }, [beat, navigate, placeId])

  useEffect(() => {
    if (!handingOver) return
    const t = setTimeout(goNextStop, 2400)
    return () => clearTimeout(t)
  }, [handingOver, goNextStop])

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

  const nextStop = beat?.next ? checkpointById(place, beat.next) : null
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

      {/* chrome — above the beats, including the full-bleed handover card,
          so the way out of the tour is never covered by the tour */}
      <div
        className="absolute inset-x-0 top-0 z-40 flex items-center gap-3 px-4 pb-3 pt-4"
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
          <p className="truncate text-[13px] font-semibold leading-tight text-white">
            <span className="text-gold200">
              จุด {walked.order}/{walked.of}
            </span>{' '}
            · {cp.name}
          </p>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gold200 transition-[width] duration-500"
              style={{ width: `${((walked.before + i + 1) / walked.total) * 100}%` }}
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

      {/* between stops — marks the boundary, then carries on by itself */}
      {handingOver && (
        <button
          onClick={goNextStop}
          className="absolute inset-0 z-30 flex w-full cursor-pointer flex-col items-center justify-center px-6 text-center"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-gold200 text-maroon900">
            <Icon name="check" size={34} stroke={2.6} />
          </span>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold200">
            จุด {walked.order} เรียบร้อย
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">{cp.name}</h2>

          <span className="my-6 h-10 w-px bg-gradient-to-b from-gold200/70 to-transparent" />

          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender300">
            ต่อไป · จุด {walked.order + 1}
          </p>
          <h3 className="mt-1 max-w-xs text-2xl font-semibold leading-tight text-white">
            {nextStop?.name}
          </h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-lavender300">
            ลุงวิรัชเดินไปรออยู่แล้ว เดี๋ยวพาต่อเลย
          </p>

          <span className="mt-7 h-1 w-32 overflow-hidden rounded-full bg-white/15">
            <span className="anim-handover block h-full rounded-full bg-gold200" />
          </span>
          <span className="mt-3 text-xs text-lavender300">แตะเพื่อไปต่อทันที</span>
        </button>
      )}

      {ending && !handingOver && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-gold200 text-maroon900">
            <Icon name="check" size={40} stroke={2.6} />
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-white">จบเส้นทางแล้ว</h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-lavender300">
            ขอบคุณที่มาเดินกับลุงวิรัชจนจบ ถ้าอยากลองจับตัวหนังจริง มีรอบเวิร์กช็อปให้จองด้วย
          </p>

          <div className="mt-6 w-full max-w-xs space-y-2">
            <Button size="lg" className="w-full" onClick={() => setBooking(true)}>
              <Icon name="calendar" size={20} />
              จองรอบเวิร์กช็อป
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
              กลับหน้าแรก
            </Button>
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
