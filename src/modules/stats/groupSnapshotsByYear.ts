import type { MonthSnapshot } from '@/lib/budget/aggregate'

export function groupSnapshotsByYear(snaps: MonthSnapshot[]): { rows: MonthSnapshot[]; year: string }[] {
  const byYear = new Map<string, MonthSnapshot[]>()
  for (const s of snaps) {
    const year = s.month.slice(0, 4)
    const list = byYear.get(year)
    if (list) list.push(s)
    else byYear.set(year, [s])
  }
  return [...byYear.entries()].map(([year, rows]) => ({ rows, year }))
}
