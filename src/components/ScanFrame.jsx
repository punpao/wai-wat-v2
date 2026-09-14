import { useState } from 'react'
import Icon from './Icon.jsx'

/**
 * The scan moment.
 *
 * There is no computer vision and no camera here by design — the scene is a
 * photograph of the spot the visitor is standing in front of. The reticle,
 * the sweep and the two-second hold are what make the tap read as "the app
 * recognised this place" rather than "the app advanced a slide".
 */
export default function ScanFrame({ scene, title, hint, cta = 'สแกน', onScanned }) {
  const [state, setState] = useState('idle') // idle | scanning

  const run = () => {
    if (state !== 'idle') return
    setState('scanning')
    if (navigator.vibrate) navigator.vibrate([25, 60, 25])
    setTimeout(() => onScanned?.(), 1700)
  }

  return (
    <div className="absolute inset-0 z-20">
      {/* corner reticle */}
      <div className="pointer-events-none absolute inset-x-8 top-[22%] h-[42%]">
        {[
          'left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl',
          'right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl',
          'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-2xl',
          'right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl',
        ].map((c) => (
          <span
            key={c}
            className={`absolute h-12 w-12 border-gold200 transition-colors ${c} ${
              state === 'scanning' ? 'border-coral500' : ''
            }`}
          />
        ))}

        {state === 'scanning' && (
          <span className="anim-scanline absolute inset-x-2 h-0.5 bg-gold200 shadow-[0_0_14px_4px_rgba(255,211,162,0.55)]" />
        )}
      </div>

      <div
        className="absolute inset-x-0 bottom-0 px-5 pb-8 pt-6"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <div className="rounded-3xl bg-[#2B0F30]/88 p-5 text-center ring-1 ring-white/12 backdrop-blur-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold200">
            {state === 'scanning' ? 'กำลังสแกน…' : 'พร้อมสแกน'}
          </p>
          <h2 className="mt-1.5 text-xl font-semibold text-white">{title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-lavender300">{hint}</p>

          <button
            onClick={run}
            disabled={state === 'scanning'}
            className="mt-4 flex min-h-[56px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-coral500 text-[17px] font-semibold text-white transition-colors hover:bg-[#e35c39] disabled:opacity-70"
          >
            <Icon name="scan" size={22} />
            {state === 'scanning' ? 'กำลังอ่านภาพ…' : cta}
          </button>
        </div>
      </div>
    </div>
  )
}
