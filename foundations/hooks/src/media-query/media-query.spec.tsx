import { type ReactNode } from 'react'

import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { useMediaQuery } from '#media-query/media-query.ts'

/** A component that prints the answer. */
function Probe({ query }: Readonly<{ query: string }>): ReactNode {
  return <p>{useMediaQuery(query) ? 'yes' : 'no'}</p>
}

/** A `matchMedia` under test control: one list, whose match can be flipped. */
function fakeMatchMedia(matches: boolean): {
  flip: (next: boolean) => void
  listeners: Set<() => void>
} {
  const listeners = new Set<() => void>()
  const list = {
    addEventListener: (_: string, listener: () => void): Set<() => void> => listeners.add(listener),
    matches,
    removeEventListener: (_: string, listener: () => void): boolean => listeners.delete(listener),
  }
  vi.stubGlobal('matchMedia', () => list)
  return {
    flip(next: boolean): void {
      list.matches = next
      for (const listener of listeners) listener()
    },
    listeners,
  }
}

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('answers false where the document cannot answer a media query', () => {
    // jsdom has no `matchMedia`, which is exactly the case this covers.
    const { container } = render(<Probe query="(prefers-color-scheme: dark)" />)
    expect(container.textContent).toBe('no')
  })

  it('answers what the document says, and follows it when it changes', () => {
    const media = fakeMatchMedia(false)
    const { container } = render(<Probe query="(prefers-color-scheme: dark)" />)
    expect(container.textContent).toBe('no')

    act(() => {
      media.flip(true)
    })
    expect(container.textContent).toBe('yes')
  })

  it('stops listening when it unmounts', () => {
    const media = fakeMatchMedia(true)
    const { unmount } = render(<Probe query="(prefers-reduced-motion: reduce)" />)
    expect(media.listeners.size).toBe(1)

    unmount()
    expect(media.listeners.size).toBe(0)
  })
})
