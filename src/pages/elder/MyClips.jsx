import { useState } from 'react'
import { allCheckpoints } from '../../data/locations.js'
import { elderById } from '../../data/elders.js'
import { useStore } from '../../lib/useStore.js'
import { PaperCard, SectionTitle } from '../../components/elderUI.jsx'
import Icon from '../../components/Icon.jsx'
import { mmss, thaiDate } from '../../components/ui.jsx'

export default function MyClips() {
  const state = useStore()
  const me = elderById(state.elderId)
  const clips = allCheckpoints().filter((c) => c.elderId === state.elderId)
  const [openId, setOpenId] = useState(clips[0]?.clip.id ?? null)

  return (
    <div className="mx-auto max-w-xl px-4 pb-8 pt-5">
      <SectionTitle icon="clips" hint={`เรื่องที่ ${me?.short} เล่าเก็บไว้ ${clips.length} เรื่อง`}>
        คลิปของฉัน
      </SectionTitle>

      <ul className="space-y-4">
        {clips.map((c) => {
          const stat = state.clipStats[c.clip.id] ?? { listeners: 0, likes: 0, comments: [] }
          const open = openId === c.clip.id
          return (
            <li key={c.clip.id}>
              <PaperCard className="overflow-hidden">
                <div className="p-5">
                  <p className="text-[15px] font-semibold uppercase tracking-wide text-coral500">
                    {c.clip.topic}
                  </p>
                  <h3 className="mt-1 text-[21px] font-semibold leading-snug">{c.clip.title}</h3>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[16px] text-maroon900/65">
                    <Icon name="pin" size={17} />
                    {c.name} · ความยาว {mmss(c.clip.duration)}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-paperdeep/60 p-3 text-center">
                    {[
                      { icon: 'ear', v: stat.listeners, l: 'คนฟัง' },
                      { icon: 'heart', v: stat.likes, l: 'ถูกใจ' },
                      { icon: 'quote', v: stat.comments.length, l: 'ข้อความ' },
                    ].map((s) => (
                      <div key={s.l}>
                        <Icon name={s.icon} size={20} className="mx-auto text-violet800" />
                        <p className="mt-1 font-display text-[21px] leading-none">{s.v}</p>
                        <p className="mt-1 text-[15px] text-maroon900/65">{s.l}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setOpenId(open ? null : c.clip.id)}
                    aria-expanded={open}
                    className="mt-4 flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border-2 border-maroon900/18 px-4 text-[17px] font-semibold transition-colors hover:border-maroon900/45"
                  >
                    {open ? 'ซ่อนข้อความจากผู้ฟัง' : `อ่านข้อความจากผู้ฟัง (${stat.comments.length})`}
                    <Icon name={open ? 'chevronDown' : 'chevron'} size={20} />
                  </button>
                </div>

                {open && (
                  <div className="border-t border-maroon900/10 bg-paper px-5 py-4">
                    {stat.comments.length === 0 ? (
                      <p className="text-[17px] leading-relaxed text-maroon900/65">
                        ยังไม่มีใครส่งข้อความถึงคลิปนี้
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {stat.comments.map((cm) => (
                          <li key={cm.id} className="rounded-2xl bg-white p-4 ring-1 ring-maroon900/8">
                            <p className="text-[18px] leading-relaxed">“{cm.text}”</p>
                            <p className="mt-2 flex items-center gap-1.5 text-[15px] text-maroon900/60">
                              <Icon name={cm.kind === 'cheer' ? 'heart' : 'quote'} size={16} />
                              {cm.from} · {thaiDate(cm.at)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </PaperCard>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
