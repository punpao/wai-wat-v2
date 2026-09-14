import { useEffect, useState } from 'react'
import { NARRATOR, narratorPose } from '../data/places.js'

/**
 * The guide, as ten stills from one photo sheet.
 *
 * Each line of script names the pose it should be read in, so changing
 * gesture is changing an <img> src. A short squash on every swap covers the
 * cut — without it the figure snaps between poses like a slide change.
 */
export function NarratorFigure({ pose = 'explain', size = 220, flip = false, className = '' }) {
  const [bump, setBump] = useState(0)
  useEffect(() => setBump((b) => b + 1), [pose])

  return (
    <img
      key={bump}
      src={narratorPose(pose)}
      alt={NARRATOR.name}
      className={`anim-posein pointer-events-none select-none drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)] ${className}`}
      style={{
        width: size,
        height: 'auto',
        transform: flip ? 'scaleX(-1)' : undefined,
      }}
    />
  )
}

/**
 * Narrator plus the line being spoken. Tap to move on; the caller decides
 * what happens when the last line is read.
 *
 * `tap` is the one thing worth a prop. On a plain narrated scene the whole
 * screen should advance the script — hunting for a small target while
 * walking is a nuisance. But when the scene has something to handle, a
 * full-screen tap target would eat every drag aimed at it, so the panel
 * takes the taps and leaves the rest of the screen to the puppet.
 */
export default function NarratorSpeech({
  lines,
  onDone,
  cta = 'ต่อไป',
  tap = 'full',
  figureSize = 200,
}) {
  const [i, setI] = useState(0)
  useEffect(() => setI(0), [lines])

  if (!lines?.length) return null
  const line = lines[Math.min(i, lines.length - 1)]
  const last = i >= lines.length - 1

  const advance = () => (last ? onDone?.() : setI((v) => v + 1))

  return (
    <>
      {tap === 'full' && (
        <button
          onClick={advance}
          aria-label={last ? cta : 'อ่านต่อ'}
          className="absolute inset-0 z-10 cursor-pointer"
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col">
        <div className="flex justify-start px-2">
          <NarratorFigure pose={line.pose} size={figureSize} />
        </div>

        <div
          role={tap === 'panel' ? 'button' : undefined}
          tabIndex={tap === 'panel' ? 0 : undefined}
          onClick={tap === 'panel' ? advance : undefined}
          onKeyDown={
            tap === 'panel'
              ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), advance())
              : undefined
          }
          className={`pointer-events-auto -mt-3 rounded-t-3xl bg-[#2B0F30]/92 px-5 pb-7 pt-4 ring-1 ring-white/12 backdrop-blur-md ${
            tap === 'panel' ? 'cursor-pointer' : 'pointer-events-none'
          }`}
          style={{ paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom))' }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold200">
            {NARRATOR.name} · {NARRATOR.role}
          </p>
          <p className="mt-2 min-h-[3.5rem] text-[17px] leading-relaxed text-white">{line.text}</p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex gap-1.5">
              {lines.map((_, n) => (
                <span
                  key={n}
                  className={`h-1.5 rounded-full transition-all ${
                    n === i ? 'w-5 bg-gold200' : 'w-1.5 bg-white/25'
                  }`}
                />
              ))}
            </div>
            <span className="shrink-0 rounded-full bg-coral500 px-4 py-2 text-sm font-semibold text-white">
              {last ? cta : 'แตะเพื่ออ่านต่อ'}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
