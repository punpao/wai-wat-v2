import { Link } from 'react-router-dom'
import { ELDERS, elderById } from '../../data/elders.js'
import { allCheckpoints } from '../../data/locations.js'
import { storage } from '../../lib/storage.js'
import { useStore } from '../../lib/useStore.js'
import { BigButton, PaperCard, SectionTitle } from '../../components/elderUI.jsx'
import ElderSprite from '../../components/ElderSprite.jsx'
import Icon from '../../components/Icon.jsx'
import { thaiDate } from '../../components/ui.jsx'

export default function ElderHome() {
  const state = useStore()
  const me = elderById(state.elderId)
  const myClips = allCheckpoints().filter((c) => c.elderId === state.elderId)

  const listeners = myClips.reduce((s, c) => s + (state.clipStats[c.clip.id]?.listeners ?? 0), 0)
  const likes = myClips.reduce((s, c) => s + (state.clipStats[c.clip.id]?.likes ?? 0), 0)
  const comments = myClips.flatMap((c) => state.clipStats[c.clip.id]?.comments ?? [])
  const latest = [...comments].sort((a, b) => b.at - a.at).slice(0, 2)

  return (
    <div className="mx-auto max-w-xl px-4 pb-8 pt-5">
      {/* ── Greeting ── */}
      <div className="flex items-center gap-3">
        <ElderSprite elder={me} size={78} />
        <div className="min-w-0">
          <p className="text-[17px] text-maroon900/65">สวัสดี</p>
          <h1 className="truncate text-[26px] font-semibold leading-tight">{me?.name}</h1>
        </div>
      </div>

      {/* ── Balance: the one number that matters ── */}
      <PaperCard className="mt-5 overflow-hidden">
        <div className="relative bg-violet800 px-6 py-7 text-center text-white">
          <div className="orbit-ring absolute -right-14 -top-16 h-48 w-48 opacity-45" aria-hidden="true" />
          <div className="orbit-ring absolute -left-10 top-16 h-32 w-32 opacity-25" aria-hidden="true" />
          <p className="relative text-[17px] text-gold200">แต้มภูมิปัญญาที่ใช้ได้ตอนนี้</p>
          <p className="gold-number relative mt-1 font-display text-[62px] leading-none">
            {state.elderWallet.balance.toLocaleString('th-TH')}
          </p>
          <p className="relative mt-2 text-[15px] text-white/80">
            สะสมมาแล้วทั้งหมด {state.elderWallet.earnedTotal.toLocaleString('th-TH')} แต้ม
          </p>
        </div>
        <div className="p-5">
          <Link to="/elder/redeem" className="block">
            <BigButton>
              <Icon name="gift" size={24} />
              นำแต้มไปแลกบริการ
            </BigButton>
          </Link>
        </div>
      </PaperCard>

      {/* ── Three numbers, written out ── */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { icon: 'ear', v: listeners, l: 'คนฟัง' },
          { icon: 'heart', v: likes, l: 'ถูกใจ' },
          { icon: 'quote', v: comments.length, l: 'ข้อความ' },
        ].map((s) => (
          <PaperCard key={s.l} className="px-2 py-4 text-center">
            <Icon name={s.icon} size={24} className="mx-auto text-coral500" />
            <p className="mt-1.5 font-display text-[27px] leading-none text-maroon900">{s.v}</p>
            <p className="mt-1.5 text-[15px] text-maroon900/65">{s.l}</p>
          </PaperCard>
        ))}
      </div>

      {/* ── Latest encouragement ── */}
      <section className="mt-7">
        <SectionTitle icon="heart" hint="ข้อความจากคนที่ได้ฟังเรื่องของท่าน">
          กำลังใจล่าสุด
        </SectionTitle>
        {latest.length === 0 ? (
          <PaperCard className="p-5 text-[17px] leading-relaxed text-maroon900/70">
            ยังไม่มีข้อความเข้ามา เมื่อมีคนฟังคลิปของท่านและส่งกำลังใจ ข้อความจะมาอยู่ตรงนี้
          </PaperCard>
        ) : (
          <ul className="space-y-3">
            {latest.map((c) => (
              <li key={c.id}>
                <PaperCard className="p-5">
                  <p className="text-[18px] leading-relaxed">“{c.text}”</p>
                  <p className="mt-2.5 text-[15px] text-maroon900/60">
                    — {c.from} · {thaiDate(c.at)}
                  </p>
                </PaperCard>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/elder/clips"
          className="mt-3 flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border-2 border-maroon900/20 bg-white text-[17px] font-semibold text-maroon900 transition-colors hover:border-maroon900/45"
        >
          ดูคลิปทั้งหมดของฉัน
          <Icon name="chevron" size={20} />
        </Link>
      </section>

      {/* ── Demo-only identity switch ── */}
      <section className="mt-8 rounded-2xl border border-dashed border-maroon900/25 p-4">
        <label htmlFor="elder-pick" className="block text-[15px] font-semibold text-maroon900/75">
          สำหรับสาธิต · เข้าใช้งานในชื่อผู้เฒ่าท่านอื่น
        </label>
        <select
          id="elder-pick"
          value={state.elderId}
          onChange={(e) => storage.setElder(e.target.value)}
          className="mt-2 min-h-[56px] w-full cursor-pointer rounded-xl border-2 border-maroon900/20 bg-white px-4 text-[17px] text-maroon900"
        >
          {ELDERS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} · {e.area}
            </option>
          ))}
        </select>
      </section>
    </div>
  )
}
