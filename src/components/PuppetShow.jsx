import { useEffect, useState } from 'react'

/**
 * The performance behind the screen.
 *
 * Four stills of one puppeteer, cycled. Real เชิดหนังใหญ่ is danced rather
 * than waved — the puppeteer's whole body carries the story — so the frames
 * hold long enough to read as steps being planted, not as a flipbook, and
 * each one drifts slightly while it is up so a held pose is never dead still.
 */
export default function PuppetShow({ frames, playing = true, height = '56%' }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (!playing || !frames?.length) return
    const t = setInterval(() => setI((v) => (v + 1) % frames.length), 900)
    return () => clearInterval(t)
  }, [playing, frames])

  if (!frames?.length) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[12%] z-20 flex justify-center" style={{ height }}>
      {frames.map((src, n) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden={n !== i}
          className={`absolute h-full w-auto object-contain transition-opacity duration-200 ${
            n === i ? 'anim-showstep opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  )
}
