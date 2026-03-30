'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/hooks/useSubscriptions'
import { useLanguage } from '@/components/LanguageProvider'
import { StatusBadge, UsageBadge } from '@/components/StatusBadge'
import DeleteButton from '../DeleteButton'
import { getDisplayRenewal, formatRenewal } from '@/lib/renewalUtils'
import {
  ArrowLeft, Pencil, ExternalLink, Calendar, RefreshCw,
  Tag, BarChart2, FileText, Key, DollarSign,
} from 'lucide-react'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ViewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-gray-100 dark:bg-gray-800" />
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
        <div className="flex gap-3">
          <div className="h-6 w-20 rounded-full bg-gray-100 dark:bg-gray-800" />
          <div className="h-6 w-16 rounded-full bg-gray-100 dark:bg-gray-800" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-5 w-28 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </p>
      <div className="text-sm font-medium text-gray-900 dark:text-white">{value}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ViewSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: subscription, isLoading } = useSubscription(id)
  const { t, lang } = useLanguage()
  const router = useRouter()

  const categoryLabels: Record<string, string> = {
    productivity:  t('cat_productivity'),
    development:   t('cat_development'),
    design:        t('cat_design'),
    marketing:     t('cat_marketing'),
    communication: t('cat_communication'),
    storage:       t('cat_storage'),
    other:         t('cat_other'),
  }

  const billingLabels: Record<string, string> = {
    monthly:  t('billing_monthly'),
    yearly:   t('billing_yearly'),
    weekly:   t('billing_weekly'),
    'one-time': t('billing_once'),
  }

  return (
    <div className="space-y-5 max-w-2xl w-full">

      {/* ── Back + title ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link
          href="/subscriptions"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          {isLoading
            ? <div className="h-7 w-36 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            : <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                {subscription?.name ?? t('service_not_found')}
              </h1>
          }
        </div>
      </div>

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {isLoading && <ViewSkeleton />}

      {/* ── Not found ────────────────────────────────────────────────────── */}
      {!isLoading && !subscription && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-400 dark:text-gray-500 mb-4">{t('service_not_found')}</p>
          <Link href="/subscriptions" className="text-sm text-indigo-500 hover:underline">
            {t('back_to_list')}
          </Link>
        </div>
      )}

      {/* ── View card ────────────────────────────────────────────────────── */}
      {!isLoading && subscription && (() => {
        const renewalDate = getDisplayRenewal(subscription.renewal_date, subscription.start_date, subscription.billing_cycle)

        return (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">

            {/* Status row */}
            <div className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={subscription.status} />
                <UsageBadge usage={subscription.usage_status} />
                {subscription.api_key_linked && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                    <Key className="w-3 h-3" /> API
                  </span>
                )}
              </div>
              {subscription.url && (
                <a
                  href={subscription.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-indigo-500 hover:underline shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {subscription.url.replace(/^https?:\/\//, '').split('/')[0]}
                </a>
              )}
            </div>

            {/* Main fields grid */}
            <div className="px-4 sm:px-6 py-5 grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-5">
              <Field
                icon={DollarSign}
                label={t('form_price')}
                value={`${subscription.currency} ${subscription.price} / ${billingLabels[subscription.billing_cycle] ?? subscription.billing_cycle}`}
              />
              <Field
                icon={Tag}
                label={t('form_category')}
                value={categoryLabels[subscription.category ?? 'other'] ?? '-'}
              />
              <Field
                icon={RefreshCw}
                label={t('form_billing_cycle')}
                value={billingLabels[subscription.billing_cycle] ?? subscription.billing_cycle}
              />
              <Field
                icon={Calendar}
                label={t('form_start_date')}
                value={subscription.start_date
                  ? new Date(subscription.start_date).toLocaleDateString(lang === 'en' ? 'en-GB' : 'hr-HR')
                  : <span className="text-gray-400">—</span>}
              />
              <Field
                icon={RefreshCw}
                label={t('form_renewal_date')}
                value={renewalDate
                  ? formatRenewal(renewalDate)
                  : <span className="text-gray-400">—</span>}
              />
              <Field
                icon={BarChart2}
                label={t('form_usage_status')}
                value={<UsageBadge usage={subscription.usage_status} />}
              />
            </div>

            {/* Description */}
            {subscription.description && (
              <div className="px-6 py-4">
                <p className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  {t('form_description')}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{subscription.description}</p>
              </div>
            )}

            {/* Notes */}
            {subscription.notes && (
              <div className="px-6 py-4">
                <p className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  {t('form_notes')}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{subscription.notes}</p>
              </div>
            )}

            {/* Action bar */}
            <div className="px-6 py-4 flex items-center gap-3">
              <Link
                href={`/subscriptions/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                {t('edit')}
              </Link>
              <DeleteButton id={id} name={subscription.name} />
            </div>
          </div>
        )
      })()}
    </div>
  )
}
