import { useEffect, useState } from 'react'
import { NARRATOR, narratorPose } from '../data/places.js'

/**
 * The guide, standing in the frame.
 *
 * He is ten photographs of one person, swapped as the script calls for
 * them — that is the whole animation. Two things make that hold together:
 *
 * Every pose was rendered to the SAME figure height on the same canvas,
 * aligned on the torso rather than the bounding box. So this sizes by
 * height, never width: an outstretched arm then changes the arm instead of
 * shrinking the man.
 *
 * And he is drawn as a projection rather than a cut-out pasted on a photo.
 * Slightly translucent with a warm floor glow under him, which is what the
 * placement reference shows and what stops a studio portrait reading as a
 * sticker over a temple.
 */
/* Every pose was rendered onto one canvas of this shape. Naming it here is
   what lets the figure be positioned by height alone: an absolutely
   positioned box shrinks to fit its content, and a shrink-to-fit box sized
   from the image's INTRINSIC width does not agree with an <img> that is
   sized from its height — so translateX(-50%) would centre a box the figure
   is not actually centred in, and shove him off the side of the frame.
   Declaring the ratio makes the box's width follow its height exactly. */
const POSE_RATIO = '740 / 520'

export function NarratorFigure({ pose = 'explain', at, className = '' }) {
  const [bump, setBump] = useState(0)
  useEffect(() => setBump((b) => b + 1), [pose])

  const { h = 38, cx = 50, top = 31 } = at ?? {}

  return (
    <div
      className={`pointer-events-none absolute z-20 ${className}`}
      style={{
        height: `${h}%`,
        aspectRatio: POSE_RATIO,
        top: `${top}%`,
        left: `${cx}%`,
        /* `translate`, not `transform`: the arrival animation on this same
           element animates `transform`, and would overwrite a centring
           transform outright — which parks him against the right edge of
           the frame. The independent property composes instead. */
        translate: '-50% 0',
      }}
    >
      {/* the light he is standing in */}
      <span
        className="absolute bottom-[-6%] left-1/2 h-[26%] w-[62%] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255,211,162,.42), rgba(255,211,162,.12) 58%, transparent 78%)',
          filter: 'blur(5px)',
        }}
      />
      <img
        key={bump}
        src={narratorPose(pose)}
        alt={NARRATOR.name}
        draggable={false}
        className="anim-posein relative h-full w-full select-none object-contain"
        style={{
          opacity: 0.93,
          filter:
            'saturate(.96) contrast(1.04) drop-shadow(0 0 22px rgba(255,211,162,.32)) drop-shadow(0 16px 24px rgba(0,0,0,.45))',
        }}
      />
    </div>
  )
}

/**
 * The guide plus the line he is on. Tap to move on; the caller decides what
 * happens when the last line is read.
 *
 * `tap` is the one thing worth a prop. On a plain narrated scene the whole
 * screen should advance the script — hunting for a small target while
 * walking is a nuisance. But when the scene has something to handle, a
 * full-screen tap target would eat every drag aimed at it, so the panel
 * takes the taps and leaves the rest of the screen to the puppet.
 */
export default function NarratorSpeech({ lines, onDone, cta = 'ต่อไป', tap = 'full', at }) {
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

      <NarratorFigure pose={line.pose} at={at} className="anim-ghostin" />

      <div
        role={tap === 'panel' ? 'button' : undefined}
        tabIndex={tap === 'panel' ? 0 : undefined}
        onClick={tap === 'panel' ? advance : undefined}
        onKeyDown={
          tap === 'panel'
            ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), advance())
            : undefined
        }
        className={`absolute inset-x-0 bottom-0 z-30 rounded-t-3xl bg-[#2B0F30]/92 px-5 pb-7 pt-4 ring-1 ring-white/12 backdrop-blur-md ${
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
    </>
  )
}
