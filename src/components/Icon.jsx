/**
 * SVG icon set — no emoji anywhere in the UI.
 * Every icon inherits currentColor and sits on a 24×24 grid.
 */
const paths = {
  map: 'M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Zm0 0v13m6-10.5v13',
  scan: 'M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M4 12h16',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 0c-3.6 0-6.5 2.4-6.5 5.4V20h13v-2.6c0-3-2.9-5.4-6.5-5.4Z',
  home: 'M4 10.6 12 4l8 6.6M6.2 9.4V20h11.6V9.4',
  clips: 'M4 6h16M4 12h16M4 18h10M18.5 15.5v5l4-2.5-4-2.5Z',
  gift: 'M3 11h18v9H3v-9Zm0-4h18v4H3V7Zm9 0v13M12 7S9.6 3 7.6 4.2 9.9 7 12 7Zm0 0s2.4-4 4.4-2.8S14.1 7 12 7Z',
  heart: 'M12 20s-7.5-4.4-7.5-9.3A4.2 4.2 0 0 1 12 8.2a4.2 4.2 0 0 1 7.5 2.5C19.5 15.6 12 20 12 20Z',
  spark: 'M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.3l-1.8-5.7L4.5 10.8 10.2 9 12 3.5Z',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'm9 5 7 7-7 7',
  chevronDown: 'm5 9 7 7 7-7',
  play: 'M8 5.5v13l11-6.5-11-6.5Z',
  pause: 'M9 5.5v13M15 5.5v13',
  layers: 'm12 3.5 8.5 4.5L12 12.5 3.5 8l8.5-4.5ZM4 12.5 12 17l8-4.5M4 16.5 12 21l8-4.5',
  pin: 'M12 21s6.5-6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21Zm0-8.3a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5.5-5.5 2 2-5.5 5.5-2Z',
  flame: 'M12 21c3.6 0 6-2.3 6-5.4 0-3.9-4.2-5.3-3.2-10.6-2.6 1-4.4 3.3-4.4 5.6 0 1.2-.7 1.8-1.4 1.8-.9 0-1.5-.8-1.5-2C6.3 11.6 6 13.4 6 15.6 6 18.7 8.4 21 12 21Z',
  medal: 'M12 14a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm-3 .8L7.5 21l4.5-2.2L16.5 21 15 14.8',
  hospital: 'M4 20V8.5L12 4l8 4.5V20H4Zm8-9v5m-2.5-2.5h5',
  broom: 'M10 3.5l1.7 4.3 4.3 1.7-4.3 1.7L10 15.5l-1.7-4.3L4 9.5l4.3-1.7L10 3.5Zm7.5 8 .9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9.9-2.3Z',
  scissors: 'M7 7.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm1.6-11.6L20 20M8.6 15.6 20 4',
  stethoscope: 'M6 4v5a4 4 0 0 0 8 0V4M10 17v-4M10 17a4 4 0 0 0 8 0v-2m0 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  send: 'M4 12 20 5l-7 15-2.2-6.2L4 12Z',
  refresh: 'M20 12a8 8 0 1 1-2.6-5.9M20 4v4.5h-4.5',
  sliders: 'M5 7h9m3 0h2M5 17h3m3 0h9M14 4.5v5M8 14.5v5',
  ear: 'M4 10.5v3M8 7.5v9M12 4.5v15M16 8.5v7M20 11v2',
  quote: 'M4.5 5.5h15v11h-8.5l-4.5 3.5v-3.5h-2v-11ZM8.5 9.5h7M8.5 12.5h4',
  arrowRight: 'M4.5 12h14m-5.5-6 6 6-6 6',
  bank: 'M3.5 9.5 12 4.5l8.5 5M5.5 10.5v7m4-7v7m5-7v7m4-7v7M3.5 20h17',
}

export default function Icon({ name, size = 22, stroke = 1.8, className = '', filled = false }) {
  const d = paths[name] ?? paths.spark
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  )
}
