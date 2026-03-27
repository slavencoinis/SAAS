'use client'

import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useLanguage } from '@/components/LanguageProvider'
import { Subscription } from '@/types/subscription'
import { differenceInDays } from 'date-fns'
import { getDisplayRenewal, formatRenewal, BILLING_STATUSES, paidThisYear } from '@/lib/renewalUtils'
import { CreditCard, TrendingUp, AlertTriangle, XCircle, PiggyBank } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge, UsageBadge } from '@/components/StatusBadge'
import AdobeUsageChecker from '@/components/AdobeUsageChecker'
import CostByCategoryChart from '@/components/charts/CostByCategoryChart'
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart'

function getMonthlyEquivalent(price: number, cycle: string): number {
  if (cycle === 'yearly') return price / 12
  if (cycle === 'weekly') return price * 4.33
  if (cycle === 'one-time') return 0
  return price
}

function getYearlyEquivalent(price: number, cycle: string): number {
  if (cycle === 'yearly')   return price
  if (cycle === 'weekly')   return price * 52
  if (cycle === 'one-time') return 0
  return price * 12
}

// ─── Savings banner ───────────────────────────────────────────────────────────

function SavingsBanner({ subscriptions }: { subscriptions: Subscription[] }) {
  const { t } = useLanguage()

  const stopped = subscriptions.filter(
    (s) => s.status === 'cancelled' || s.status === 'paused' || s.status === 'inactive'
  )
  if (stopped.length === 0) return null

  const rows = stopped
    .map((s) => ({
      name:    s.name,
      saved:   Math.max(0, getYearlyEquivalent(s.price, s.billing_cycle) - paidThisYear(s.price, s.billing_cycle, s.start_date)),
      status:  s.status,
    }))
    .filter((r) => r.saved > 0)

  const totalSaved = rows.reduce((sum, r) => sum + r.saved, 0)
  if (totalSaved < 0.01) return null

  return (
    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-6">
        {/* Left */}
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

            {/* Per-service breakdown */}
            <div className="mt-2.5 flex flex-col gap-1">
              {rows.map((r) => (
                <div key={r.name} className="flex items-center gap-2">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                    r.status === 'cancelled' ? 'bg-red-400' : 'bg-amber-400'
                  }`} />
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 truncate">
                    {r.name}
                  </span>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 shrink-0">
                    €{r.saved.toFixed(2)} {t('savings_saving')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — big number */}
        <div className="text-right shrink-0">
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
            €{totalSaved.toFixed(2)}
          </p>
          <p className="text-xs text-emerald-500 dark:text-emerald-600 mt-1">
            {t('savings_vs_year')}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-6 w-12 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse space-y-4">
            <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex justify-between">
                <div className="space-y-1">
                  <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
                <div className="h-6 w-12 rounded-full bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse space-y-3">
        <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-16 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard content ────────────────────────────────────────────────────────

function DashboardStats({ subscriptions }: { subscriptions: Subscription[] }) {
  const { t } = useLanguage()
  const active = subscriptions.filter((s) => (BILLING_STATUSES as readonly string[]).includes(s.status))
  const monthlyTotal = active.reduce((sum, s) => sum + getMonthlyEquivalent(s.price, s.billing_cycle), 0)
  const unused = subscriptions.filter((s) => s.usage_status === 'unused' && s.status === 'active')
  const today = new Date()
  const expiringSoon = subscriptions.filter((s) => {
    if (!(BILLING_STATUSES as readonly string[]).includes(s.status)) return false
    const d = getDisplayRenewal(s.renewal_date, s.start_date, s.billing_cycle)
    if (!d) return false
    const days = differenceInDays(d, today)
    return days >= 0 && days <= 7
  })

  const stats = [
    { label: t('stat_active_services'),  value: active.length,                icon: CreditCard,    color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950' },
    { label: t('stat_monthly_cost'),     value: `€${monthlyTotal.toFixed(2)}`, icon: TrendingUp,    color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950'   },
    { label: t('stat_expiring_soon'),    value: expiringSoon.length,           icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950' },
    { label: t('stat_unused'),           value: unused.length,                 icon: XCircle,       color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-950'       },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3">
            <div className={`${bg} p-2.5 rounded-lg`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DashboardContent({ subscriptions }: { subscriptions: Subscription[] }) {
  const { t } = useLanguage()
  const active = subscriptions.filter((s) => (BILLING_STATUSES as readonly string[]).includes(s.status))
  const monthlyTotal = active.reduce((sum, s) => sum + getMonthlyEquivalent(s.price, s.billing_cycle), 0)
  const yearlyTotal = monthlyTotal * 12
  const unused = subscriptions.filter((s) => s.usage_status === 'unused' && s.status === 'active')
  const today = new Date()
  const expiringSoon = subscriptions.filter((s) => {
    if (!(BILLING_STATUSES as readonly string[]).includes(s.status)) return false
    const d = getDisplayRenewal(s.renewal_date, s.start_date, s.billing_cycle)
    if (!d) return false
    const days = differenceInDays(d, today)
    return days >= 0 && days <= 7
  })

  return (
    <div className="space-y-6">

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring soon */}
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRenewal(d)}
                      </p>
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

        {/* Unused */}
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

      {/* All services */}
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

      {subscriptions.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            {/* Yearly cost — active only */}
            <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4">
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300">{t('yearly_cost')}</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">€{yearlyTotal.toFixed(2)}</p>
              <p className="text-xs text-indigo-500 dark:text-indigo-500 mt-1">{active.length} {t('active_services_count')}</p>
            </div>
            {/* Monthly cost — active only */}
            <div className="bg-green-50 dark:bg-green-950/50 border border-green-100 dark:border-green-900 rounded-xl p-4">
              <p className="text-sm font-medium text-green-900 dark:text-green-300">{t('monthly_cost_total')}</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">€{monthlyTotal.toFixed(2)}</p>
              <p className="text-xs text-green-500 dark:text-green-500 mt-1">~€{(monthlyTotal / (active.length || 1)).toFixed(2)} / {t('active_services_count')}</p>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: subscriptions, isLoading } = useSubscriptions()
  const { t } = useLanguage()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard_title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('dashboard_subtitle')}</p>
      </div>

      {isLoading || !subscriptions ? (
        <>
          <StatsSkeleton />
          <ContentSkeleton />
        </>
      ) : (
        <>
          <DashboardStats subscriptions={subscriptions} />
          <SavingsBanner subscriptions={subscriptions} />
          <DashboardContent subscriptions={subscriptions} />
          <AdobeUsageChecker />
        </>
      )}
    </div>
  )
}
