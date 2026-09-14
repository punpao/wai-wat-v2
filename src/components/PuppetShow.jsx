/**
 * The performance behind the screen.
 *
 * Two puppeteers, each placed where the artwork's own reference frame put
 * them, and each swaying on its own period. A real เชิด is danced — the
 * whole body carries the story — so the panels never hold still, but they
 * also never move in lockstep, which is what a single shared animation
 * would give and what would read instantly as a loop.
 *
 * The pivot sits near the performer's feet rather than the middle of the
 * picture, because the sticks are held low and that is where the motion
 * actually hinges.
 */
export default function PuppetShow({ performers }) {
  if (!performers?.length) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
      {performers.map((p) => (
        <img
          key={p.src}
          src={p.src}
          alt=""
          className={`absolute w-auto select-none ${p.sway === 'b' ? 'anim-swayb' : 'anim-swaya'}`}
          style={{
            height: `${p.h}%`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            filter: 'drop-shadow(0 10px 18px rgba(0,0,0,.45))',
          }}
        />
      ))}
    </div>
  )
}
