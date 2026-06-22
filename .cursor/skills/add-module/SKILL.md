# Skill: Add Feature Module

## When to use

Load this skill when the user asks to:

- Add a new page / section / feature to the app
- Scaffold a new module (e.g. "add a goals module", "add a recurring expenses page")

## Checklist (execute in order)

Work through each step below. Skip steps that already exist.

---

### Step 1 — Domain type (`src/lib/types.ts`)

Add the entity interface. Follow the existing pattern: `id`, `createdAt`, `updatedAt` (epoch ms), domain fields.

```ts
export interface <Entity> {
  id: string
  // ... domain fields
  createdAt: number
  updatedAt: number
}
```

---

### Step 2 — Strings (`src/lib/strings.ts`)

Add a namespace under `t.<feature>` (keep keys alphabetically sorted within the block):

```ts
<feature>: {
  add: '...',
  deleteDialogTitle: '...',
  emptyList: '...',
  pageDetail: '...',
  pageLead: '...',
  title: '...',
  // field labels, hints, etc.
},
```

For delete confirmation body text with dynamic values, add a named function at the bottom of the file:

```ts
export function <feature>DeleteDialogP1(label: string) {
  return `Bạn sắp xóa ... "${label}". Thao tác này không thể hoàn tác.`
}
```

---

### Step 3 — Query key (`src/lib/query-keys.ts`)

```ts
<feature>s: (uid: string): QueryKey => ['<feature>s', uid],
```

Keep keys alphabetically sorted.

---

### Step 4 — Domain hook (`src/hooks/useUserCollections.ts`)

Add a new exported hook following this pattern:

```ts
export function use<Feature>s(uid: string | undefined) {
  const segments = useMemo(
    () => (uid ? (['users', uid, '<feature>s'] as const) : undefined),
    [uid],
  )
  const queryKey = useMemo(() => ['<feature>s', uid] as const, [uid])
  const q = useFirestoreCollection<<Entity>>(uid, segments, queryKey)
  const data = useMemo(
    () => [...(q.data ?? [])].sort((a, b) => viCollator.compare(a.<nameField> ?? '', b.<nameField> ?? '')),
    [q.data],
  )
  return { ...q, data }
}
```

Use `viCollator` (already defined at the top of the file) for A-Z sorting.
For entities with `validFrom`, sort by `validFrom` asc first, then A-Z by name.

---

### Step 5 — Module folder structure

Create `src/modules/<feature>/` with:

```
src/modules/<feature>/
├── <Feature>Page.tsx          # Main page component
├── components/
│   ├── <Feature>Dialog.tsx    # Create/edit dialog (see add-dialog skill)
│   └── <Feature>Table.tsx     # or <Feature>List.tsx for mobile
├── hooks/
│   └── use<Feature>Mutations.ts
└── schemas/
    └── <feature>FormSchema.ts
```

---

### Step 6 — Mutation hook (`src/modules/<feature>/hooks/use<Feature>Mutations.ts`)

```ts
import { useQueryClient } from '@tanstack/react-query'
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { useMemo } from 'react'

import { getFirestoreDb } from '@/lib/firebase'
import { queryKeys } from '@/lib/query-keys'
import type { <Entity> } from '@/lib/types'

export type <Entity>Input = {
  // form-submitted fields (no id / timestamps)
}

export function use<Feature>Mutations(uid: string | undefined) {
  const qc = useQueryClient()
  return useMemo(() => {
    if (!uid) return null
    const db = getFirestoreDb()
    const userId = uid

    async function create(input: <Entity>Input) {
      const now = Date.now()
      const payload = { ...input, updatedAt: now }
      const docRef = await addDoc(collection(db, 'users', userId, '<feature>s'), {
        ...payload,
        createdAt: now,
      })
      const newItem: <Entity> = { ...payload, createdAt: now, id: docRef.id }
      qc.setQueriesData<<Entity>[]>({ queryKey: queryKeys.<feature>s(userId) }, (old) => {
        if (!old) return old
        return [...old, newItem]
      })
    }

    async function update(id: string, input: <Entity>Input) {
      const payload = { ...input, updatedAt: Date.now() }
      await updateDoc(doc(db, 'users', userId, '<feature>s', id), payload)
      qc.setQueriesData<<Entity>[]>({ queryKey: queryKeys.<feature>s(userId) }, (old) => {
        if (!old) return old
        return old.map((item) => (item.id === id ? { ...item, ...payload } : item))
      })
    }

    async function remove(id: string) {
      await deleteDoc(doc(db, 'users', userId, '<feature>s', id))
      qc.setQueriesData<<Entity>[]>({ queryKey: queryKeys.<feature>s(userId) }, (old) => {
        if (!old) return old
        return old.filter((item) => item.id !== id)
      })
    }

    return { create, remove, update }
  }, [qc, uid])
}
```

---

### Step 7 — Zod schema (`src/modules/<feature>/schemas/<feature>FormSchema.ts`)

```ts
import { z } from 'zod'
import { t } from '@/lib/strings'

export const <feature>FormSchema = z.object({
  name: z.string().refine((s) => s.trim().length > 0, { message: t.validation.nameRequired }),
  // ... other fields
})

export type <Feature>FormValues = z.infer<typeof <feature>FormSchema>
```

---

### Step 8 — Page component (`src/modules/<feature>/<Feature>Page.tsx`)

```ts
import { useRef } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { PageHeading } from '@/components/patterns'
import { t } from '@/lib/strings'
import { use<Feature>s } from '@/hooks/useUserCollections'
import { use<Feature>Mutations } from './hooks/use<Feature>Mutations'
import { <Feature>Dialog, type <Feature>DialogHandle } from './components/<Feature>Dialog'

export function <Feature>Page() {
  const { user } = useAuth()
  const { data, isHydrated } = use<Feature>s(user?.uid)
  const mutations = use<Feature>Mutations(user?.uid)
  const dialogRef = useRef<<Feature>DialogHandle>(null)

  return (
    <>
      <PageHeading
        title={t.<feature>.title}
        lead={t.<feature>.pageLead}
        detail={t.<feature>.pageDetail}
        action={{ label: t.<feature>.add, onClick: () => dialogRef.current?.openCreate() }}
      />
      {/* table / list goes here */}
      <Feature>Dialog
        ref={dialogRef}
        onSubmit={async (editing, value) => {
          if (editing) await mutations?.update(editing.id, value)
          else await mutations?.create(value)
        }}
      />
    </>
  )
}
```

---

### Step 9 — Thin route (`src/routes/<feature>.tsx`)

```ts
import { createRoute } from '@tanstack/react-router'
import { <Feature>Page } from '@/modules/<feature>/<Feature>Page'
import { rootRoute } from './__root'

export const <feature>Route = createRoute({
  component: <Feature>Page,
  getParentRoute: () => rootRoute,
  path: '/<feature>',
})
```

Then register the route in `src/routeTree.ts` and add a nav link in `AppShell.tsx` using `t.nav.<feature>`.

---

## Key rules to follow

- `00-core-project-standards` — structure, types, VND utils
- `04-strings-and-ui-text` — all copy in `t.*`
- `07-data-layer` — hooks, mutation shape, query keys
- `08-responsive-dialog` — dialog shell (load `add-dialog` skill for the dialog)
