import { useEffect, useRef, useState } from 'react'
import { storage } from '../lib/storage.js'
import { Button, useToast } from './ui.jsx'
import Icon from './Icon.jsx'

/**
 * The photo op.
 *
 * The picture is composited for real on a canvas — scene, the puppet at the
 * exact angle the visitor left it, then the chosen frame — so what gets
 * shared is the arrangement they made, not a canned image. Sharing prefers
 * the Web Share API with the file attached and falls back to a download,
 * because a blob URL is the only thing this app can hand over without a
 * server behind it.
 */
const FRAMES = [
  { id: 'thai', label: 'ลายไทย' },
  { id: 'polaroid', label: 'โพลารอยด์' },
  { id: 'shadow', label: 'จอหนัง' },
]

const W = 1080
const H = 1350

const loadImage = (src) =>
  new Promise((res, rej) => {
    const im = new Image()
    im.crossOrigin = 'anonymous'
    im.onload = () => res(im)
    im.onerror = rej
    im.src = src
  })

/** cover-fit, the same geometry CSS object-fit:cover would give */
function drawCover(ctx, img, x, y, w, h) {
  const r = Math.max(w / img.width, h / img.height)
  const dw = img.width * r
  const dh = img.height * r
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

function paintFrame(ctx, frame) {
  ctx.save()
  if (frame === 'thai') {
    const pad = 26
    ctx.strokeStyle = '#FFD3A2'
    ctx.lineWidth = 10
    ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2)
    ctx.strokeStyle = '#D9502F'
    ctx.lineWidth = 3
    ctx.strokeRect(pad + 16, pad + 16, W - (pad + 16) * 2, H - (pad + 16) * 2)
    // corner lotus buds
    ctx.fillStyle = '#FFD3A2'
    for (const [cx, cy] of [
      [pad + 16, pad + 16],
      [W - pad - 16, pad + 16],
      [pad + 16, H - pad - 16],
      [W - pad - 16, H - pad - 16],
    ]) {
      ctx.beginPath()
      ctx.arc(cx, cy, 15, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (frame === 'polaroid') {
    ctx.fillStyle = '#FFFDF8'
    ctx.fillRect(0, 0, W, 34)
    ctx.fillRect(0, 0, 34, H)
    ctx.fillRect(W - 34, 0, 34, H)
    ctx.fillRect(0, H - 190, W, 190)
  } else if (frame === 'shadow') {
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, 'rgba(43,15,48,0.85)')
    g.addColorStop(0.35, 'rgba(43,15,48,0)')
    g.addColorStop(0.72, 'rgba(43,15,48,0)')
    g.addColorStop(1, 'rgba(43,15,48,0.92)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }
  ctx.restore()
}

function paintCaption(ctx, frame) {
  ctx.save()
  const dark = frame === 'polaroid'
  ctx.textAlign = 'center'
  ctx.fillStyle = dark ? '#5C1432' : '#FFFFFF'
  ctx.font = '600 46px Kanit, system-ui, sans-serif'
  ctx.fillText('หนังใหญ่วัดขนอน', W / 2, frame === 'polaroid' ? H - 108 : H - 92)
  ctx.fillStyle = dark ? 'rgba(92,20,50,.65)' : '#FFD3A2'
  ctx.font = '500 30px Kanit, system-ui, sans-serif'
  ctx.fillText('กาลวัฒ · ราชบุรี', W / 2, frame === 'polaroid' ? H - 58 : H - 46)
  ctx.restore()
}

export default function PhotoBooth({ scene, puppet, puppetState, onClose }) {
  const [frame, setFrame] = useState('thai')
  const [shot, setShot] = useState(null)
  const [busy, setBusy] = useState(false)
  const canvasRef = useRef(null)
  const toast = useToast()

  useEffect(() => {
    let alive = true
    ;(async () => {
      setBusy(true)
      try {
        const [bg, pup] = await Promise.all([loadImage(scene), loadImage(puppet)])
        if (!alive) return
        const c = canvasRef.current ?? document.createElement('canvas')
        c.width = W
        c.height = H
        const ctx = c.getContext('2d')
        ctx.clearRect(0, 0, W, H)
        drawCover(ctx, bg, 0, 0, W, H)

        // the puppet, held where the visitor left it
        const st = puppetState ?? { x: 0, y: 0, rot: 0 }
        const pw = W * 0.62
        const ph = (pup.height / pup.width) * pw
        ctx.save()
        ctx.translate(W / 2 + st.x * 1.6, H * 0.42 + st.y * 1.6)
        ctx.rotate(((st.rot || 0) * Math.PI) / 180)
        ctx.shadowColor = 'rgba(0,0,0,.5)'
        ctx.shadowBlur = 40
        ctx.shadowOffsetY = 18
        ctx.drawImage(pup, -pw / 2, -ph / 2, pw, ph)
        ctx.restore()

        paintFrame(ctx, frame)
        paintCaption(ctx, frame)
        setShot(c.toDataURL('image/jpeg', 0.9))
      } catch {
        toast('สร้างรูปไม่สำเร็จ ลองใหม่อีกครั้ง', 'warn')
      } finally {
        if (alive) setBusy(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [scene, puppet, puppetState, frame, toast])

  const dataUrlToFile = async (dataUrl) => {
    const blob = await (await fetch(dataUrl)).blob()
    return new File([blob], 'kanwat-kanon.jpg', { type: 'image/jpeg' })
  }

  const share = async () => {
    if (!shot) return
    try {
      const file = await dataUrlToFile(shot)
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'หนังใหญ่วัดขนอน',
          text: 'ถ่ายกับตัวหนังใหญ่ที่วัดขนอน ผ่านแอปกาลวัฒ',
        })
        return
      }
    } catch {
      /* user dismissed the sheet, or the browser refused the file */
    }
    const a = document.createElement('a')
    a.href = shot
    a.download = 'kanwat-kanon.jpg'
    a.click()
    toast('เครื่องนี้แชร์ตรงไม่ได้ — บันทึกรูปไว้ให้แล้ว', 'good')
  }

  const keep = () => {
    if (!shot) return
    storage.savePhoto(shot)
    toast('เก็บรูปไว้ในเครื่องแล้ว', 'good')
    onClose?.()
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[#1B0820]/95 backdrop-blur-sm">
      <div
        className="flex items-center justify-between px-4 pb-2 pt-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold200">
          ถ่ายรูปคู่กับตัวหนัง
        </p>
        <button
          onClick={onClose}
          aria-label="ปิด"
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/10 text-white"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-5">
        {shot ? (
          <img
            src={shot}
            alt="รูปที่ถ่ายกับตัวหนังใหญ่"
            className="max-h-full w-auto rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/15"
          />
        ) : (
          <p className="text-sm text-lavender300">{busy ? 'กำลังจัดรูป…' : ''}</p>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div
        className="px-5 pb-6 pt-4"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex justify-center gap-2">
          {FRAMES.map((f) => (
            <button
              key={f.id}
              onClick={() => setFrame(f.id)}
              aria-pressed={frame === f.id}
              className={`min-h-[44px] cursor-pointer rounded-full px-4 text-sm font-semibold transition-colors ${
                frame === f.id ? 'bg-gold200 text-maroon900' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <Button className="flex-1" disabled={!shot} onClick={share}>
            <Icon name="send" size={18} />
            แชร์
          </Button>
          <Button variant="ghost" className="flex-1" disabled={!shot} onClick={keep}>
            <Icon name="check" size={18} />
            เก็บไว้
          </Button>
        </div>
      </div>
    </div>
  )
}
