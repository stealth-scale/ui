import { type ReactNode } from 'react'

import { act, fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'

import { useControllableState } from '#controllable-state/controllable-state.ts'

/** A counter that prints its value and steps by one on a click. */
function Probe({
  onChange,
  value,
}: Readonly<{
  onChange?: ((value: number) => void) | undefined
  value?: number | undefined
}>): ReactNode {
  const [count, setCount] = useControllableState<number>({ defaultValue: 0, onChange, value })
  return (
    <button
      onClick={() => {
        setCount((current) => current + 1)
      }}
      type="button"
    >
      {count}
    </button>
  )
}

describe('useControllableState', () => {
  it('owns the state while no value is given', () => {
    const onChange = vi.fn<(value: number) => void>()
    const { getByRole } = render(<Probe onChange={onChange} />)
    expect(getByRole('button')).toHaveTextContent('0')
    act(() => {
      getByRole('button').click()
    })
    expect(getByRole('button')).toHaveTextContent('1')
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('reads the caller’s value once one is given, and only reports the next one', () => {
    const onChange = vi.fn<(value: number) => void>()
    const { getByRole, rerender } = render(<Probe onChange={onChange} value={5} />)
    expect(getByRole('button')).toHaveTextContent('5')
    act(() => {
      getByRole('button').click()
    })
    expect(onChange).toHaveBeenCalledWith(6)
    expect(getByRole('button')).toHaveTextContent('5')
    rerender(<Probe onChange={onChange} value={6} />)
    expect(getByRole('button')).toHaveTextContent('6')
  })

  it('takes a plain value as well as an updater, and ignores a change to the same value', () => {
    const onChange = vi.fn<(value: number) => void>()

    // The setter is reached through the rendering rather than captured out of it: writing to
    // an object during a render is what a render React throws away leaves behind.
    function Direct({ next }: { next: number }): ReactNode {
      const [count, setCount] = useControllableState<number>({ defaultValue: 2, onChange })
      return (
        <button
          onClick={() => {
            setCount(next)
          }}
          type="button"
        >
          {count}
        </button>
      )
    }

    const { getByRole, rerender } = render(<Direct next={2} />)

    fireEvent.click(getByRole('button'))
    expect(onChange, 'a change to the value it already holds is no change').not.toHaveBeenCalled()

    rerender(<Direct next={9} />)
    fireEvent.click(getByRole('button'))

    expect(getByRole('button')).toHaveTextContent('9')
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
