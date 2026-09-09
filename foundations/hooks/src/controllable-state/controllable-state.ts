/**
 * @fileoverview Holds the state a component owns until its caller takes it over, which every
 * component that has a value has to get right the same way.
 */

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

/**
 * Describes the state a caller may take over.
 *
 * @template Value - The value being held.
 */
export interface ControllableStateOptions<Value> {
  /**
   * Sets what the state is until it changes, for as long as the caller does not own it.
   */
  defaultValue: Value

  /**
   * Reports the next value on every change, whether the caller owns the state or not.
   */
  onChange?: ((value: Value) => void) | undefined

  /**
   * Sets the value, which makes the caller the owner. Pass it with `onChange` or the state
   * never moves. Left `undefined`, the component owns the state.
   */
  value?: undefined | Value
}

/**
 * Says whether a setter was handed an updater rather than the value itself.
 *
 * `SetStateAction` is the value or a function of it, and a value that is itself a function
 * cannot be told apart from an updater — React has the same limitation, and this reads it the
 * same way React does.
 *
 * @template Value - The value being held.
 * @param {SetStateAction<Value>} action - The value or updater the setter was given.
 * @returns {boolean} `true` where it is a function to call with the previous value.
 */
function updates<Value>(action: SetStateAction<Value>): action is (was: Value) => Value {
  return typeof action === 'function'
}

/**
 * Holds state a component owns until its caller takes it over.
 *
 * It is uncontrolled while `value` is `undefined`: the component keeps the state and
 * `onChange` reports it. It is controlled once `value` is given: the component reports the
 * next value through `onChange` and renders whatever the caller passes back. The setter has
 * `useState`'s shape and takes an updater.
 *
 * The latest value and callback are read at call time so the setter keeps one identity. A
 * consumer's inline `onChange` then rebuilds no memo that depends on the setter.
 *
 * @template Value - The value being held.
 * @param {ControllableStateOptions<Value>} options - The default, the controlled value and
 *     the reporter. `ControllableStateOptions` documents every member.
 * @returns {[Value, Dispatch<SetStateAction<Value>>]} The value to render, and its setter.
 */
export function useControllableState<Value>({
  defaultValue,
  onChange,
  value,
}: ControllableStateOptions<Value>): [Value, Dispatch<SetStateAction<Value>>] {
  const [own, setOwn] = useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : own
  const latest = useRef({ current, onChange })

  useLayoutEffect(() => {
    latest.current = { current, onChange }
  })

  const set = useCallback<Dispatch<SetStateAction<Value>>>((action) => {
    const previous = latest.current.current
    const next = updates(action) ? action(previous) : action
    if (Object.is(next, previous)) return

    setOwn(next)
    latest.current.onChange?.(next)
  }, [])

  return [current, set]
}
