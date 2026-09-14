import { useNavigate } from 'react-router-dom'
import { PLACES } from '../data/places.js'
import { useStore } from '../lib/useStore.js'
import { OrbitDecor } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'

/**
 * หน้าแรก — which places you can walk with AR right now.
 *
 * The live place is given the full-bleed card because there is exactly one
 * and hiding it in a uniform grid would make the app look emptier than it
 * is. The rest are listed plainly as what is coming, not dressed up as
 * something tappable.
 */
export default function Home() {
  const navigate = useNavigate()
  const state = useStore()

  const live = PLACES.filter((p) => p.status === 'live')
  const soon = PLACES.filter((p) => p.status !== 'live')

  return (
    <div className="mx-auto max-w-xl pb-10">
      <section className="relative px-5 pb-4 pt-6">
        <OrbitDecor />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold200">
            กาลวัฒ
          </p>
          <h1 className="mt-2 text-[26px] font-semibold leading-snug">
            เดินดูของจริง <span className="text-gold200">ให้คนที่นั่นเล่าเอง</span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-lavender300">
            เลือกสถานที่ที่เปิดให้บริการ AR แล้วให้ปราชญ์ในชุมชนพาชมทีละจุด
          </p>
        </div>
      </section>

      <section className="px-5">
        <ul className="space-y-4">
          {live.map((p) => {
            const done = state.progress[p.id]?.done?.length ?? 0
            return (
              <li key={p.id}>
                <button
                  onClick={() => navigate(`/place/${p.id}`)}
                  className="group w-full cursor-pointer overflow-hidden rounded-3xl bg-white/6 text-left ring-1 ring-white/12 transition-transform active:scale-[.99]"
                >
                  {/* The cover's caption sits on a scrim over a photograph,
                      so it stays white and gold in the light register too. */}
                  <div data-theme="dark" className="relative h-52 overflow-hidden">
                    <img
                      src={p.cover}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2B0F30] via-[#2B0F30]/25 to-transparent" />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-coral500 px-3 py-1.5 text-[11px] font-semibold text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      เปิดให้เล่น AR แล้ว
                    </span>
                    <div className="absolute inset-x-4 bottom-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold200">
                        {p.craft}
                      </p>
                      <h2 className="text-2xl font-semibold leading-tight">{p.name}</h2>
                      <p className="mt-0.5 text-xs text-lavender300">
                        {p.district} · {p.province}
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm leading-relaxed text-lavender300">{p.teaser}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-lavender300">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="pin" size={14} />
                        {p.checkpoints.length} จุด
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="clock" size={14} />
                        {p.duration}
                      </span>
                      {done > 0 && (
                        <span className="ml-auto inline-flex items-center gap-1.5 font-semibold text-gold200">
                          <Icon name="check" size={14} />
                          เดินแล้ว {done}/{p.checkpoints.length}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-8 px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender300">
          กำลังจะเปิดเร็ว ๆ นี้
        </p>
        <ul className="mt-3 space-y-2">
          {soon.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-2xl bg-white/4 px-4 py-3 ring-1 ring-white/8"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/6 text-lavender300">
                <Icon name="pin" size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white/80">{p.name}</span>
                <span className="block truncate text-xs text-lavender300">
                  {p.craft} · {p.province}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-white/8 px-2.5 py-1 text-[11px] text-lavender300">
                เร็ว ๆ นี้
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
