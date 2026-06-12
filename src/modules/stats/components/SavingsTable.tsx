import type { SavingsTableProps } from './SavingsTableDesktop'

import { SavingsMobileList } from './SavingsMobileList'
import { SavingsTableDesktop } from './SavingsTableDesktop'

export type { SavingsTableProps }

export function SavingsTable(props: SavingsTableProps) {
  return (
    <>
      <div className="hidden md:block">
        <SavingsTableDesktop {...props} />
      </div>
      <div className="md:hidden">
        <SavingsMobileList {...props} />
      </div>
    </>
  )
}
