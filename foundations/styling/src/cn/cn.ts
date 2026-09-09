/**
 * @fileoverview Merges the class names a component builds with the ones its caller passed.
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names so the last conflicting utility wins.
 *
 * `clsx` alone concatenates, so `cn('p-2', 'p-4')` would emit both and leave CSS source order
 * to decide, which is not something a caller can predict. `twMerge` makes the later value
 * win, which is what a `className` override is for: a caller passes `p-4` to replace the
 * component's `p-2`, not to sit beside it.
 *
 * @param {ClassValue[]} inputs - The class names, in the order they should be applied, with
 *     the caller's last.
 * @returns {string} The merged list, with each conflicting utility resolved to the last one.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
