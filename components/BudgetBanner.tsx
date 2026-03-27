'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import Link from 'next/link'

interface Props {
  monthlyTotal: number
  budget: number
}

export default function BudgetBanner({ monthlyTotal, budget }: Props) {
  const { t } = useLanguage()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const pct = Math.round((monthlyTotal / budget) * 100)
  const over = pct >= 100
  if (pct < 80) return null

  const colors = over
    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
  const iconColor  = over ? 'text-red-600 dark:text-red-400'    : 'text-amber-600 dark:text-amber-400'
  const iconBg     = over ? 'bg-red-100 dark:bg-red-900/60'     : 'bg-amber-100 dark:bg-amber-900/60'
  const titleColor = over ? 'text-red-900 dark:text-red-300'    : 'text-amber-900 dark:text-amber-300'
  const subColor   = over ? 'text-red-600 dark:text-red-500'    : 'text-amber-600 dark:text-amber-500'
  const numColor   = over ? 'text-red-700 dark:text-red-400'    : 'text-amber-700 dark:text-amber-400'

  return (
    <div className={`border rounded-xl p-5 ${colors}`}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4 min-w-0">
          <div className={`${iconBg} p-2.5 rounded-lg shrink-0`}>
            <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${titleColor}`}>
              {over ? t('budget_banner_over') : t('budget_banner_warning')}
            </p>
            <p className={`text-xs mt-0.5 ${subColor}`}>
              {t('budget_banner_sub')}{' '}
              <Link href="/settings" className="underline hover:no-underline">{t('nav_settings')}</Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className={`text-2xl font-bold ${numColor}`}>
              {pct}%
            </p>
            <p className={`text-xs ${subColor}`}>
              €{monthlyTotal.toFixed(0)} {t('budget_of')} €{budget}
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${subColor}`}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
