import { useNavigate, useParams } from 'react-router-dom'
import { placeById } from '../data/places.js'
import { useStore } from '../lib/useStore.js'
import { storage } from '../lib/storage.js'
import { Button } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'

/**
 * รายละเอียดสถานที่ — everything worth knowing before setting off, and one
 * unmistakable way to set off.
 *
 * The start button is pinned to the bottom rather than placed after the
 * text: this screen is read standing at the gate, and the action should not
 * depend on how far the visitor scrolled.
 */
export default function PlaceDetail() {
  const { placeId } = useParams()
  const navigate = useNavigate()
  const state = useStore()
  const place = placeById(placeId)

  if (!place || place.status !== 'live') {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-lavender300">ยังไม่เปิดให้บริการ AR ที่นี่</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>
          กลับหน้าแรก
        </Button>
      </div>
    )
  }

  const done = state.progress[place.id]?.done ?? []
  const started = done.length > 0
  const finished = done.length >= place.checkpoints.length

  return (
    <div className="pb-36">
      {/* Same as the home card: this block is text over a photograph, so it
          keeps the dark vocabulary whichever register the page is in. */}
      <div data-theme="dark" className="relative h-64 overflow-hidden">
        <img src={place.cover} alt={place.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B0F30] via-[#2B0F30]/30 to-[#2B0F30]/45" />

        <button
          onClick={() => navigate('/')}
          aria-label="ย้อนกลับ"
          className="absolute left-4 grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm"
          style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
        >
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>

        <div className="absolute inset-x-5 bottom-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold200">
            {place.craft}
          </p>
          <h1 className="text-[30px] font-semibold leading-tight text-white">{place.name}</h1>
          <p className="mt-0.5 text-sm text-lavender300">
            {place.district} · {place.province}
          </p>
        </div>
      </div>

      <div className="space-y-6 px-5 pt-5">
        <div className="flex flex-wrap gap-2">
          <Chip icon="pin" text={`${place.checkpoints.length} จุด`} />
          <Chip icon="clock" text={place.duration} />
          <Chip icon="users" text="ปราชญ์ชุมชนพาชม" />
        </div>

        <p className="text-[15px] leading-relaxed text-white/85">{place.about}</p>

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold200">
            ไฮไลต์
          </h2>
          <ul className="mt-3 space-y-2">
            {place.highlights.map((h) => (
              <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-white/85">
                <Icon name="spark" size={16} className="mt-0.5 shrink-0 text-gold200" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold200">
            เส้นทางในวัด
          </h2>
          <ol className="mt-3 space-y-2">
            {place.checkpoints.map((cp) => {
              const ok = done.includes(cp.id)
              return (
                <li
                  key={cp.id}
                  className="flex gap-3 rounded-2xl bg-white/6 p-3.5 ring-1 ring-white/10"
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                      ok ? 'bg-gold200 text-maroon900' : 'bg-white/10 text-gold200'
                    }`}
                  >
                    {ok ? <Icon name="check" size={18} stroke={2.4} /> : cp.order}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-snug">
                      {cp.name}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-lavender300">
                      {cp.blurb}
                    </span>
                  </span>
                </li>
              )
            })}
          </ol>
        </div>

        {started && (
          <button
            onClick={() => storage.resetPlace(place.id)}
            className="w-full cursor-pointer rounded-2xl bg-white/5 px-4 py-3 text-center text-sm text-lavender300 ring-1 ring-white/10 transition-colors hover:bg-white/10"
          >
            เริ่มเส้นทางใหม่ตั้งแต่ต้น
          </button>
        )}
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-[900] border-t border-white/10 px-5 pb-5 pt-4 backdrop-blur-md"
        style={{
          background: 'var(--app-chrome)',
          paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
        }}
      >
        <Button size="lg" className="w-full" onClick={() => navigate(`/place/${place.id}/map`)}>
          <Icon name="scan" size={22} />
          {finished
            ? 'เดินเส้นทาง AR อีกครั้ง'
            : started
              ? 'ไปต่อในเส้นทาง AR'
              : 'เริ่มเส้นทาง AR'}
        </Button>
        <p className="mt-2 text-center text-[11px] text-lavender300">
          เปิดแผนที่ในวัด แล้วเดินไปที่จุดแรกเพื่อเริ่มสแกน
        </p>
      </div>
    </div>
  )
}

function Chip({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/10">
      <Icon name={icon} size={14} className="text-gold200" />
      {text}
    </span>
  )
}
