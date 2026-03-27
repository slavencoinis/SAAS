'use client'

import { useLanguage } from '@/components/LanguageProvider'

interface Props {
  monthlyTotal: number
  budget: number | null
}

export default function BudgetIndicator({ monthlyTotal, budget }: Props) {
  const { t } = useLanguage()

  if (!budget) {
    return (
      <span className="text-xs text-gray-400 dark:text-gray-500">{t('budget_no_limit')}</span>
    )
  }

  const pct = Math.round((monthlyTotal / budget) * 100)
  const over    = pct >= 100
  const warning = pct >= 80 && pct < 100

  const pill = over
    ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
    : warning
    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
    : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${pill}`}>
      {pct}% {t('budget_used')}
    </span>
  )
}
