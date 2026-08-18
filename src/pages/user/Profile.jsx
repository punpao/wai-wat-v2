import { useMemo, useState } from 'react'
import { checkpointById } from '../../data/locations.js'
import { elderById } from '../../data/elders.js'
import { BADGES, levelFor, nextLevel } from '../../data/rewards.js'
import { useStore } from '../../lib/useStore.js'
import ClipPlayer from '../../components/ClipPlayer.jsx'
import EncourageBox from '../../components/EncourageBox.jsx'
import { ElderAvatar } from '../../components/ElderSprite.jsx'
import { Button, Card, Eyebrow, OrbitDecor, Sheet, thaiDate } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'

export default function Profile() {
  const state = useStore()
  const [replay, setReplay] = useState(null)
  const [cheer, setCheer] = useState(null)

  const points = state.user.points
  const lvl = levelFor(points)
  const next = nextLevel(points)
  const progress = next ? Math.round(((points - lvl.min) / (next.min - lvl.min)) * 100) : 100

  const history = useMemo(
    () =>
      state.discoveries
        .map((d) => ({ ...d, cp: checkpointById(d.checkpointId), elder: elderById(d.elderId) }))
        .filter((d) => d.cp),
    [state.discoveries],
  )

  return (
    <div className="mx-auto max-w-2xl">
      {/* ── Hero: identity + the numbers ── */}
      <section className="relative overflow-hidden px-4 pb-6 pt-5">
        <OrbitDecor />
        <div className="relative">
          <Eyebrow>โปรไฟล์ผู้สำรวจ</Eyebrow>
          <h1 className="mt-2 text-[27px] font-semibold leading-tight">
            สะสมได้ <span className="gold-number font-display text-[34px]">{points}</span> แต้มภูมิปัญญา
          </h1>

          <div className="mt-4 rounded-card bg-white/7 p-4 ring-1 ring-white/12">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold">
                ระดับ {lvl.level} · {lvl.name}
              </p>
              <p className="text-xs text-lavender300">
                {next ? `อีก ${next.min - points} แต้มถึงระดับ ${next.level}` : 'ระดับสูงสุดแล้ว'}
              </p>
            </div>
            <div
              className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-black/30"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="ความคืบหน้าสู่ระดับถัดไป"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold200 to-coral500 transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { icon: 'pin', value: state.discoveries.length, label: 'จุดที่ค้นพบ' },
              { icon: 'flame', value: state.user.streak, label: 'วันต่อเนื่อง' },
              {
                icon: 'ear',
                value: new Set(state.discoveries.map((d) => d.elderId)).size,
                label: 'ผู้สูงอายุที่ได้ฟัง',
              },
            ].map((s) => (
              <div key={s.label} className="glass flex flex-col items-center rounded-2xl px-3 py-3.5">
                <Icon name={s.icon} size={19} className="text-gold200" />
                <span className="gold-number mt-1.5 font-display text-2xl leading-none">{s.value}</span>
                <span className="mt-1.5 text-center text-[11px] leading-tight text-lavender300">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Badges ── */}
      <section className="px-4 pb-6">
        <Eyebrow>เหรียญตรา</Eyebrow>
        <ul className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {BADGES.map((b) => {
            const on = state.discoveries.length >= b.need
            return (
              <li
                key={b.id}
                className={`flex w-[132px] shrink-0 flex-col items-center rounded-2xl px-3 py-4 text-center ring-1 ${
                  on ? 'bg-gold200/15 ring-gold200/45' : 'bg-white/5 ring-white/10'
                }`}
              >
                <Icon
                  name="medal"
                  size={26}
                  className={on ? 'text-gold200' : 'text-white/25'}
                />
                <p className={`mt-2 text-sm font-semibold ${on ? 'text-white' : 'text-white/40'}`}>
                  {b.name}
                </p>
                <p className="mt-1 text-[11px] leading-tight text-lavender300">{b.detail}</p>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ── History ── */}
      <section className="px-4 pb-8">
        <Eyebrow>ประวัติการค้นพบ</Eyebrow>
        {history.length === 0 ? (
          <Card className="mt-3 p-6 text-center">
            <Icon name="compass" size={30} className="mx-auto text-gold200" />
            <p className="mt-3 font-semibold">ยังไม่มีเรื่องเล่าในกระเป๋า</p>
            <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-lavender300">
              เลือกเส้นทางในหน้าแผนที่ แล้วเดินไปให้ถึงจุดตรวจ เรื่องเล่าแรกของคุณจะมาอยู่ตรงนี้
            </p>
          </Card>
        ) : (
          <ul className="mt-3 space-y-3">
            {history.map((h) => (
              <li key={h.checkpointId}>
                <Card className="overflow-hidden p-4">
                  <div className="flex items-start gap-3">
                    <ElderAvatar elder={h.elder} size={48} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold">{h.cp.clip.title}</p>
                      <p className="mt-0.5 truncate text-xs text-lavender300">
                        {h.elder?.name} · {h.cp.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-lavender300">
                        ค้นพบเมื่อ {thaiDate(h.at)}
                      </p>
                    </div>
                    <span className="gold-number shrink-0 font-display text-lg">
                      +{h.cp.clip.points}
                    </span>
                  </div>

                  {h.comments?.length > 0 && (
                    <div className="mt-3 rounded-xl bg-black/25 px-3 py-2">
                      <p className="text-[11px] font-semibold text-gold200">
                        คุณส่งไปแล้ว {h.comments.length} ข้อความ
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-white/70">
                        ล่าสุด: “{h.comments[0].text}”
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setReplay(h)}>
                      <Icon name="play" size={16} filled />
                      ฟังซ้ำ
                    </Button>
                    <Button size="sm" onClick={() => setCheer(h)}>
                      <Icon name="heart" size={16} />
                      ส่งกำลังใจ
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Replay ── */}
      <Sheet
        open={!!replay}
        onClose={() => setReplay(null)}
        title="ฟังซ้ำ"
        labelledBy="replay-title"
      >
        {replay && <ClipPlayer clip={replay.cp.clip} elder={replay.elder} />}
      </Sheet>

      {/* ── Encouragement ── */}
      <EncourageSheet entry={cheer} onClose={() => setCheer(null)} />
    </div>
  )
}

function EncourageSheet({ entry, onClose }) {
  return (
    <Sheet open={!!entry} onClose={onClose} title="ส่งกำลังใจ" labelledBy="cheer-title">
      {entry && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/7 p-3 ring-1 ring-white/10">
            <ElderAvatar elder={entry.elder} size={46} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{entry.elder?.name}</p>
              <p className="truncate text-xs text-lavender300">{entry.cp.clip.title}</p>
            </div>
          </div>
          <EncourageBox
            clip={entry.cp.clip}
            elder={entry.elder}
            checkpointName={entry.cp.name}
            // A written message is a finished thought — close on it. Reaction
            // chips stay open so several can be tapped in a row.
            onSent={(_text, kind) => kind === 'comment' && onClose()}
          />
        </div>
      )}
    </Sheet>
  )
}
