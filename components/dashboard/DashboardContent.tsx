'use client'

import Link from 'next/link'
import { AlertTriangle, XCircle } from 'lucide-react'
import { differenceInDays } from 'date-fns'
import { Subscription } from '@/types/subscription'
import { useLanguage } from '@/components/LanguageProvider'
import { getDisplayRenewal, formatRenewal, BILLING_STATUSES } from '@/lib/renewalUtils'
import { StatusBadge, UsageBadge } from '@/components/StatusBadge'
import CostByCategoryChart from '@/components/charts/CostByCategoryChart'
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart'

function getMonthlyEquivalent(price: number, cycle: string): number {
  if (cycle === 'yearly')   return price / 12
  if (cycle === 'weekly')   return price * 4.33
  if (cycle === 'one-time') return 0
  return price
}

export default function DashboardContent({ subscriptions }: { subscriptions: Subscription[] }) {
  const { t } = useLanguage()
  const today = new Date()

  const active = subscriptions.filter((s) => (BILLING_STATUSES as readonly string[]).includes(s.status))
  const monthlyTotal = active.reduce((sum, s) => sum + getMonthlyEquivalent(s.price, s.billing_cycle), 0)
  const yearlyTotal = monthlyTotal * 12
  const unused = subscriptions.filter((s) => s.usage_status === 'unused' && s.status === 'active')
  const expiringSoon = subscriptions.filter((s) => {
    if (!(BILLING_STATUSES as readonly string[]).includes(s.status)) return false
    const d = getDisplayRenewal(s.renewal_date, s.start_date, s.billing_cycle)
    if (!d) return false
    const days = differenceInDays(d, today)
    return days >= 0 && days <= 7
  })

  return (
    <div className="space-y-6">

      {/* Charts */}
      {active.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('chart_by_category')}</h2>
            <CostByCategoryChart subscriptions={subscriptions} />
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('chart_monthly_trend')}</h2>
            <MonthlyTrendChart subscriptions={subscriptions} />
          </div>
        </div>
      )}

      {/* Expiring + Unused */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            {t('section_expiring_soon')}
          </h2>
          {expiringSoon.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('no_expiring')}</p>
          ) : (
            <div className="space-y-3">
              {expiringSoon.slice(0, 5).map((s) => {
                const d = getDisplayRenewal(s.renewal_date, s.start_date, s.billing_cycle)!
                const days = differenceInDays(d, today)
                return (
                  <div key={s.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatRenewal(d)}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      days <= 7
                        ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {days === 0 ? t('today') : `${days}d`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            {t('section_unused')}
          </h2>
          {unused.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('no_unused')}</p>
          ) : (
            <div className="space-y-3">
              {unused.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {s.currency} {s.price}/{
                        s.billing_cycle === 'monthly' ? t('cycle_short_monthly') :
                        s.billing_cycle === 'yearly'  ? t('cycle_short_yearly') :
                        s.billing_cycle === 'weekly'  ? t('billing_weekly') :
                        t('billing_once')
                      }
                    </p>
                  </div>
                  <Link href={`/subscriptions/${s.id}/edit`} className="text-xs text-indigo-500 hover:underline">{t('edit')}</Link>
                </div>
              ))}
            </div>
          )}
          {unused.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('potential_savings')}{' '}
                <span className="font-semibold text-red-600 dark:text-red-400">
                  €{unused.reduce((s, sub) => s + getMonthlyEquivalent(sub.price, sub.billing_cycle), 0).toFixed(2)}/{t('cycle_short_monthly')}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* All services table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('section_all_services')}</h2>
          <Link href="/subscriptions" className="text-sm text-indigo-500 hover:underline">{t('see_all')}</Link>
        </div>
        {subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-3">{t('no_services_yet')}</p>
            <Link href="/subscriptions/new" className="inline-flex px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
              {t('add_first_service')}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">{t('col_name')}</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">{t('col_price')}</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">{t('col_short_renewal')}</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">{t('col_status')}</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">{t('col_usage')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {subscriptions.slice(0, 8).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-2.5 px-3">
                      <Link href={`/subscriptions/${s.id}`} className="font-medium text-gray-900 dark:text-white hover:text-indigo-500">
                        {s.name}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300">
                      {s.currency} {s.price}/{s.billing_cycle === 'monthly' ? t('cycle_short_monthly') : s.billing_cycle === 'yearly' ? t('cycle_short_yearly') : s.billing_cycle}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300">
                      {formatRenewal(getDisplayRenewal(s.renewal_date, s.start_date, s.billing_cycle))}
                    </td>
                    <td className="py-2.5 px-3"><StatusBadge status={s.status} /></td>
                    <td className="py-2.5 px-3"><UsageBadge usage={s.usage_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cost summary */}
      {subscriptions.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4">
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300">{t('yearly_cost')}</p>
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">€{yearlyTotal.toFixed(2)}</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-500 mt-1">{active.length} {t('active_services_count')}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/50 border border-green-100 dark:border-green-900 rounded-xl p-4">
            <p className="text-sm font-medium text-green-900 dark:text-green-300">{t('monthly_cost_total')}</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">€{monthlyTotal.toFixed(2)}</p>
            <p className="text-xs text-green-500 dark:text-green-500 mt-1">~€{(monthlyTotal / (active.length || 1)).toFixed(2)} / {t('active_services_count')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
