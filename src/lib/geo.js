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
