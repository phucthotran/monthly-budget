import { useTranslation } from 'react-i18next'

import { IncomeSplitChart } from '@/components/patterns'
import { useMoney } from '@/hooks/useMoney'
import { type IncomeSplit, overspentSharePercent } from '@/lib/budget/incomeSplit'

export function StatsIncomeSplitChart({ split }: { split: IncomeSplit }) {
  const { t } = useTranslation('stats')
  const { format } = useMoney()

  return (
    <IncomeSplitChart
      actualLabel={t('chartActual')}
      centerLabel={t('chartIncomeSplitCenter')}
      centerOverspentLabel={t('chartIncomeSplitCenterOver')}
      empty={t('chartIncomeSplitEmpty')}
      leftoverLabel={t('chartLeftover')}
      overspent={t('chartIncomeSplitOverspent', {
        amount: format(split.overspentVnd),
        percent: overspentSharePercent(split),
      })}
      split={split}
      title={t('chartTitleIncomeSplit')}
    />
  )
}
