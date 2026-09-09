import { type ReactNode } from 'react'

import { act, render } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'

import { useEventCallback } from '#event-callback/event-callback.ts'

/** Hands out the wrapped function; what it returns is read after the commit, never during render. */
function Probe({ label }: Readonly<{ label: string }>): ReactNode {
  const speak = useEventCallback((suffix: string) => `${label}${suffix}`)
  handles.push(speak)
  return <output>{label}</output>
}

/** Every identity handed out, one per render. */
const handles: ((suffix: string) => string)[] = []

describe('useEventCallback', () => {
  it('keeps one identity across renders and runs the latest version', () => {
    const { getByRole, rerender } = render(<Probe label="first" />)
    expect(getByRole('status')).toHaveTextContent('first')
    act(() => {
      expect(handles[0]?.('!')).toBe('first!')
    })
    rerender(<Probe label="second" />)
    expect(getByRole('status')).toHaveTextContent('second')
    expect(handles[0]).toBe(handles[1])
    act(() => {
      expect(handles[0]?.('?')).toBe('second?')
    })
  })
})
