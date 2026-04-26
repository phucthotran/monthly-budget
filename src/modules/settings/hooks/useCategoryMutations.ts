import type { Category } from '@/lib/types'

import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'

import { getFirestoreDb } from '@/lib/firebase'

export function categoryMutations(uid: string) {
  const db = getFirestoreDb()

  async function addCategory(input: { name: string; sortOrder: number }) {
    await addDoc(collection(db, 'users', uid, 'categories'), {
      archived: false,
      createdAt: Date.now(),
      name: input.name.trim(),
      sortOrder: input.sortOrder,
    })
  }

  async function toggleArchive(category: Category) {
    await updateDoc(doc(db, 'users', uid, 'categories', category.id), {
      archived: !category.archived,
    })
  }

  async function deleteCategory(category: Category) {
    await deleteDoc(doc(db, 'users', uid, 'categories', category.id))
  }

  return { addCategory, deleteCategory, toggleArchive }
}
