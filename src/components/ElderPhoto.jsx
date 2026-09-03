import { useState } from 'react'
import ElderSprite from './ElderSprite.jsx'

/**
 * ElderPhoto — a real photograph of the elder, composited over the live
 * camera feed for the AR reveal.
 *
 * Still no computer vision, same as the sprite it replaces: the figure is
 * placed in screen space, not anchored to the world, so panning the phone
 * does not slide her across the room. What sells the reveal is grading,
 * not tracking — see `.ar-figure` in index.css for the three tricks.
 *
 * Falls back to <ElderSprite /> for any elder without a photo, and for one
 * whose file 404s: a missing asset must never strand an explorer mid-hunt
 * at the one moment the whole walk was for.
 */
export default function ElderPhoto({ elder, size = 190, talking = false, className = '' }) {
  // Keyed by src, so swapping elders clears a previous elder's failure.
  const [failedSrc, setFailedSrc] = useState(null)

  if (!elder?.photo || failedSrc === elder.photo) {
    return <ElderSprite elder={elder} size={size} talking={talking} className={className} />
  }

  return (
    <div className={`anim-materialize ${className}`}>
      <img
        src={elder.photo}
        onError={() => setFailedSrc(elder.photo)}
        alt={`ภาพของ${elder.name ?? 'ผู้สูงอายุ'}`}
        draggable={false}
        className="ar-figure select-none object-contain"
        style={{ width: size * 1.15, height: size * 1.25 }}
      />
    </div>
  )
}
