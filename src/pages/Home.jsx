import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PLACES } from '../data/places.js'
import { useStore } from '../lib/useStore.js'
import { Button, OrbitDecor, Sheet } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'

/**
 * หน้าแรก — the places you can walk with a guide.
 *
 * Every place gets the same card, picture and all. Only one of them is open
 * so far, and the feed does not say which until you tap: a shelf where four
 * of five items are pre-stamped "not yet" reads as an empty shop, and the
 * places that are coming deserve to be looked at properly first. What is
 * open carries a badge; what is not says so when you open it.
 */
export default function Home() {
  const navigate = useNavigate()
  const state = useStore()
  const [soon, setSoon] = useState(null)

  const open = (p) => (p.status === 'live' ? navigate(`/place/${p.id}`) : setSoon(p))

  return (
    <div className="pb-10">
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
            เลือกสถานที่ แล้วให้ปราชญ์ในชุมชนพาชมทีละจุด
          </p>
        </div>
      </section>

      <section className="px-5">
        <ul className="space-y-4">
          {PLACES.map((p) => {
            const done = state.progress[p.id]?.done?.length ?? 0
            const live = p.status === 'live'
            return (
              <li key={p.id}>
                <button
                  onClick={() => open(p)}
                  className="group w-full cursor-pointer overflow-hidden rounded-3xl bg-white/6 text-left ring-1 ring-white/12 transition-transform active:scale-[.99]"
                >
                  {/* text over a photograph: stays white and gold in both registers */}
                  <div data-theme="dark" className="relative h-48 overflow-hidden">
                    <img
                      src={p.cover}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2B0F30] via-[#2B0F30]/25 to-transparent" />
                    {live && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-coral500 px-3 py-1.5 text-[11px] font-semibold text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        เปิดให้เล่น AR แล้ว
                      </span>
                    )}
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
                    {live && (
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
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <Sheet
        open={!!soon}
        onClose={() => setSoon(null)}
        title="ยังไม่เปิดให้เดิน"
        labelledBy="soon-title"
      >
        {soon && (
          <div className="space-y-4">
            <img
              src={soon.cover}
              alt={soon.name}
              className="h-36 w-full rounded-2xl object-cover ring-1 ring-white/12"
            />
            <div>
              <h3 className="text-[17px] font-semibold">{soon.name}</h3>
              <p className="mt-0.5 text-sm text-lavender300">
                {soon.craft} · {soon.district} {soon.province}
              </p>
            </div>
            <p className="text-[15px] leading-relaxed text-white/85">{soon.teaser}</p>
            <p className="rounded-xl bg-gold200/12 px-3.5 py-3 text-sm leading-relaxed text-gold200 ring-1 ring-gold200/30">
              {soon.soonNote}
            </p>
            <Button size="lg" className="w-full" onClick={() => setSoon(null)}>
              เข้าใจแล้ว
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  )
}
