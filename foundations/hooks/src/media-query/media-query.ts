/**
 * @fileoverview Reads a media query and keeps reading it, so what follows the system follows
 * the system.
 */

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Reads the list for one query, where the document can answer one at all.
 *
 * @param {string} query - The query, as CSS writes it.
 * @returns {MediaQueryList | undefined} The list, or nothing in a document without
 *     `matchMedia`.
 */
function listFor(query: string): MediaQueryList | undefined {
  return typeof globalThis.matchMedia === 'function' ? globalThis.matchMedia(query) : undefined
}

/**
 * Answers whether a media query matches, and keeps answering.
 *
 * It subscribes to the query rather than reading it once, so a theme that follows the system
 * flips when the system does. Where `matchMedia` does not exist, in a test document or on a
 * server, the answer is `false` and never changes, which is the honest answer for a document
 * with no viewport.
 *
 * @param {string} query - The query, as CSS writes it: `(prefers-color-scheme: dark)`.
 * @returns {boolean} Whether it matches right now.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void): (() => void) => {
      const list = listFor(query)
      if (list === undefined) return (): void => undefined

      list.addEventListener('change', onChange)
      return () => {
        list.removeEventListener('change', onChange)
      }
    },
    [query],
  )

  return useSyncExternalStore(subscribe, () => listFor(query)?.matches ?? false)
}
