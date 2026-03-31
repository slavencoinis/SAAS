'use client'

import { CreditCard, AlertTriangle, XCircle } from 'lucide-react'
import { Subscription } from '@/types/subscription'
import { useLanguage } from '@/components/LanguageProvider'
import { SpendIcon } from '@/components/OptiStackLogo'
import BudgetIndicator from '@/components/BudgetIndicator'
import { differenceInDays } from 'date-fns'
import { getDisplayRenewal, BILLING_STATUSES } from '@/lib/renewalUtils'

function getMonthlyEquivalent(price: number, cycle: string): number {
  if (cycle === 'yearly')   return price / 12
  if (cycle === 'weekly')   return price * 4.33
  if (cycle === 'one-time') return 0
  return price
}

export default function DashboardStats({
  subscriptions,
  budget,
}: {
  subscriptions: Subscription[]
  budget: number | null
}) {
  const { t } = useLanguage()
  const today = new Date()

  const active = subscriptions.filter((s) => (BILLING_STATUSES as readonly string[]).includes(s.status))
  const monthlyTotal = active.reduce((sum, s) => sum + getMonthlyEquivalent(s.price, s.billing_cycle), 0)
  const unused = subscriptions.filter((s) => s.usage_status === 'unused' && s.status === 'active')
  const expiringSoon = subscriptions.filter((s) => {
    if (!(BILLING_STATUSES as readonly string[]).includes(s.status)) return false
    const d = getDisplayRenewal(s.renewal_date, s.start_date, s.billing_cycle)
    if (!d) return false
    const days = differenceInDays(d, today)
    return days >= 0 && days <= 7
  })

  const stats = [
    { label: t('stat_active_services'), value: active.length,                icon: CreditCard,    color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950' },
    { label: t('stat_monthly_cost'),    value: `€${monthlyTotal.toFixed(2)}`, icon: SpendIcon,     color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950',   extra: <BudgetIndicator monthlyTotal={monthlyTotal} budget={budget} /> },
    { label: t('stat_expiring_soon'),   value: expiringSoon.length,           icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950' },
    { label: t('stat_unused'),          value: unused.length,                 icon: XCircle,       color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-950' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg, extra }) => (
        <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3">
            <div className={`${bg} p-2.5 rounded-lg`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              {extra}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
