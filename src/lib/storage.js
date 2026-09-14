/**
 * storage.js — the ONLY place this prototype touches persistence.
 *
 * One JSON blob in localStorage behind a tiny pub/sub so React re-renders on
 * write. Swap the read()/write() bodies for `fetch` and nothing else changes.
 */

const KEY = 'kanwat:v1'

const seed = () => ({
  /** which register the app is painted in: 'dark' | 'light' */
  theme: 'dark',
  /** progress: { [placeId]: { done: [checkpointId], beat: { [cpId]: index } } } */
  progress: {},
  /** photos taken in the AR photo booth, newest first: [{ id, dataUrl, at }] */
  photos: [],
  /** bookings: [{ id, ref, workshopId, slotId, day, time, price, at }] */
  bookings: [],
})

let cache = null
const listeners = new Set()

function read() {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    cache = raw ? { ...seed(), ...JSON.parse(raw) } : seed()
  } catch {
    cache = seed()
  }
  return cache
}

function write(next) {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* quota / private mode — the demo keeps running from memory */
  }
  listeners.forEach((fn) => fn(cache))
  return cache
}

const update = (fn) => write(fn(structuredClone(read())))

const placeProgress = (s, placeId) => {
  if (!s.progress[placeId]) s.progress[placeId] = { done: [], beat: {} }
  return s.progress[placeId]
}

export const storage = {
  get: read,
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },

  setTheme: (theme) =>
    update((s) => {
      s.theme = theme === 'light' ? 'light' : 'dark'
      return s
    }),

  /** Remember how far into a checkpoint's script the visitor got. */
  setBeat: (placeId, cpId, index) =>
    update((s) => {
      placeProgress(s, placeId).beat[cpId] = index
      return s
    }),

  completeCheckpoint: (placeId, cpId) =>
    update((s) => {
      const p = placeProgress(s, placeId)
      if (!p.done.includes(cpId)) p.done.push(cpId)
      return s
    }),

  /** Start the tour over — the presenter's reset between demo runs. */
  resetPlace: (placeId) =>
    update((s) => {
      delete s.progress[placeId]
      return s
    }),

  savePhoto: (dataUrl) =>
    update((s) => {
      s.photos.unshift({ id: `ph-${Date.now()}`, dataUrl, at: Date.now() })
      s.photos = s.photos.slice(0, 12)
      return s
    }),

  /**
   * จองรอบเวิร์กช็อป — a local record only. No payment provider is contacted
   * anywhere in this prototype and nothing is charged; the price is kept so
   * the confirmation can show what a real booking would cost.
   */
  book: (workshop, slot) =>
    update((s) => {
      if (s.bookings.some((b) => b.slotId === slot.id)) return s
      s.bookings.unshift({
        id: `bk-${Date.now()}`,
        ref: `KW-${String(Date.now()).slice(-6)}`,
        workshopId: workshop.id,
        workshopTitle: workshop.title,
        slotId: slot.id,
        day: slot.day,
        time: slot.time,
        price: workshop.price,
        at: Date.now(),
      })
      return s
    }),

  cancelBooking: (bookingId) =>
    update((s) => {
      s.bookings = s.bookings.filter((b) => b.id !== bookingId)
      return s
    }),

  resetAll: () => write(seed()),
}
