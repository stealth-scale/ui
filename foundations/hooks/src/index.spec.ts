import { describe, expect, it } from 'vite-plus/test'

import * as hooks from '#index.ts'

describe('the package barrel', () => {
  it('exports every hook a component reads, and nothing else', () => {
    expect(Object.keys(hooks).toSorted()).toEqual([
      'useAnnounce',
      'useControllableState',
      'useEventCallback',
      'useMediaQuery',
      'useStoredValue',
      'useTicker',
    ])
  })
})
