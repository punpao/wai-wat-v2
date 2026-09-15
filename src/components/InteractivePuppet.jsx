import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { onDeviceTilt } from '../lib/tilt.js'

/**
 * A leather panel that can be pushed around — in the display case, or in the
 * hands of a puppeteer on the stage.
 *
 * A real หนังใหญ่ panel is rigid: the puppeteer moves the whole thing, it
 * never bends. So this does not deform. It swings on its sticks like the
 * genuine article, leaning into whatever pushes it and settling back under
 * spring and damping when let go.
 *
 * Two things push it. Tilting the phone is the one worth having, because
 * that is how you hold a panel up — the handset's roll and pitch feed the
 * same spring a finger does, so letting go of a tilted phone settles against
 * the tilt rather than snapping to dead centre. Dragging always works,
 * whether or not the sensor ever appears.
 *
 * `idle` names a CSS sway for something that is already being danced. It
 * lives on a wrapper so it composes with the drag instead of fighting it:
 * the performer keeps their step while the panel answers the finger.
 */
const InteractivePuppet = forwardRef(function InteractivePuppet(
  { src, at, idle, alt = 'ตัวหนังใหญ่', onFirstMove },
  ref,
) {
  const wrapRef = useRef(null)
  const imgRef = useRef(null)
  const moved = useRef(false)

  // position, tilt and their velocities live outside React for the raf loop
  const s = useRef({
    x: 0, y: 0, vx: 0, rot: 0, vrot: 0,
    dragging: false, px: 0, py: 0, tx: 0, ty: 0, trot: 0,
  })
  const [entered, setEntered] = useState(false)

  useImperativeHandle(ref, () => ({
    current: () => ({ ...s.current }),
    node: () => imgRef.current,
  }))

  const nudged = useCallback(() => {
    if (moved.current) return
    moved.current = true
    onFirstMove?.()
  }, [onFirstMove])

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(
    () =>
      onDeviceTilt((dg, db) => {
        const st = s.current
        st.tx = dg * 2.6
        st.ty = db * 0.9
        st.trot = dg * 0.42
        if (Math.abs(dg) > 3) nudged()
      }),
    [nudged],
  )

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const st = s.current
      if (!st.dragging) {
        // home is wherever the phone is currently tilted to
        st.vx += (st.tx - st.x) * 0.06
        st.vx *= 0.86
        st.x += st.vx
        st.vrot += (st.trot - st.rot) * 0.08
        st.vrot *= 0.88
        st.rot += st.vrot
        st.y += (st.ty - st.y) * 0.1
      }
      if (imgRef.current) {
        imgRef.current.style.transform =
          `translate3d(${st.x.toFixed(2)}px, ${st.y.toFixed(2)}px, 0) rotate(${st.rot.toFixed(2)}deg)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const down = (e) => {
    const st = s.current
    st.dragging = true
    st.px = e.clientX
    st.py = e.clientY
    wrapRef.current?.setPointerCapture?.(e.pointerId)
    nudged()
  }

  const move = (e) => {
    const st = s.current
    if (!st.dragging) return
    const dx = e.clientX - st.px
    const dy = e.clientY - st.py
    st.px = e.clientX
    st.py = e.clientY
    // the sticks are held at the bottom, so sideways push mostly becomes tilt
    st.x = Math.max(-90, Math.min(90, st.x + dx))
    st.y = Math.max(-40, Math.min(40, st.y + dy * 0.45))
    st.rot = Math.max(-16, Math.min(16, st.rot + dx * 0.14))
    st.vx = dx * 0.4
    st.vrot = dx * 0.08
  }

  const up = (e) => {
    s.current.dragging = false
    wrapRef.current?.releasePointerCapture?.(e.pointerId)
  }

  // sized by width in the case, by height on the stage — whichever the
  // placement reference measured is the one that stays true
  const { w, h, left = 0, top = 0 } = at ?? {}

  return (
    <div
      ref={wrapRef}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className="absolute z-20 cursor-grab touch-none active:cursor-grabbing"
      style={{
        width: w != null ? `${w}%` : undefined,
        height: h != null ? `${h}%` : undefined,
        left: `${left}%`,
        top: `${top}%`,
      }}
    >
      <span className={`block h-full w-full ${idle ? `anim-${idle}` : ''}`}>
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          className={`select-none drop-shadow-[0_18px_30px_rgba(0,0,0,0.5)] ${
            h != null ? 'h-full w-auto max-w-none' : 'w-full'
          }`}
          style={{
            opacity: entered ? 1 : 0,
            scale: entered ? '1' : '0.72',
            transition: 'opacity .55s ease, scale .55s cubic-bezier(.2,1.3,.4,1)',
          }}
        />
      </span>
    </div>
  )
})

export default InteractivePuppet
