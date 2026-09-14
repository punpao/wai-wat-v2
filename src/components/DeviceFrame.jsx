/**
 * The prototype, shown as the thing it is: an app on a phone.
 *
 * On a phone this is nothing — the shell is the viewport and the app runs
 * edge to edge. On anything wider it becomes a handset sitting on a dark
 * stage, which is how this gets presented: the artwork is all shot to a
 * phone crop, and stretching it across a laptop makes it read as a website
 * rather than as the thing you hold up in front of a display case.
 *
 * The `transform` on the shell is load-bearing, not decoration. A
 * transformed element becomes the containing block for `position: fixed`
 * descendants, so every pinned bar, sheet, toast and the full-screen
 * journey lands inside the handset instead of escaping to the browser
 * window. Take it away and the app leaks out of its own frame.
 */
export default function DeviceFrame({ children, ...rest }) {
  return (
    <div className="device-stage">
      <div className="device-shell" {...rest}>
        {children}
      </div>
    </div>
  )
}
