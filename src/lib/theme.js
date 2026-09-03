import { useEffect } from 'react'
import { storage } from './storage.js'
import { useStore } from './useStore.js'

/**
 * Which register the app is painted in — dark by default, light on
 * request, remembered in the same store as everything else.
 *
 * The attribute lands on <html> rather than on a wrapper because the
 * body's own background sits outside React's tree; without it, a light
 * page would scroll past its bounds into a dark gutter.
 */
export function useTheme() {
  const theme = useStore().theme === 'light' ? 'light' : 'dark'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return {
    theme,
    isLight: theme === 'light',
    toggle: () => storage.setTheme(theme === 'light' ? 'dark' : 'light'),
    set: storage.setTheme,
  }
}
