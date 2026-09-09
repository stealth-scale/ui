import { type ReactNode } from 'react'

import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'

import { useStoredValue } from '#stored-value/stored-value.ts'

/** A component that prints the value and stores whatever its button says. */
function Probe({ next }: Readonly<{ next: string }>): ReactNode {
  const [value, store] = useStoredValue('probe', 'fallback')
  return (
    <button
      onClick={() => {
        store(next)
      }}
      type="button"
    >
      {value}
    </button>
  )
}

describe('useStoredValue', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reads the fallback until something is stored', () => {
    const { getByRole } = render(<Probe next="stored" />)
    expect(getByRole('button')).toHaveTextContent('fallback')
  })

  it('stores the next value and re-renders with it', () => {
    const { getByRole } = render(<Probe next="stored" />)
    act(() => {
      getByRole('button').click()
    })
    expect(getByRole('button')).toHaveTextContent('stored')
    expect(localStorage.getItem('probe')).toBe('stored')
  })

  it('tells every reader of the key in this document, not only the writer', () => {
    const { getAllByRole } = render(
      <>
        <Probe next="first" />
        <Probe next="second" />
      </>,
    )
    act(() => {
      getAllByRole('button')[1]?.click()
    })
    expect(getAllByRole('button').map((button) => button.textContent)).toEqual(['second', 'second'])
  })

  it('follows a write from another document on the origin', () => {
    const { getByRole } = render(<Probe next="stored" />)
    act(() => {
      localStorage.setItem('probe', 'elsewhere')
      globalThis.dispatchEvent(new StorageEvent('storage', { key: 'probe' }))
    })
    expect(getByRole('button')).toHaveTextContent('elsewhere')
  })

  it('reads the fallback where the document refuses storage, rather than failing to render', () => {
    const refuse = vi.spyOn(globalThis, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('storage is blocked')
    })
    const { getByRole } = render(<Probe next="second" />)

    expect(
      getByRole('button'),
      'a blocked store throws on the read, not an empty answer',
    ).toHaveTextContent('fallback')

    act(() => {
      getByRole('button').click()
    })

    expect(getByRole('button'), 'and writing it is refused just as quietly').toHaveTextContent(
      'fallback',
    )
    refuse.mockRestore()
  })
})
