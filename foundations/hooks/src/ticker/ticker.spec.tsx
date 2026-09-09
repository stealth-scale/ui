import { type ReactNode } from 'react'

import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

import { useTicker } from '#ticker/ticker.ts'

/** Counts its own renders, which is what a shared clock is meant to cause. */
function Watcher({ live, onRender }: { live: boolean; onRender: () => void }): ReactNode {
  const tick = useTicker(live)
  onRender()
  return <output>{tick}</output>
}

describe('useTicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('wakes a live subscriber once a second', () => {
    const onRender = vi.fn<() => void>()
    render(<Watcher live onRender={onRender} />)
    const before = onRender.mock.calls.length
    // Wrapped, or the store's notification lands outside React's batching and never flushes.
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(onRender.mock.calls.length).toBeGreaterThan(before)
  })

  it('never wakes a subscriber that is not live', () => {
    const onRender = vi.fn<() => void>()
    render(<Watcher live={false} onRender={onRender} />)
    const before = onRender.mock.calls.length
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(onRender.mock.calls.length).toBe(before)
  })

  it('reads as still for a subscriber that is not live', () => {
    const { container } = render(<Watcher live={false} onRender={() => {}} />)
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(container.textContent).toBe('0')
  })

  it('holds one interval for many subscribers rather than one each', () => {
    const started = vi.spyOn(globalThis, 'setInterval')
    render(
      <>
        <Watcher live onRender={() => {}} />
        <Watcher live onRender={() => {}} />
        <Watcher live onRender={() => {}} />
      </>,
    )
    expect(started).toHaveBeenCalledTimes(1)
    started.mockRestore()
  })

  it('ticks every subscriber to the same value, so a list cannot drift apart', () => {
    const { container } = render(
      <>
        <Watcher live onRender={() => {}} />
        <Watcher live onRender={() => {}} />
      </>,
    )
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    const [first, second] = [...container.querySelectorAll('output')].map((o) => o.textContent)
    expect(first).toBe(second)
  })

  it('stops the interval once the last subscriber leaves', () => {
    const stopped = vi.spyOn(globalThis, 'clearInterval')
    const { unmount } = render(<Watcher live onRender={() => {}} />)
    unmount()
    expect(stopped).toHaveBeenCalled()
    stopped.mockRestore()
  })

  it('wakes on a tab coming back, since a throttled timer leaves a stale figure', () => {
    const onRender = vi.fn<() => void>()
    render(<Watcher live onRender={onRender} />)
    const before = onRender.mock.calls.length
    act(() => {
      globalThis.document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(onRender.mock.calls.length).toBeGreaterThan(before)
  })
})
