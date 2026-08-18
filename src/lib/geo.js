/** Small geo helpers — plain math, no dependencies. */
const R = 6371000
const rad = (d) => (d * Math.PI) / 180

/** metres between two [lat,lng] points */
export function distanceM(a, b) {
  const dLat = rad(b[0] - a[0])
  const dLng = rad(b[1] - a[1])
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export const fmtDistance = (m) =>
  m < 1000 ? `${Math.round(m)} ม.` : `${(m / 1000).toFixed(1)} กม.`

/** ระยะที่ถือว่า “ใกล้พอจะสแกน” */
export const NEAR_RADIUS_M = 120

/** compass bearing a → b, in degrees clockwise from true north */
export function bearing(a, b) {
  const dLng = rad(b[1] - a[1])
  const y = Math.sin(dLng) * Math.cos(rad(b[0]))
  const x =
    Math.cos(rad(a[0])) * Math.sin(rad(b[0])) -
    Math.sin(rad(a[0])) * Math.cos(rad(b[0])) * Math.cos(dLng)
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360
}

/** shortest signed turn from `from` to `to`: negative = turn left, positive = turn right */
export const relativeAngle = (from, to) => ((to - from + 540) % 360) - 180

/**
 * Turn the signed angle into the instruction the explorer actually needs.
 * Same four calls whether the angle came from a real compass or Demo Mode.
 */
export function hintFor(delta) {
  const a = Math.abs(delta)
  if (a <= 22) return { text: 'ตรงไป!', rot: delta }
  if (a >= 135) return { text: 'ข้างหลัง!', rot: delta }
  return delta < 0 ? { text: 'ซ้าย!', rot: delta } : { text: 'ขวา!', rot: delta }
}

/** ระยะที่ถือว่า “เจอแล้ว” เมื่อใช้ GPS จริง */
export const FOUND_RADIUS_M = 25
