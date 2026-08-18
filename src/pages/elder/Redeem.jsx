import { useState } from 'react'
import { REWARDS } from '../../data/rewards.js'
import { storage } from '../../lib/storage.js'
import { useStore } from '../../lib/useStore.js'
import { BigButton, PaperCard, SectionTitle } from '../../components/elderUI.jsx'
import { Sheet, thaiDate } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'

export default function Redeem() {
  const state = useStore()
  const [confirm, setConfirm] = useState(null)
  const [done, setDone] = useState(null)
  const balance = state.elderWallet.balance

  const doRedeem = () => {
    const next = storage.redeem(confirm)
    setDone(next.redemptions[0])
    setConfirm(null)
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-8 pt-5">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl bg-violet800 px-5 py-4 text-white">
        <p className="text-[17px] text-gold200">แต้มคงเหลือ</p>
        <p className="gold-number font-display text-[34px] leading-none">
          {balance.toLocaleString('th-TH')}
        </p>
      </div>

      <SectionTitle icon="gift" hint="ใช้แต้มที่ได้จากการเล่าเรื่อง แลกเป็นบริการถึงบ้าน">
        แลกแต้มเป็นบริการ
      </SectionTitle>

      <ul className="space-y-4">
        {REWARDS.map((r) => {
          const enough = balance >= r.cost
          return (
            <li key={r.id}>
              <PaperCard className="p-5">
                <div className="flex items-start gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-coral500/12 text-coral500">
                    <Icon name={r.icon} size={28} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[21px] font-semibold leading-tight">{r.name}</h3>
                    <p className="mt-1 text-[17px] leading-relaxed text-maroon900/70">{r.detail}</p>
                    <p className="mt-1.5 text-[15px] text-maroon900/55">โดย {r.provider}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-paperdeep/60 px-4 py-3">
                  <span className="text-[17px] text-maroon900/70">{r.unit}</span>
                  <span className="font-display text-[24px] leading-none text-maroon900">
                    {r.cost} <span className="text-[16px]">แต้ม</span>
                  </span>
                </div>

                <BigButton
                  className="mt-4"
                  variant={enough ? 'primary' : 'outline'}
                  disabled={!enough}
                  onClick={() => setConfirm(r)}
                >
                  {enough ? (
                    <>
                      <Icon name="check" size={22} />
                      แลกบริการนี้
                    </>
                  ) : (
                    <>ต้องมีอีก {r.cost - balance} แต้ม</>
                  )}
                </BigButton>
              </PaperCard>
            </li>
          )
        })}
      </ul>

      {state.redemptions.length > 0 && (
        <section className="mt-8">
          <SectionTitle icon="bank">รายการที่แลกไปแล้ว</SectionTitle>
          <ul className="space-y-3">
            {state.redemptions.map((r) => (
              <li key={r.id}>
                <PaperCard className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-[18px] font-semibold">{r.name}</p>
                    <p className="text-[15px] text-maroon900/60">
                      {thaiDate(r.at)} · ใช้ไป {r.cost} แต้ม
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-violet800/10 px-3 py-2 text-[15px] font-semibold text-violet800">
                    {r.status}
                  </span>
                </PaperCard>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Confirm ── */}
      <Sheet
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="ยืนยันการแลกแต้ม"
        tone="paper"
        labelledBy="redeem-confirm"
      >
        {confirm && (
          <div className="space-y-5 text-[18px]">
            <p className="leading-relaxed">
              ท่านกำลังจะแลก <strong>{confirm.name}</strong> โดยใช้{' '}
              <strong>{confirm.cost} แต้ม</strong>
            </p>
            <div className="rounded-2xl bg-paperdeep/70 p-4">
              <div className="flex justify-between">
                <span>แต้มคงเหลือตอนนี้</span>
                <strong>{balance}</strong>
              </div>
              <div className="mt-2 flex justify-between border-t border-maroon900/12 pt-2">
                <span>คงเหลือหลังแลก</span>
                <strong>{balance - confirm.cost}</strong>
              </div>
            </div>
            <BigButton onClick={doRedeem}>
              <Icon name="check" size={22} />
              ยืนยันการแลก
            </BigButton>
            <BigButton variant="outline" onClick={() => setConfirm(null)}>
              ยกเลิก
            </BigButton>
          </div>
        )}
      </Sheet>

      {/* ── Success ── */}
      <Sheet
        open={!!done}
        onClose={() => setDone(null)}
        title="แลกสำเร็จแล้ว"
        tone="paper"
        labelledBy="redeem-done"
      >
        {done && (
          <div className="space-y-5 text-center text-[18px]">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-coral500 text-white">
              <Icon name="check" size={40} stroke={2.6} />
            </span>
            <p className="leading-relaxed">
              รับเรื่อง <strong>{done.name}</strong> เรียบร้อยแล้ว
              <br />
              เจ้าหน้าที่จะโทรหาท่านภายใน 1 วันทำการ เพื่อนัดวันและเวลา
            </p>
            <div className="rounded-2xl bg-paperdeep/70 p-4 text-left">
              <p>
                หมายเลขคำขอ: <strong>{done.ref}</strong>
              </p>
              <p className="mt-1">
                แต้มคงเหลือ: <strong>{state.elderWallet.balance}</strong>
              </p>
            </div>
            <BigButton onClick={() => setDone(null)}>เข้าใจแล้ว</BigButton>
          </div>
        )}
      </Sheet>
    </div>
  )
}
