import type { PinKdf, PinLockDoc } from '@/lib/types'

export const PIN_LENGTH = 6
export const PIN_DIGIT_REGEX = /^\d{6}$/
export const PIN_KDF: PinKdf = 'pbkdf2-sha256'
export const PIN_ITERATIONS = 100_000

const PIN_KEY_BITS = 256
const SALT_BYTES = 16

export type PinHashResult = {
  hash: string
  iterations: number
  kdf: PinKdf
  salt: string
}

export function pinLockHasHash(
  doc: null | PinLockDoc | undefined,
): doc is { iterations: number; pinHash: string; pinSalt: string } & PinLockDoc {
  return Boolean(doc?.pinHash && doc.pinSalt && typeof doc.iterations === 'number')
}

export function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.trim()
  if (normalized.length === 0 || normalized.length % 2 !== 0) return new Uint8Array()
  const out = new Uint8Array(normalized.length / 2)
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

async function derivePinHash(pin: string, salt: Uint8Array, iterations: number): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    {
      hash: 'SHA-256',
      iterations,
      name: 'PBKDF2',
      salt: salt as BufferSource,
    },
    keyMaterial,
    PIN_KEY_BITS,
  )
  return bytesToHex(new Uint8Array(bits))
}

export async function hashPin(
  pin: string,
  salt?: Uint8Array,
  iterations: number = PIN_ITERATIONS,
): Promise<PinHashResult> {
  const saltBytes = salt ?? crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await derivePinHash(pin, saltBytes, iterations)
  return { hash, iterations, kdf: PIN_KDF, salt: bytesToHex(saltBytes) }
}

export async function verifyPin(pin: string, hash: string, saltHex: string, iterations: number): Promise<boolean> {
  const computed = await derivePinHash(pin, hexToBytes(saltHex), iterations)
  return timingSafeEqual(computed, hash)
}
