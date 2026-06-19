import { cn } from './utils'

export function currencyClass({
  positive,
  primary,
}: {
  positive?: boolean
  primary?: boolean
} = {}) {
  return cn('tabular-nums', {
    'font-medium': !primary,
    'text-destructive': !positive,
    'text-destructive font-semibold': !positive && primary,
    'text-primary font-semibold': primary && positive,
  })
}
