import type { QueryCompositeFilterConstraint, QueryConstraint } from 'firebase/firestore'

export type FirestoreQueryChunk = QueryCompositeFilterConstraint | QueryConstraint
