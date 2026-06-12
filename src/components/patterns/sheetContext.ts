import { createContext, useContext } from 'react'

export const SheetVariantContext = createContext<'dialog' | 'drawer'>('dialog')

export function useSheetVariant() {
  return useContext(SheetVariantContext)
}
