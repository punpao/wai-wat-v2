import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

/**
 * The puppet that lifts out of the poster and can be pushed around.
 *
 * A real หนังใหญ่ panel is rigid — the puppeteer moves the whole thing, it
 * never bends. So this does not deform: it swings on two sticks like the
 * genuine article, tilting into the direction it is dragged and settling
 * back under spring and damping when let go.
 *
 * The parent needs the live transform to bake it into a photo, so the
 * current pose is exposed through a ref rather than lifted into state —
 * sixty setStates a second while dragging would be a bad trade.
 */
const InteractivePuppet = forwardRef(function InteractivePuppet(
  { src, width = 300, onFirstMove },
  ref,
) {
  const wrapRef = useRef(null)
  const imgRef = useRef(null)
  const moved = useRef(false)

  // x, tilt and their velocities live outside React for the animation loop
  const s = useRef({ x: 0, y: 0, vx: 0, rot: 0, vrot: 0, dragging: false, px: 0, py: 0 })
  const [entered, setEntered] = useState(false)

  useImperativeHandle(ref, () => ({
    current: () => ({ ...s.current }),
    node: () => imgRef.current,
  }))

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const st = s.current
      if (!st.dragging) {
        // spring home
        st.vx += -st.x * 0.06
        st.vx *= 0.86
        st.x += st.vx
        st.vrot += -st.rot * 0.08
        st.vrot *= 0.88
        st.rot += st.vrot
        st.y *= 0.88
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
    if (!moved.current) {
      moved.current = true
      onFirstMove?.()
    }
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

  return (
    <div
      ref={wrapRef}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className="absolute left-1/2 top-[34%] z-20 -translate-x-1/2 cursor-grab touch-none active:cursor-grabbing"
      style={{ width }}
    >
      <img
        ref={imgRef}
        src={src}
        alt="ตัวหนังใหญ่"
        draggable={false}
        className="w-full select-none drop-shadow-[0_22px_34px_rgba(0,0,0,0.55)]"
        style={{
          opacity: entered ? 1 : 0,
          scale: entered ? '1' : '0.72',
          transition: 'opacity .55s ease, scale .55s cubic-bezier(.2,1.3,.4,1)',
        }}
      />
    </div>
  )
})

export default InteractivePuppet
