import { useState } from 'react'
import { storage } from '../lib/storage.js'
import Icon from './Icon.jsx'
import { Button, useToast } from './ui.jsx'

/**
 * ส่งกำลังใจ — the one place a listener can answer back.
 *
 * The three chips are the fast path: one tap sends a real message, no typing,
 * no navigation. The box underneath is for people who want to say something
 * of their own. Both write to the same store the Elder role reads, so a reply
 * shows up in คลิปของฉัน immediately.
 *
 * Used inline right after a clip ends, and again from discovery history.
 */
const REACTIONS = [
  {
    id: 'thanks',
    label: 'ขอบคุณที่เล่า',
    icon: 'heart',
    text: 'ขอบคุณที่เล่าเรื่องนี้เก็บไว้ให้ฟังนะครับ/ค่ะ',
  },
  {
    id: 'learned',
    label: 'ได้รู้อะไรใหม่',
    icon: 'spark',
    text: 'ได้รู้อะไรที่ไม่เคยรู้มาก่อนเลยครับ/ค่ะ',
  },
  {
    id: 'more',
    label: 'อยากฟังอีก',
    icon: 'ear',
    text: 'อยากฟังเรื่องอื่นของท่านอีกครับ/ค่ะ',
  },
]

export default function EncourageBox({ clip, elder, checkpointName, onSent }) {
  const toast = useToast()
  const [tapped, setTapped] = useState([])
  const [msg, setMsg] = useState('')
  const [writing, setWriting] = useState(false)
  const [notes, setNotes] = useState(0)

  const send = (text, kind) => {
    storage.sendEncouragement({ clipId: clip.id, text, kind })
    setNotes((n) => n + 1)
    onSent?.(text, kind)
  }

  const tapReaction = (r) => {
    if (tapped.includes(r.id)) return
    setTapped((v) => [...v, r.id])
    send(r.text, 'reaction')
    // No toast here — the chip flipping to a checked state is the receipt,
    // and tapping three in a row would otherwise stack three banners.
  }

  const sendMessage = () => {
    const text = msg.trim()
    if (!text) return
    send(text, 'comment')
    setMsg('')
    setWriting(false)
    toast('ส่งข้อความถึงผู้สูงอายุแล้ว', 'good')
  }

  const shareToLine = () => {
    const text = `ผมได้ฟังเรื่อง “${clip.title}” จาก${elder?.name}${
      checkpointName ? ` ที่${checkpointName}` : ''
    } ผ่านแอปวัยวัฒน์\n${msg.trim() || 'ขอบคุณที่เก็บเรื่องนี้ไว้ให้คนรุ่นหลังนะครับ'}`
    const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`
    // LINE's share URL scheme — no backend, no API key. Clipboard is the fallback.
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    if (!win) {
      navigator.clipboard?.writeText(text)
      toast('เปิด LINE ไม่ได้บนเครื่องนี้ — คัดลอกข้อความไว้ให้แล้ว', 'warn')
    }
  }

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-white">
          บอก{elder?.short ?? 'ผู้สูงอายุ'}หน่อยว่าคุณคิดยังไง
        </p>
        {notes > 0 && (
          <span className="shrink-0 text-[11px] font-semibold text-gold200">
            ส่งแล้ว {notes} ข้อความ
          </span>
        )}
      </div>

      {/* fast path: one tap, one real message */}
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map((r) => {
          const on = tapped.includes(r.id)
          return (
            <button
              key={r.id}
              onClick={() => tapReaction(r)}
              disabled={on}
              aria-pressed={on}
              className={`flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
                on
                  ? 'cursor-default bg-gold200 text-maroon900'
                  : 'bg-white/12 text-white hover:bg-white/22'
              }`}
            >
              <Icon name={on ? 'check' : r.icon} size={16} />
              {r.label}
            </button>
          )
        })}
      </div>

      {/* slower path: say it in your own words */}
      {writing ? (
        <div className="space-y-2.5">
          <label htmlFor="cheer-msg" className="sr-only">
            เขียนข้อความถึงผู้สูงอายุ
          </label>
          <textarea
            id="cheer-msg"
            rows={3}
            autoFocus
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="เช่น ฟังแล้วนึกถึงคุณยายเลยครับ"
            className="w-full resize-none rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-[15px] leading-relaxed text-white outline-none transition-colors placeholder:text-white/35 focus:border-gold200/60"
          />
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" disabled={!msg.trim()} onClick={sendMessage}>
              <Icon name="send" size={16} />
              ส่งข้อความ
            </Button>
            <Button size="sm" variant="quiet" onClick={() => setWriting(false)}>
              ยกเลิก
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setWriting(true)}
            className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/18 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            <Icon name="quote" size={16} />
            เขียนข้อความเอง
          </button>
          <button
            onClick={shareToLine}
            className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full border border-white/18 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            <Icon name="spark" size={16} />
            LINE
          </button>
        </div>
      )}
    </div>
  )
}
