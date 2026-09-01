import { describe, expect, it } from 'vitest'

import { hashPin, PIN_ITERATIONS, PIN_KDF, timingSafeEqual, verifyPin } from '@/lib/pinCrypto'

describe('timingSafeEqual', () => {
  it('returns true for identical strings', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true)
  })

  it('returns false for different strings of the same length', () => {
    expect(timingSafeEqual('abc', 'abd')).toBe(false)
  })

  it('returns false for different lengths', () => {
    expect(timingSafeEqual('ab', 'abc')).toBe(false)
  })
})

describe('hashPin / verifyPin', () => {
  it('hashes a PIN and verifies the same PIN', async () => {
    const result = await hashPin('123456')
    expect(result.kdf).toBe(PIN_KDF)
    expect(result.iterations).toBe(PIN_ITERATIONS)
    expect(result.hash).toMatch(/^[0-9a-f]{64}$/)
    expect(result.salt).toMatch(/^[0-9a-f]{32}$/)
    await expect(verifyPin('123456', result.hash, result.salt, result.iterations)).resolves.toBe(true)
  })

  it('rejects a wrong PIN', async () => {
    const result = await hashPin('123456')
    await expect(verifyPin('000000', result.hash, result.salt, result.iterations)).resolves.toBe(false)
  })
})
