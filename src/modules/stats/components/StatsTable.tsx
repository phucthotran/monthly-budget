import type { StatsTableProps } from './StatsTableDesktop'

import { StatsTableDesktop } from './StatsTableDesktop'
import { StatsTableMobileList } from './StatsTableMobileList'

export type { StatsTableProps }

export function StatsTable(props: StatsTableProps) {
  return (
    <>
      <div className="hidden md:block">
        <StatsTableDesktop {...props} />
      </div>
      <div className="md:hidden">
        <StatsTableMobileList {...props} />
      </div>
    </>
  )
}
