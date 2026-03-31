'use client'

import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useBudget } from '@/hooks/useBudget'
import { useLanguage } from '@/components/LanguageProvider'
import { BILLING_STATUSES } from '@/lib/renewalUtils'
import BudgetBanner from '@/components/BudgetBanner'
import AdobeUsageChecker from '@/components/AdobeUsageChecker'
import DashboardStats from '@/components/dashboard/DashboardStats'
import DashboardContent from '@/components/dashboard/DashboardContent'
import SavingsBanner from '@/components/dashboard/SavingsBanner'

function getMonthlyEquivalent(price: number, cycle: string): number {
  if (cycle === 'yearly')   return price / 12
  if (cycle === 'weekly')   return price * 4.33
  if (cycle === 'one-time') return 0
  return price
}

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
    </div>
  )
}

export default function DashboardPage() {
  const { data: subscriptions, isLoading } = useSubscriptions()
  const { data: budgetSettings } = useBudget()
  const { t } = useLanguage()

  const budget = budgetSettings?.monthly_budget ?? null
  const active = subscriptions?.filter((s) => (BILLING_STATUSES as readonly string[]).includes(s.status)) ?? []
  const monthlyTotal = active.reduce((sum, s) => sum + getMonthlyEquivalent(s.price, s.billing_cycle), 0)

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
          <DashboardStats subscriptions={subscriptions} budget={budget} />
          {budget != null && <BudgetBanner monthlyTotal={monthlyTotal} budget={budget} />}
          <SavingsBanner subscriptions={subscriptions} />
          <DashboardContent subscriptions={subscriptions} />
          <AdobeUsageChecker />
        </>
      )}
    </div>
  )
}
