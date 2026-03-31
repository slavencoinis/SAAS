'use client'

import { use } from 'react'
import Link from 'next/link'
import { useSubscription } from '@/hooks/useSubscriptions'
import { useLanguage } from '@/components/LanguageProvider'
import { StatusBadge, UsageBadge } from '@/components/StatusBadge'
import DeleteButton from '../DeleteButton'
import { getDisplayRenewal, formatRenewal } from '@/lib/renewalUtils'
import {
  ArrowLeft, Pencil, ExternalLink, Calendar, RefreshCw,
  Tag, BarChart2, FileText, Key, DollarSign,
} from 'lucide-react'

const card = {
  background: 'var(--card)',
  border: '1px solid var(--card-border)',
  boxShadow: 'var(--shadow-sm)',
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ViewSkeleton() {
  const bone = { background: 'var(--card-border)' }
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-xl" style={bone} />
      <div className="rounded-2xl p-6 space-y-5" style={card}>
        <div className="flex gap-3">
          <div className="h-6 w-20 rounded-full" style={bone} />
          <div className="h-6 w-16 rounded-full" style={bone} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 rounded" style={bone} />
              <div className="h-5 w-28 rounded" style={bone} />
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
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted)' }}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </p>
      <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{value}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ViewSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: subscription, isLoading } = useSubscription(id)
  const { t, lang } = useLanguage()

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
    monthly:    t('billing_monthly'),
    yearly:     t('billing_yearly'),
    weekly:     t('billing_weekly'),
    'one-time': t('billing_once'),
  }

  return (
    <div className="space-y-5 max-w-2xl w-full">

      {/* ── Back + title ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link
          href="/subscriptions"
          className="p-1.5 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: 'var(--muted)' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          {isLoading
            ? <div className="h-7 w-36 rounded-xl animate-pulse" style={{ background: 'var(--card-border)' }} />
            : <h1 className="text-2xl font-bold truncate" style={{ color: 'var(--foreground)' }}>
                {subscription?.name ?? t('service_not_found')}
              </h1>
          }
        </div>
      </div>

      {isLoading && <ViewSkeleton />}

      {!isLoading && !subscription && (
        <div className="rounded-2xl p-12 text-center" style={card}>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>{t('service_not_found')}</p>
          <Link href="/subscriptions" className="text-sm text-indigo-500 hover:underline">
            {t('back_to_list')}
          </Link>
        </div>
      )}

      {!isLoading && subscription && (() => {
        const renewalDate = getDisplayRenewal(subscription.renewal_date, subscription.start_date, subscription.billing_cycle)

        return (
          <div className="rounded-2xl overflow-hidden" style={card}>

            {/* Status row */}
            <div className="px-6 py-4 flex items-center justify-between gap-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={subscription.status} />
                <UsageBadge usage={subscription.usage_status} />
                {subscription.api_key_linked && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400">
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
            <div className="px-4 sm:px-6 py-5 grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-5" style={{ borderBottom: '1px solid var(--card-border)' }}>
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
                  : <span style={{ color: 'var(--muted)' }}>—</span>}
              />
              <Field
                icon={RefreshCw}
                label={t('form_renewal_date')}
                value={renewalDate
                  ? formatRenewal(renewalDate)
                  : <span style={{ color: 'var(--muted)' }}>—</span>}
              />
              <Field
                icon={BarChart2}
                label={t('form_usage_status')}
                value={<UsageBadge usage={subscription.usage_status} />}
              />
            </div>

            {/* Description */}
            {subscription.description && (
              <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted)' }}>
                  <FileText className="w-3.5 h-3.5" />
                  {t('form_description')}
                </p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{subscription.description}</p>
              </div>
            )}

            {/* Notes */}
            {subscription.notes && (
              <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted)' }}>
                  <FileText className="w-3.5 h-3.5" />
                  {t('form_notes')}
                </p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>{subscription.notes}</p>
              </div>
            )}

            {/* Action bar */}
            <div className="px-6 py-4 flex items-center gap-3">
              <Link
                href={`/subscriptions/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
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
