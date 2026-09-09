/**
 * @fileoverview Runs one second-hand for every subscriber on the page, rather than one timer
 * per component.
 */

import { useSyncExternalStore } from 'react'

/**
 * Sets how often the shared clock ticks, in milliseconds.
 */
const EVERY = 1000

/**
 * Holds the one interval every subscriber reads.
 *
 * A component that owns its own interval is fine until there are two hundred of them: a tray
 * of running jobs then holds two hundred timers firing at two hundred slightly different
 * moments, each waking React for one row, and the elapsed times drift visibly apart because
 * none of them tick together. This is a single interval, started when the first subscriber
 * arrives and stopped when the last one leaves.
 *
 * `visibilitychange` is watched for the same reason: a backgrounded tab throttles timers to
 * once a minute or stops them, and the first thing a returning reader needs is a figure that
 * is not a minute stale.
 */
const clock = {
  handle: undefined as ReturnType<typeof setInterval> | undefined,
  listeners: new Set<() => void>(),
  ticks: 0,
}

/**
 * Moves the clock on and wakes everything watching it.
 */
function tick(): void {
  clock.ticks += 1
  for (const listener of clock.listeners) listener()
}

/**
 * Joins the shared clock, starting it where nothing was watching yet.
 *
 * @param {() => void} listener - The subscriber to wake on each tick.
 * @returns {() => void} The function that leaves, stopping the clock behind the last one out.
 */
function subscribe(listener: () => void): () => void {
  clock.listeners.add(listener)
  clock.handle ??= globalThis.setInterval(tick, EVERY)
  if (clock.listeners.size === 1) globalThis.document?.addEventListener('visibilitychange', tick)

  return () => {
    clock.listeners.delete(listener)
    if (clock.listeners.size > 0) return

    globalThis.clearInterval(clock.handle)
    clock.handle = undefined
    globalThis.document?.removeEventListener('visibilitychange', tick)
  }
}

/**
 * Reads how many times the shared clock has ticked.
 *
 * @returns {number} The count.
 */
function ticks(): number {
  return clock.ticks
}

/**
 * Reads a clock that never ticks, for a subscriber that is not live and for the server.
 *
 * @returns {number} Zero, every time.
 */
function still(): number {
  return 0
}

/**
 * Subscribes to nothing, for a subscriber that is not live.
 *
 * @returns {() => void} A function that leaves nothing.
 */
function ignore(): () => void {
  return () => {}
}

/**
 * Answers a value that changes once a second while `live`, off one shared interval.
 *
 * The number means nothing on its own: it is a tick count rather than a time. Read the clock
 * yourself when it changes, so a component that needs the current instant calls `Date.now()`
 * in its own render and stays correct across a backgrounded tab and a system clock that moved.
 *
 * @param {boolean} live - Whether this subscriber wants waking.
 * @returns {number} A number that changes every second while live, and never otherwise.
 */
export function useTicker(live: boolean): number {
  return useSyncExternalStore(live ? subscribe : ignore, live ? ticks : still, still)
}
