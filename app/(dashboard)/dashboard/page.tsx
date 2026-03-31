'use client'

import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useBudget } from '@/hooks/useBudget'
import { useLanguage } from '@/components/LanguageProvider'
import { BILLING_STATUSES, getMonthlyEquivalent } from '@/lib/renewalUtils'
import BudgetBanner from '@/components/BudgetBanner'
import AdobeUsageChecker from '@/components/AdobeUsageChecker'
import DashboardStats from '@/components/dashboard/DashboardStats'
import DashboardContent from '@/components/dashboard/DashboardContent'
import SavingsBanner from '@/components/dashboard/SavingsBanner'

const skeletonCard = {
  background: 'var(--card)',
  border: '1px solid var(--card-border)',
  boxShadow: 'var(--shadow-sm)',
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-5 animate-pulse" style={skeletonCard}>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl" style={{ background: 'var(--card-border)' }} />
            <div className="space-y-2">
              <div className="h-2.5 w-24 rounded" style={{ background: 'var(--card-border)' }} />
              <div className="h-6 w-14 rounded" style={{ background: 'var(--card-border)' }} />
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
          <div key={i} className="rounded-2xl p-6 animate-pulse space-y-4" style={skeletonCard}>
            <div className="h-3.5 w-40 rounded" style={{ background: 'var(--card-border)' }} />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex justify-between">
                <div className="space-y-1.5">
                  <div className="h-3 w-28 rounded" style={{ background: 'var(--card-border)' }} />
                  <div className="h-3 w-20 rounded" style={{ background: 'var(--card-border)' }} />
                </div>
                <div className="h-6 w-12 rounded-full" style={{ background: 'var(--card-border)' }} />
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{t('dashboard_title')}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{t('dashboard_subtitle')}</p>
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
