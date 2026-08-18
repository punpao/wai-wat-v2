import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

/**
 * Where the explorer "is".
 *
 * Real device geolocation when available — but a simulated position always
 * wins, because judges are not going to walk to พระนครศรีอยุธยา during a
 * five-minute demo. Demo Mode writes here; every proximity check reads here.
 */
const PositionCtx = createContext(null)
export const usePosition = () => useContext(PositionCtx)

export function PositionProvider({ children }) {
  const [real, setReal] = useState(null)
  const [accuracy, setAccuracy] = useState(null)
  const [sim, setSim] = useState(null)
  const [geoState, setGeoState] = useState('idle') // idle | asking | live | denied | unsupported
  const watchId = useRef(null)

  const startWatching = useCallback(() => {
    if (!('geolocation' in navigator)) return setGeoState('unsupported')
    if (watchId.current != null) return
    setGeoState('asking')
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        setReal([p.coords.latitude, p.coords.longitude])
        setAccuracy(p.coords.accuracy ?? null)
        setGeoState('live')
      },
      (err) => setGeoState(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 },
    )
  }, [])

  useEffect(
    () => () => {
      // Resetting the ref matters: without it the guard in startWatching would
      // treat the cleared watch as still active and never re-subscribe.
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current)
        watchId.current = null
      }
    },
    [],
  )

  const value = {
    position: sim ?? real,
    real,
    accuracy: sim ? null : accuracy,
    sim,
    isSimulated: !!sim,
    geoState,
    startWatching,
    /** jump the explorer next to a checkpoint (Demo Mode) */
    simulateNear(cp, offsetM = 90) {
      const dLat = offsetM / 111320
      setSim([cp.lat + dLat * 0.6, cp.lng + dLat * 0.8])
    },
    setSim,
    clearSim: () => setSim(null),
  }
  return <PositionCtx.Provider value={value}>{children}</PositionCtx.Provider>
}
