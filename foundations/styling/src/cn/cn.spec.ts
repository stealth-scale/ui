import { describe, expect, it } from 'vite-plus/test'

import { cn } from '#cn/cn.ts'

describe('cn', () => {
  it('lets the last conflicting utility win, which is what an override is for', () => {
    expect(cn('p-2', 'p-4'), 'source order would otherwise decide').toBe('p-4')
    expect(cn('text-sm text-muted-foreground', 'text-lg')).toBe('text-muted-foreground text-lg')
  })

  it('keeps utilities that do not conflict, in the order they were given', () => {
    expect(cn('inline-flex', 'rounded-sm', 'px-1')).toBe('inline-flex rounded-sm px-1')
  })

  it('reads the shapes a component builds a class list from', () => {
    expect(cn('base', ['a', 'b'], { skipped: false, taken: true })).toBe('base a b taken')
    expect(cn('base', undefined, null, false), 'a variant a component did not set').toBe('base')
  })
})
