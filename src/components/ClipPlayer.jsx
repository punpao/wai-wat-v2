import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { mmss } from './ui.jsx'
import { ElderAvatar } from './ElderSprite.jsx'
import ElderPhoto from './ElderPhoto.jsx'

/**
 * ClipPlayer — plays a "knowledge clip".
 *
 * The prototype ships no audio/video files, so playback is a timed
 * narration: lines surface one at a time at the clip's real pace. Same
 * component powers the AR reveal and the replay from history.
 */
export default function ClipPlayer({ clip, elder, compact = false, onEnded }) {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(true)
  const raf = useRef(0)
  const last = useRef(0)
  const ended = useRef(false)

  useEffect(() => {
    setT(0)
    setPlaying(true)
    ended.current = false
  }, [clip.id])

  useEffect(() => {
    if (!playing) return
    last.current = performance.now()
    const tick = (now) => {
      const dt = (now - last.current) / 1000
      last.current = now
      setT((v) => Math.min(v + dt, clip.duration))
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [playing, clip.duration])

  useEffect(() => {
    if (t >= clip.duration && !ended.current) {
      ended.current = true
      setPlaying(false)
      onEnded?.()
    }
  }, [t, clip.duration, onEnded])

  const per = clip.duration / clip.lines.length
  const idx = Math.min(clip.lines.length - 1, Math.floor(t / per))
  const pct = (t / clip.duration) * 100

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex items-center gap-3">
          <ElderAvatar elder={elder} size={52} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{elder?.name}</p>
            <p className="truncate text-xs text-lavender300">{elder?.craft}</p>
          </div>
        </div>
      )}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold200">
          {clip.topic}
        </p>
        <h3 className="mt-1 text-lg font-semibold leading-snug">{clip.title}</h3>
      </div>

      {/* transcript — the line being "spoken" is the one in focus */}
      <div className="min-h-[132px] rounded-2xl bg-black/25 p-4 ring-1 ring-white/10">
        <ul className="space-y-2.5">
          {clip.lines.map((line, i) => (
            <li
              key={i}
              className={`flex gap-2.5 text-[15px] leading-relaxed transition-opacity duration-300 ${
                i === idx
                  ? 'text-white'
                  : i < idx
                    ? 'text-white/40'
                    : 'text-white/15'
              }`}
            >
              <Icon
                name="quote"
                size={14}
                className={`mt-1.5 shrink-0 ${i === idx ? 'text-gold200' : 'text-transparent'}`}
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (t >= clip.duration) {
              setT(0)
              ended.current = false
            }
            setPlaying((v) => !v)
          }}
          aria-label={playing ? 'หยุดชั่วคราว' : 'เล่น'}
          className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-full bg-coral500 text-white transition-colors hover:bg-[#e35c39]"
        >
          <Icon name={playing ? 'pause' : 'play'} size={20} filled={!playing} />
        </button>
        <div className="min-w-0 flex-1">
          <div
            className="h-2 overflow-hidden rounded-full bg-white/12"
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="ความคืบหน้าของคลิป"
          >
            <div
              className="h-full rounded-full bg-gold200 transition-[width] duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-lavender300">
            <span>{mmss(t)}</span>
            <span>{mmss(clip.duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * The elder appearing over the camera feed.
 *
 * A photograph and the illustrated sprite want different staging: the
 * drawing can bob and mouth its lines, the photo has to be lit into the
 * scene and left to hold still. <ElderPhoto /> covers the fallback, so
 * `photo` only decides the staging around the figure.
 */
export function ElderReveal({ elder, talking }) {
  const photo = !!elder?.photo
  return (
    <div
      className={`relative grid place-items-center ${photo ? 'anim-floatysoft' : 'anim-floaty'}`}
    >
      <div className="orbit-ring absolute h-56 w-56 opacity-50" />
      <div className="orbit-ring absolute h-72 w-72 opacity-25" />
      {photo && (
        <div className={`ar-halo absolute h-72 w-72 ${talking ? 'anim-speakglow' : 'opacity-70'}`} />
      )}
      <ElderPhoto elder={elder} size={190} talking={talking} className="relative" />
    </div>
  )
}
