import { useSyncExternalStore } from 'react'
import { askForTilt, subscribeTiltState, tiltNeedsAsking } from '../lib/tilt.js'
import Icon from './Icon.jsx'

/**
 * The one button that turns tilting on.
 *
 * iOS will not hand over motion without a tap, and a scene can hold several
 * things that move, so the ask lives here — once per screen — rather than
 * sprouting a button beside every one of them.
 */
export default function TiltPrompt({ label = 'เปิดการเอียงเครื่อง' }) {
  useSyncExternalStore(subscribeTiltState, tiltNeedsAsking, () => false)
  if (!tiltNeedsAsking()) return null

  return (
    <button
      onClick={askForTilt}
      className="absolute left-4 z-40 flex cursor-pointer items-center gap-2 rounded-full bg-black/60 px-3.5 py-2 text-xs font-semibold text-gold200 backdrop-blur-sm"
      style={{ top: 'calc(max(1rem, env(safe-area-inset-top)) + 3.5rem)' }}
    >
      <Icon name="compass" size={16} />
      {label}
    </button>
  )
}
