import type { Category } from '@/lib/types'

import { useQueryClient } from '@tanstack/react-query'
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import { useMemo } from 'react'

import { getFirestoreDb } from '@/lib/firebase'
import { queryKeys } from '@/lib/query-keys'

export function useCategoryMutations(uid: string | undefined) {
  const qc = useQueryClient()

  return useMemo(() => {
    if (uid === undefined) return null

    const db = getFirestoreDb()
    const userId = uid

    async function addCategory(input: { name: string; sortOrder: number }) {
      await addDoc(collection(db, 'users', userId, 'categories'), {
        archived: false,
        createdAt: Date.now(),
        name: input.name.trim(),
        sortOrder: input.sortOrder,
      })

      await qc.invalidateQueries({ queryKey: queryKeys.categories(userId) })
    }

    async function toggleArchive(category: Category) {
      await updateDoc(doc(db, 'users', userId, 'categories', category.id), {
        archived: !category.archived,
      })

      await qc.invalidateQueries({ queryKey: queryKeys.categories(userId) })
    }

    return { addCategory, toggleArchive }
  }, [qc, uid])
}
