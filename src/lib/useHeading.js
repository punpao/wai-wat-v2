import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Which way the phone is actually pointing.
 *
 * iOS reports a true compass heading on `webkitCompassHeading`, but only
 * after DeviceOrientationEvent.requestPermission() is called from a user
 * gesture. Android reports it as `alpha` on the absolute orientation event,
 * measured counter-clockwise, so it has to be flipped. Screen rotation is
 * added back in so the arrow stays correct when the phone is held sideways.
 *
 * Returns a heading in degrees clockwise from north, or null when the device
 * has no usable compass — the caller falls back to Demo Mode then.
 */
export function useHeading() {
  const [heading, setHeading] = useState(null)
  // idle | needs-permission | listening | live | denied | unsupported
  const [state, setState] = useState('idle')
  // Listening is driven by this flag alone. Keying it on `state` would tear the
  // listener down the moment the first reading flipped state to 'live'.
  const [enabled, setEnabled] = useState(false)
  const gotReading = useRef(false)

  const needsPermission =
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (typeof DeviceOrientationEvent === 'undefined') return setState('unsupported')
    if (needsPermission) return setState('needs-permission')
    setState('listening')
    setEnabled(true)
  }, [needsPermission])

  const handler = useCallback((e) => {
    let h = null
    if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading
    else if (e.absolute && typeof e.alpha === 'number') h = 360 - e.alpha
    if (h == null || Number.isNaN(h)) return

    const screenAngle =
      (typeof screen !== 'undefined' && screen.orientation?.angle) || window.orientation || 0
    gotReading.current = true
    setState('live')
    setHeading((h + screenAngle + 360) % 360)
  }, [])

  useEffect(() => {
    if (!enabled) return
    window.addEventListener('deviceorientationabsolute', handler, true)
    window.addEventListener('deviceorientation', handler, true)
    // A device that never sends a usable reading is treated as having no compass.
    const t = setTimeout(() => {
      if (!gotReading.current) setState('unsupported')
    }, 3000)
    return () => {
      clearTimeout(t)
      window.removeEventListener('deviceorientationabsolute', handler, true)
      window.removeEventListener('deviceorientation', handler, true)
    }
  }, [enabled, handler])

  /** Must be called from a tap on iOS, or the permission prompt never appears. */
  const request = useCallback(async () => {
    if (!needsPermission) {
      setState('listening')
      setEnabled(true)
      return
    }
    try {
      const res = await DeviceOrientationEvent.requestPermission()
      if (res === 'granted') {
        setState('listening')
        setEnabled(true)
      } else {
        setState('denied')
      }
    } catch {
      setState('denied')
    }
  }, [needsPermission])

  return { heading, state, request, isLive: state === 'live' && heading != null }
}
