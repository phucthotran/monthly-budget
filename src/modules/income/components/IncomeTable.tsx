import type { IncomeTableProps } from './IncomeTableDesktop'

import { IncomeMobileList } from './IncomeMobileList'
import { IncomeTableDesktop } from './IncomeTableDesktop'

export type { IncomeTableProps }

export function IncomeTable(props: IncomeTableProps) {
  return (
    <>
      <div className="hidden md:block">
        <IncomeTableDesktop {...props} />
      </div>
      <div className="md:hidden">
        <IncomeMobileList {...props} />
      </div>
    </>
  )
}
