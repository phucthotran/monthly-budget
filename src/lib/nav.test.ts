import { describe, expect, it } from 'vitest'

import { navItems, resolveSwipeTarget } from '@/lib/nav'

describe('resolveSwipeTarget', () => {
  it('follows the nav bar order in both directions', () => {
    expect(resolveSwipeTarget('/', 1)).toBe('/stats')
    expect(resolveSwipeTarget('/stats', 1)).toBe('/budget')
    expect(resolveSwipeTarget('/budget', -1)).toBe('/stats')
    expect(resolveSwipeTarget('/stats', -1)).toBe('/')
  })

  it('returns null at either end of the bar', () => {
    const last = navItems[navItems.length - 1].to
    expect(resolveSwipeTarget('/', -1)).toBeNull()
    expect(resolveSwipeTarget(last, 1)).toBeNull()
  })

  it('returns null for routes outside the nav bar', () => {
    expect(resolveSwipeTarget('/login', 1)).toBeNull()
    expect(resolveSwipeTarget('/login', -1)).toBeNull()
  })

  it('round-trips every adjacent pair', () => {
    for (const [index, item] of navItems.entries()) {
      const next = resolveSwipeTarget(item.to, 1)
      if (index === navItems.length - 1) {
        expect(next).toBeNull()
        continue
      }
      expect(next).toBe(navItems[index + 1].to)
      expect(resolveSwipeTarget(next as string, -1)).toBe(item.to)
    }
  })
})
