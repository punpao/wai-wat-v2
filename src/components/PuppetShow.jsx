import InteractivePuppet from './InteractivePuppet.jsx'

/**
 * The performance behind the screen.
 *
 * Two puppeteers, each placed where the artwork's own reference frame put
 * them, each already dancing on its own period — a real เชิด is danced and
 * the panels never hold still. Both are also grabbable: the sway is what
 * they do on their own, the drag and the handset's tilt are what the
 * visitor does to them, and the two compose rather than replace each other.
 */
export default function PuppetShow({ performers, onFirstMove }) {
  if (!performers?.length) return null

  return performers.map((p) => (
    <InteractivePuppet
      key={p.src}
      src={p.src}
      alt="คนเชิดหนังใหญ่"
      at={{ h: p.h, left: p.left, top: p.top }}
      idle={p.sway === 'b' ? 'swayb' : 'swaya'}
      onFirstMove={onFirstMove}
    />
  ))
}
