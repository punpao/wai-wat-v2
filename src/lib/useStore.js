import { useSyncExternalStore } from 'react'
import { storage } from './storage.js'

/** Subscribe a component to the whole store. Prototype-simple on purpose. */
export function useStore() {
  return useSyncExternalStore(storage.subscribe, storage.get, storage.get)
}
