/**
 * @fileoverview Gives a handler one identity for the life of a component while it keeps
 * running the latest render's version.
 */

import { useCallback, useLayoutEffect, useRef } from 'react'

/**
 * Wraps a handler so its identity never changes and its body is always the current one.
 *
 * This is for a handler handed to a context value or a memo. An inline callback has a new
 * identity every render and takes every memo depending on it with it, while a `useCallback`
 * with the right dependencies rebuilds whenever those change. This does neither.
 *
 * It is not for a value read during render: the latest version is only in place once the
 * render has committed. The write happens in a layout effect rather than during the render
 * for the same reason — a render React throws away must not leave its callback behind, and
 * writing during a render is what StrictMode and the compiler refuse.
 *
 * @template Args - What the handler is called with.
 * @template Result - What it answers.
 * @param {(...args: Args) => Result} callback - The latest render's version.
 * @returns {(...args: Args) => Result} A function that calls it and never changes identity.
 */
export function useEventCallback<Args extends unknown[], Result>(
  callback: (...args: Args) => Result,
): (...args: Args) => Result {
  const latest = useRef(callback)

  useLayoutEffect(() => {
    latest.current = callback
  })

  return useCallback((...args: Args) => latest.current(...args), [])
}
