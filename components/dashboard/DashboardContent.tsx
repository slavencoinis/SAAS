'use client'

import Link from 'next/link'
import { AlertTriangle, XCircle } from 'lucide-react'
import { differenceInDays } from 'date-fns'
import { Subscription } from '@/types/subscription'
import { useLanguage } from '@/components/LanguageProvider'
import { getDisplayRenewal, formatRenewal, BILLING_STATUSES, getMonthlyEquivalent } from '@/lib/renewalUtils'
import { StatusBadge, UsageBadge } from '@/components/StatusBadge'
import CostByCategoryChart from '@/components/charts/CostByCategoryChart'
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart'

const card = {
  background: 'var(--card)',
  border: '1px solid var(--card-border)',
  boxShadow: 'var(--shadow-sm)',
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
          <div className="rounded-2xl p-6" style={card}>
            <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--foreground)' }}>{t('chart_by_category')}</h2>
            <CostByCategoryChart subscriptions={subscriptions} />
          </div>
          <div className="rounded-2xl p-6" style={card}>
            <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--foreground)' }}>{t('chart_monthly_trend')}</h2>
            <MonthlyTrendChart subscriptions={subscriptions} />
          </div>
        </div>
      )}

      {/* Expiring + Unused */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6" style={card}>
          <h2 className="text-[13px] font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            {t('section_expiring_soon')}
          </h2>
          {expiringSoon.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{t('no_expiring')}</p>
          ) : (
            <div className="space-y-3">
              {expiringSoon.slice(0, 5).map((s) => {
                const d = getDisplayRenewal(s.renewal_date, s.start_date, s.billing_cycle)!
                const days = differenceInDays(d, today)
                return (
                  <div key={s.id} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{s.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{formatRenewal(d)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      days <= 7
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}>
                      {days === 0 ? t('today') : `${days}d`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-6" style={card}>
          <h2 className="text-[13px] font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <XCircle className="w-4 h-4 text-rose-500" />
            {t('section_unused')}
          </h2>
          {unused.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{t('no_unused')}</p>
          ) : (
            <div className="space-y-3">
              {unused.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{s.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                      {s.currency} {s.price}/{
                        s.billing_cycle === 'monthly' ? t('cycle_short_monthly') :
                        s.billing_cycle === 'yearly'  ? t('cycle_short_yearly') :
                        s.billing_cycle === 'weekly'  ? t('billing_weekly') :
                        t('billing_once')
                      }
                    </p>
                  </div>
                  <Link href={`/subscriptions/${s.id}/edit`} className="text-xs font-medium text-indigo-500 hover:text-indigo-600 hover:underline">{t('edit')}</Link>
                </div>
              ))}
            </div>
          )}
          {unused.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {t('potential_savings')}{' '}
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  €{unused.reduce((s, sub) => s + getMonthlyEquivalent(sub.price, sub.billing_cycle), 0).toFixed(2)}/{t('cycle_short_monthly')}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* All services table */}
      <div className="rounded-2xl p-6" style={card}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>{t('section_all_services')}</h2>
          <Link href="/subscriptions" className="text-xs font-medium text-indigo-500 hover:underline">{t('see_all')}</Link>
        </div>
        {subscriptions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>{t('no_services_yet')}</p>
            <Link href="/subscriptions/new" className="inline-flex px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700">
              {t('add_first_service')}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{t('col_name')}</th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{t('col_price')}</th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{t('col_short_renewal')}</th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{t('col_status')}</th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{t('col_usage')}</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.slice(0, 8).map((s) => (
                  <tr key={s.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors" style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td className="py-3 px-3">
                      <Link href={`/subscriptions/${s.id}`} className="font-medium hover:text-indigo-500 transition-colors" style={{ color: 'var(--foreground)' }}>
                        {s.name}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-sm" style={{ color: 'var(--muted)' }}>
                      {s.currency} {s.price}/{s.billing_cycle === 'monthly' ? t('cycle_short_monthly') : s.billing_cycle === 'yearly' ? t('cycle_short_yearly') : s.billing_cycle}
                    </td>
                    <td className="py-3 px-3 text-sm" style={{ color: 'var(--muted)' }}>
                      {formatRenewal(getDisplayRenewal(s.renewal_date, s.start_date, s.billing_cycle))}
                    </td>
                    <td className="py-3 px-3"><StatusBadge status={s.status} /></td>
                    <td className="py-3 px-3"><UsageBadge usage={s.usage_status} /></td>
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
          <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">{t('yearly_cost')}</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1.5">€{yearlyTotal.toFixed(2)}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{active.length} {t('active_services_count')}</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">{t('monthly_cost_total')}</p>
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-1.5">€{monthlyTotal.toFixed(2)}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>~€{(monthlyTotal / (active.length || 1)).toFixed(2)} / {t('active_services_count')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
