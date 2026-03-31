'use client'

import { PiggyBank } from 'lucide-react'
import { Subscription } from '@/types/subscription'
import { useLanguage } from '@/components/LanguageProvider'
import { paidThisYear, getYearlyEquivalent } from '@/lib/renewalUtils'

export default function SavingsBanner({ subscriptions }: { subscriptions: Subscription[] }) {
  const { t } = useLanguage()

  const stopped = subscriptions.filter(
    (s) => s.status === 'cancelled' || s.status === 'paused' || s.status === 'inactive'
  )
  if (stopped.length === 0) return null

  const rows = stopped
    .map((s) => ({
      name:   s.name,
      saved:  Math.max(0, getYearlyEquivalent(s.price, s.billing_cycle) - paidThisYear(s.price, s.billing_cycle, s.start_date)),
      status: s.status,
    }))
    .filter((r) => r.saved > 0)

  const totalSaved = rows.reduce((sum, r) => sum + r.saved, 0)
  if (totalSaved < 0.01) return null

  return (
    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4 min-w-0">
          <div className="bg-emerald-100 dark:bg-emerald-900/60 p-2.5 rounded-lg shrink-0">
            <PiggyBank className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
              {t('savings_headline')}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
              {rows.length === 1 ? rows[0].name : `${rows.length} ${t('savings_sub_one')}`}
            </p>
            <div className="mt-2.5 flex flex-col gap-1">
              {rows.map((r) => (
                <div key={r.name} className="flex items-center gap-2">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                    r.status === 'cancelled' ? 'bg-red-400' : 'bg-amber-400'
                  }`} />
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 truncate">{r.name}</span>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 shrink-0">
                    €{r.saved.toFixed(2)} {t('savings_saving')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">€{totalSaved.toFixed(2)}</p>
          <p className="text-xs text-emerald-500 dark:text-emerald-600 mt-1">{t('savings_vs_year')}</p>
        </div>
      </div>
    </div>
  )
}
