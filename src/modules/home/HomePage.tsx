import { useAuthContext } from '@/components/AuthProvider'
import { PageHeading } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { useActualExpenses, useBudgetItems, useIncomePeriods } from '@/hooks/useUserCollections'
import { t } from '@/lib/strings'
import { formatVnd } from '@/lib/vnd'

import { HomeSummaryTiles } from './components/HomeSummaryTiles'
import { useHomeData } from './hooks/useHomeData'

export function HomePage() {
  const { user } = useAuthContext()
  const uid = user?.uid

  const { data: income = [] } = useIncomePeriods(uid)
  const { data: budget = [] } = useBudgetItems(uid)
  const { data: actuals = [] } = useActualExpenses(uid)

  const { cur, month } = useHomeData({ actuals, budget, income })

  return (
    <RequireAuth>
      <div className="space-y-6">
        <PageHeading title={t.home.title} description={t.home.subtitle} descriptionClassName="text-base" />
        <HomeSummaryTiles
          month={month}
          plannedSurplusLabel={cur ? formatVnd(cur.plannedSurplusVnd) : '—'}
          actualSurplusLabel={cur ? formatVnd(cur.actualSurplusVnd) : '—'}
        />
      </div>
    </RequireAuth>
  )
}
