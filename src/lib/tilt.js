/**
 * The handset's own tilt, as one shared source.
 *
 * More than one thing on screen can answer to it — the theatre has two
 * puppeteers — and they must all agree on which way is level and share a
 * single `deviceorientation` listener rather than each arming their own.
 *
 * The reference angle is deliberately sticky. It is taken once, when the
 * first thing that cares appears, and kept: re-taking it from whatever
 * angle the phone happens to be at makes a tilt left read as level and
 * returning to level read as a tilt right.
 */
const movers = new Set()
const watchers = new Set()

let attached = false
let level = null
let state = 'idle' // idle | live | denied | unavailable

const gated = () =>
  typeof DeviceOrientationEvent !== 'undefined' &&
  typeof DeviceOrientationEvent.requestPermission === 'function'

const publish = (next) => {
  if (next !== state) {
    state = next
    watchers.forEach((fn) => fn())
  }
}

function onTilt(e) {
  if (e.gamma == null && e.beta == null) return
  const g = e.gamma ?? 0
  const b = e.beta ?? 0
  if (!level) level = { g, b }
  // gamma is the left/right roll, beta the front/back pitch
  const dg = Math.max(-28, Math.min(28, g - level.g))
  const db = Math.max(-22, Math.min(22, b - level.b))
  publish('live')
  movers.forEach((fn) => fn(dg, db))
}

function attach() {
  if (attached) return
  if (typeof DeviceOrientationEvent === 'undefined') return publish('unavailable')
  window.addEventListener('deviceorientation', onTilt)
  attached = true
}

/** A thing that leans when the phone leans. Returns an unsubscribe. */
export function onDeviceTilt(fn) {
  // first one on screen re-takes level: a new scene is a new way of holding it
  if (movers.size === 0) level = null
  movers.add(fn)
  if (!gated()) attach()
  return () => movers.delete(fn)
}

/** iOS hands the sensor over only from a user gesture. */
export async function askForTilt() {
  try {
    const res = await DeviceOrientationEvent.requestPermission()
    if (res !== 'granted') return publish('denied')
    attach()
    publish('live')
  } catch {
    publish('denied')
  }
}

export const tiltNeedsAsking = () => gated() && state === 'idle'

export const subscribeTiltState = (fn) => {
  watchers.add(fn)
  return () => watchers.delete(fn)
}
export const tiltState = () => state
