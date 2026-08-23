import type { CategoryIncomeSplit } from '@/lib/budget/categoryIncomeSplit'
import type { IncomeSplit } from '@/lib/budget/incomeSplit'
import type { Category } from '@/lib/types'
import type { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { Panel } from '@/components/patterns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'

import { StatsCategorySplitChart } from './StatsCategorySplitChart'
import { StatsIncomeSplitChart } from './StatsIncomeSplitChart'

export function StatsIncomeSplitTabs({
  categories,
  categorySplit,
  filters,
  split,
}: {
  categories: Category[]
  categorySplit: CategoryIncomeSplit
  filters: ReactNode
  split: IncomeSplit
}) {
  const { t } = useTranslation('stats')

  return (
    <Panel bodyClassName="overflow-visible px-2 pb-3 pt-1" title={t('chartTitleIncomeSplit')}>
      <Tabs defaultValue="overview">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="grid h-11 w-full grid-cols-2 gap-1 sm:h-10 sm:w-auto sm:min-w-[16rem]">
            <TabsTrigger className="min-w-0 px-2 text-xs sm:px-3 sm:text-sm" value="overview">
              <span className="min-w-0 truncate">{t('chartTabIncomeOverview')}</span>
            </TabsTrigger>
            <TabsTrigger className="min-w-0 px-2 text-xs sm:px-3 sm:text-sm" value="category">
              <span className="min-w-0 truncate">{t('chartTabIncomeCategory')}</span>
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">{filters}</div>
        </div>
        <TabsContent className="mt-3" value="overview">
          <StatsIncomeSplitChart embedded split={split} />
        </TabsContent>
        <TabsContent className="mt-3" value="category">
          <StatsCategorySplitChart categories={categories} split={categorySplit} />
        </TabsContent>
      </Tabs>
    </Panel>
  )
}
