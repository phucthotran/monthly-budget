import type { FieldMeta } from '@tanstack/react-form'

export function firstFieldErrorMessage(meta: FieldMeta): string | undefined {
  for (const e of meta.errors) {
    if (typeof e === 'string' && e.length > 0) return e
  }
  return undefined
}
