/**
 * @fileoverview Holds back a live region's message until it is news rather than state.
 */

import { useEffect, useRef, useState } from 'react'

/**
 * Answers a message once it has changed, and nothing until then.
 *
 * A live region filled on mount announces the state of everything on the page the moment it
 * loads, which is noise rather than news, and on a board of indicators it is a chorus. The
 * first render establishes the state; it does not change it.
 *
 * The message is a string rather than a node because a live region announces text. A caller
 * assembles the sentence, which is also what lets it decide there is nothing to say and pass
 * an empty one.
 *
 * @param {string} message - The sentence that would be said, or empty for nothing.
 * @returns {string} The message once it has changed, and an empty string before that.
 */
export function useAnnounce(message: string): string {
  const previous = useRef<null | string>(null)
  const [said, setSaid] = useState('')

  useEffect(() => {
    const before = previous.current
    previous.current = message
    if (before === null || before === message) return
    setSaid(message)
  }, [message])

  return said
}
