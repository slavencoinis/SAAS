'use client'

import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useLanguage } from '@/components/LanguageProvider'
import { Subscription } from '@/types/subscription'
import { differenceInDays } from 'date-fns'
import { getDisplayRenewal, formatRenewal } from '@/lib/renewalUtils'
import Link from 'next/link'
import { PlusCircle, ExternalLink } from 'lucide-react'
import { StatusBadge, UsageBadge } from '@/components/StatusBadge'
import DeleteButton from './DeleteButton'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
      <div className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-8 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-2.5 w-20 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="h-3.5 w-20 rounded bg-gray-100 dark:bg-gray-800 self-center" />
          <div className="h-3.5 w-16 rounded bg-gray-100 dark:bg-gray-800 self-center" />
          <div className="h-3.5 w-24 rounded bg-gray-100 dark:bg-gray-800 self-center" />
          <div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-800 self-center" />
          <div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-800 self-center" />
        </div>
      ))}
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

function SubscriptionsTable({ subscriptions }: { subscriptions: Subscription[] }) {
  const { t } = useLanguage()
  const today = new Date()

  const categoryKeys: Record<string, 'cat_productivity' | 'cat_development' | 'cat_design' | 'cat_marketing' | 'cat_communication' | 'cat_storage' | 'cat_other'> = {
    productivity: 'cat_productivity',
    development:  'cat_development',
    design:       'cat_design',
    marketing:    'cat_marketing',
    communication:'cat_communication',
    storage:      'cat_storage',
    other:        'cat_other',
  }

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
        <p className="text-gray-400 dark:text-gray-500 mb-4">{t('no_services_empty')}</p>
        <Link
          href="/subscriptions/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          <PlusCircle className="w-4 h-4" />
          {t('add_first_btn')}
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">{t('col_name')}</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">{t('col_category')}</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">{t('col_price')}</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">{t('col_renewal')}</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">{t('col_status')}</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">{t('col_usage')}</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {subscriptions.map((s) => {
              const renewalDate = getDisplayRenewal(s.renewal_date, s.start_date, s.billing_cycle)
              const daysUntilRenewal = renewalDate ? differenceInDays(renewalDate, today) : null
              const isExpiringSoon =
                daysUntilRenewal !== null && daysUntilRenewal >= 0 && daysUntilRenewal <= 7

              return (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <Link
                          href={`/subscriptions/${s.id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400"
                        >
                          {s.name}
                        </Link>
                        {s.description && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[180px]">{s.description}</p>
                        )}
                      </div>
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 dark:text-gray-600 hover:text-indigo-500">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                    {s.category && categoryKeys[s.category] ? t(categoryKeys[s.category]) : '-'}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-200 font-medium">
                    {s.currency} {s.price}
                    <span className="text-gray-400 dark:text-gray-500 font-normal text-xs ml-1">
                      /{s.billing_cycle === 'monthly' ? t('cycle_short_monthly') : s.billing_cycle === 'yearly' ? t('cycle_short_yearly') : s.billing_cycle}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {renewalDate ? (
                      <div>
                        <span className={isExpiringSoon ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-200'}>
                          {formatRenewal(renewalDate)}
                        </span>
                        {daysUntilRenewal !== null && daysUntilRenewal >= 0 && daysUntilRenewal <= 30 && (
                          <span className={`ml-2 text-xs ${daysUntilRenewal <= 7 ? 'text-red-500' : 'text-yellow-500'}`}>
                            ({daysUntilRenewal === 0 ? t('today') : `${daysUntilRenewal}d`})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                  <td className="py-3 px-4"><UsageBadge usage={s.usage_status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/subscriptions/${s.id}`} className="text-xs text-indigo-500 hover:underline">
                        {t('edit')}
                      </Link>
                      <DeleteButton id={s.id} name={s.name} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const { data: subscriptions, isLoading } = useSubscriptions()
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('services_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {isLoading || !subscriptions ? t('services_loading') : `${subscriptions.length} ${t('services_total')}`}
          </p>
        </div>
        <Link
          href="/subscriptions/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          {t('add_service_btn')}
        </Link>
      </div>

      {isLoading || !subscriptions
        ? <TableSkeleton />
        : <SubscriptionsTable subscriptions={subscriptions} />
      }
    </div>
  )
}
