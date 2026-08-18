/**
 * storage.js — the ONLY place this prototype touches persistence.
 *
 * Everything is a single JSON blob in localStorage behind a tiny
 * pub/sub so React re-renders on write. Swap the read()/write()
 * bodies for `fetch` calls and the rest of the app is unchanged.
 */
import { ELDERS } from '../data/elders.js'
import { allCheckpoints } from '../data/locations.js'

const KEY = 'waiwat:v1'

const seed = () => {
  const cps = allCheckpoints()
  return {
    role: 'user',
    user: { name: 'ผู้สำรวจ', streak: 4, points: 0 },
    /** discoveries: [{ checkpointId, clipId, elderId, at, encouraged, comments:[] }] */
    discoveries: [],
    /** per-clip social stats, keyed by clip id — seeded so the Elder role has content on first run */
    clipStats: Object.fromEntries(
      cps.map((c, i) => [
        c.clip.id,
        {
          listeners: 18 + ((i * 37) % 120),
          likes: 6 + ((i * 13) % 48),
          comments:
            i % 3 === 0
              ? [
                  {
                    id: `seed-${c.clip.id}`,
                    from: 'ผู้สำรวจนิรนาม',
                    text: 'ฟังแล้วนึกถึงคุณยายเลยครับ ขอบคุณที่เล่าเก็บไว้นะครับ',
                    at: Date.now() - (i + 2) * 86400000,
                    kind: 'comment',
                  },
                ]
              : [],
        },
      ]),
    ),
    /** the demo signs in as this elder when the role switch flips */
    elderId: ELDERS[0].id,
    elderWallet: { balance: 1240, earnedTotal: 3180 },
    redemptions: [],
  }
}

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
    /* quota / private mode — the demo keeps working from memory */
  }
  listeners.forEach((fn) => fn(cache))
  return cache
}

const update = (fn) => write(fn(structuredClone(read())))

export const storage = {
  get: read,
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },

  setRole: (role) => update((s) => ({ ...s, role })),
  setElder: (elderId) => update((s) => ({ ...s, elderId })),

  /** Mark a checkpoint found. Idempotent: replaying a clip never double-counts. */
  addDiscovery(checkpoint) {
    return update((s) => {
      if (s.discoveries.some((d) => d.checkpointId === checkpoint.id)) return s
      s.discoveries.unshift({
        checkpointId: checkpoint.id,
        clipId: checkpoint.clip.id,
        elderId: checkpoint.elderId,
        at: Date.now(),
        comments: [],
      })
      s.user.points += checkpoint.clip.points
      const stat = s.clipStats[checkpoint.clip.id]
      if (stat) stat.listeners += 1
      return s
    })
  },

  isDiscovered: (checkpointId) =>
    read().discoveries.some((d) => d.checkpointId === checkpointId),

  /**
   * ส่งกำลังใจ — writes into the same clipStats the Elder role reads,
   * so a single-device demo shows the whole loop.
   */
  sendEncouragement({ clipId, text, kind = 'comment' }) {
    return update((s) => {
      const stat = s.clipStats[clipId]
      if (!stat) return s
      stat.likes += 1
      stat.comments.unshift({
        id: `c-${Date.now()}`,
        from: s.user.name,
        text,
        at: Date.now(),
        kind,
      })
      const d = s.discoveries.find((x) => x.clipId === clipId)
      if (d) d.comments.unshift({ text, at: Date.now(), kind })
      s.elderWallet.balance += 5
      s.elderWallet.earnedTotal += 5
      return s
    })
  },

  redeem(reward) {
    return update((s) => {
      if (s.elderWallet.balance < reward.cost) return s
      s.elderWallet.balance -= reward.cost
      s.redemptions.unshift({
        id: `r-${Date.now()}`,
        ref: `WW-${String(Date.now()).slice(-6)}`,
        rewardId: reward.id,
        name: reward.name,
        cost: reward.cost,
        at: Date.now(),
        status: 'กำลังนัดหมาย',
      })
      return s
    })
  },

  resetAll: () => write(seed()),
}
