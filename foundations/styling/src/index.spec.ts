import { describe, expect, it } from 'vite-plus/test'

import * as styling from '#index.ts'

describe('the package barrel', () => {
  it('exports the one thing every component reaches for', () => {
    expect(Object.keys(styling).toSorted()).toEqual(['cn'])
  })
})
