import { type ReactNode } from 'react'

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'

import { useAnnounce } from '#announce/announce.ts'

/** Draws whatever the hook says, so a spec reads it as text. */
function Sayer({ message }: { message: string }): ReactNode {
  return <output>{useAnnounce(message)}</output>
}

describe('useAnnounce', () => {
  it('says nothing on the first render, since arriving is not a change', () => {
    const { container } = render(<Sayer message="Offline" />)
    expect(container.textContent).toBe('')
  })

  it('says the message once it changes', () => {
    const { container, rerender } = render(<Sayer message="Live" />)
    rerender(<Sayer message="Offline" />)
    expect(container.textContent).toBe('Offline')
  })

  it('says nothing again for a re-render with the same message', () => {
    const { container, rerender } = render(<Sayer message="Live" />)
    rerender(<Sayer message="Live" />)
    expect(container.textContent).toBe('')
  })

  it('keeps saying the latest one through a run of changes', () => {
    const { container, rerender } = render(<Sayer message="Live" />)
    rerender(<Sayer message="Reconnecting" />)
    expect(container.textContent).toBe('Reconnecting')
    rerender(<Sayer message="Offline" />)
    expect(container.textContent).toBe('Offline')
  })

  it('takes an empty message as a real one, so a caller can fall silent', () => {
    const { container, rerender } = render(<Sayer message="Offline" />)
    rerender(<Sayer message="" />)
    expect(container.textContent).toBe('')
  })
})
