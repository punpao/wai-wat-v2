import { useLocation } from 'react-router-dom'

/**
 * Which register the app is in.
 *
 * Derived from the route, never from stored state alone: opening /elder
 * directly (or reloading on it) has to render the Elder theme, otherwise
 * the paper-surface pages inherit the dark User theme and their text turns
 * white-on-white. The stored role only persists the last choice so "/"
 * knows where to land.
 */
export const useIsElder = () => useLocation().pathname.startsWith('/elder')
