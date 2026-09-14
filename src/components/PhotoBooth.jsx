import { useState } from 'react'
import { storage } from '../lib/storage.js'
import { Button, useToast } from './ui.jsx'
import Icon from './Icon.jsx'

/**
 * The photo op.
 *
 * The finished post came with the artwork, laid out by the people who own
 * the material — frame, title block and all — so it is shown exactly as
 * supplied rather than rebuilt from parts on a canvas. Sharing prefers the
 * Web Share API with the file attached and falls back to a download,
 * because a blob URL is the only thing this app can hand over without a
 * server behind it.
 */
export default function PhotoBooth({ post, onClose }) {
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  const asFile = async () => {
    const blob = await (await fetch(post)).blob()
    return new File([blob], 'kanwat-kanon.jpg', { type: blob.type || 'image/jpeg' })
  }

  const share = async () => {
    setBusy(true)
    try {
      const file = await asFile()
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'หนังใหญ่วัดขนอน',
          text: 'ถ่ายกับตัวหนังใหญ่ที่วัดขนอน ผ่านแอปกาลวัฒ',
        })
        return
      }
      const a = document.createElement('a')
      a.href = URL.createObjectURL(file)
      a.download = 'kanwat-kanon.jpg'
      a.click()
      URL.revokeObjectURL(a.href)
      toast('เครื่องนี้แชร์ตรงไม่ได้ — บันทึกรูปไว้ให้แล้ว', 'good')
    } catch {
      /* the visitor dismissed the share sheet, or the browser refused it */
    } finally {
      setBusy(false)
    }
  }

  const keep = () => {
    storage.savePhoto(post)
    toast('เก็บรูปไว้ในเครื่องแล้ว', 'good')
    onClose?.()
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[#1B0820]/96 backdrop-blur-sm">
      <div
        className="flex items-center justify-between px-4 pb-2 pt-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold200">
          รูปที่ถ่ายคู่กับตัวหนัง
        </p>
        <button
          onClick={onClose}
          aria-label="ปิด"
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/10 text-white"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-2">
        <img
          src={post}
          alt="รูปที่ถ่ายกับตัวหนังใหญ่ พร้อมกรอบสำหรับแชร์"
          className="max-h-full w-auto rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/15"
        />
      </div>

      <div
        className="px-5 pb-6 pt-3"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex gap-2">
          <Button className="flex-1" disabled={busy} onClick={share}>
            <Icon name="send" size={18} />
            แชร์
          </Button>
          <Button variant="ghost" className="flex-1" onClick={keep}>
            <Icon name="check" size={18} />
            เก็บไว้
          </Button>
        </div>
      </div>
    </div>
  )
}
