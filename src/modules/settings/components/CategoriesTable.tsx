import type { CategoriesTableProps } from './CategoriesTableDesktop'

import { CategoriesMobileList } from './CategoriesMobileList'
import { CategoriesTableDesktop } from './CategoriesTableDesktop'

export type { CategoriesTableProps }

export function CategoriesTable(props: CategoriesTableProps) {
  return (
    <>
      <div className="hidden md:block">
        <CategoriesTableDesktop {...props} />
      </div>
      <div className="md:hidden">
        <CategoriesMobileList {...props} />
      </div>
    </>
  )
}
