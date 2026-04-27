import type { FirestoreQueryChunk } from '@/lib/firestore/queryTypes'

import { and, or, where } from 'firebase/firestore'

import { calendarYearStartEndKeys } from '@/lib/month'

/** Firestore query slice: periods whose [validFrom, validTo] overlaps calendar year `year` (validTo null = open-ended). */
export function periodOverlapsCalendarYearConstraints(year: number): FirestoreQueryChunk[] {
  const { end: yearEnd, start: yearStart } = calendarYearStartEndKeys(year)
  return [
    or(
      and(where('validFrom', '<=', yearEnd), where('validTo', '>=', yearStart)),
      and(where('validFrom', '<=', yearEnd), where('validTo', '==', null)),
    ),
  ]
}
