/**
 * @fileoverview Keeps a preference in `localStorage` and reads it as state, in every document
 * on the origin and in every component that asks for the same key.
 */

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Lists who is reading a stored value in this document.
 *
 * The `storage` event fires only in *other* documents on the origin, so a write here has to
 * be announced here by hand, or the component that wrote it is the only one that never hears
 * about it.
 */
const listeners = new Set<() => void>()

/**
 * Reads the store, where the document has one.
 *
 * A document can refuse storage: a server has none, and a browser told to block it throws on
 * the first read rather than answering empty. Answering nothing is what lets the fallback
 * stand instead of the component failing to render.
 *
 * @returns {Storage | undefined} The store, or nothing where the document refuses one.
 */
function store(): Storage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

/**
 * Reads what is kept under one key.
 *
 * @param {string} key - Where it is kept.
 * @returns {string | undefined} The value, or nothing where the key or the store is absent.
 */
function read(key: string): string | undefined {
  return store()?.getItem(key) ?? undefined
}

/**
 * Holds a string in `localStorage` and reads it as state.
 *
 * Every component reading the same key sees the same value, in this document and in every
 * other document on the origin. What goes in it is a preference, a locale or a colour mode,
 * and never anything a session depends on: storage is readable by any script on the origin
 * and it survives signing out.
 *
 * @param {string} key - Where the value is kept.
 * @param {string} fallback - The value it reads as until something is stored.
 * @returns {[string, (next: string) => void]} The value, and a function that stores the next.
 */
export function useStoredValue(key: string, fallback: string): [string, (next: string) => void] {
  const subscribe = useCallback((onChange: () => void): (() => void) => {
    listeners.add(onChange)
    globalThis.addEventListener('storage', onChange)
    return () => {
      listeners.delete(onChange)
      globalThis.removeEventListener('storage', onChange)
    }
  }, [])

  // No server snapshot: `store` already answers nothing where the document has none, so the
  // one snapshot reads as the fallback on a server and needs no second copy of that.
  const value = useSyncExternalStore(subscribe, (): string => read(key) ?? fallback)

  const keep = useCallback(
    (next: string) => {
      store()?.setItem(key, next)
      for (const listener of listeners) listener()
    },
    [key],
  )

  return [value, keep]
}
