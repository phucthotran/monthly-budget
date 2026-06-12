import type { BudgetItemsTableProps } from './BudgetItemsTableDesktop'

import { BudgetItemsMobileList } from './BudgetItemsMobileList'
import { BudgetItemsTableDesktop } from './BudgetItemsTableDesktop'

export type { BudgetItemsTableProps }

export function BudgetItemsTable(props: BudgetItemsTableProps) {
  return (
    <>
      <div className="hidden md:block">
        <BudgetItemsTableDesktop {...props} />
      </div>
      <div className="md:hidden">
        <BudgetItemsMobileList {...props} />
      </div>
    </>
  )
}
