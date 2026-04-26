import type { Firestore } from 'firebase/firestore'

import { collection, doc, getDocs, limit, query, writeBatch } from 'firebase/firestore'

const DEFAULTS = [
  { name: 'Mua sắm', sortOrder: 10 },
  { name: 'Tín dụng', sortOrder: 20 },
  { name: 'Sinh hoạt', sortOrder: 30 },
  { name: 'Di chuyển', sortOrder: 40 },
  { name: 'Khác', sortOrder: 99 },
] as const

export async function ensureDefaultCategories(db: Firestore, uid: string): Promise<void> {
  const col = collection(db, 'users', uid, 'categories')
  const snap = await getDocs(query(col, limit(1)))
  if (!snap.empty) return

  const batch = writeBatch(db)
  for (const row of DEFAULTS) {
    const ref = doc(col)
    batch.set(ref, {
      archived: false,
      createdAt: Date.now(),
      name: row.name,
      sortOrder: row.sortOrder,
    })
  }
  await batch.commit()
}
