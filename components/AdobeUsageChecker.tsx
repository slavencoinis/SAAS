'use client'

import { useState } from 'react'
import { runAdobeUsageCheck, AdobeCheckResult } from '@/app/actions/adobeCheck'
import { AdobeAppUsage, UNDERUTILIZED_THRESHOLD_DAYS } from '@/lib/adobe/checkAdobeUsage'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle, RefreshCw, Layers } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

function UsageResultRow({ usage }: { usage: AdobeAppUsage }) {
  const { t } = useLanguage()
  const formattedDate = format(new Date(usage.lastOpened), 'dd.MM.yyyy HH:mm')
  const over = usage.isUnderutilized

  return (
    <div className={`flex items-start justify-between gap-4 rounded-xl border p-4 ${
      over
        ? 'border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/30'
        : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30'
    }`}>
      <div className="flex items-start gap-3">
        {over
          ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
          : <CheckCircle   className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
        }
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{usage.subscriptionName}</p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
            {t('adobe_last_opened')}{' '}
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>{formattedDate}</span>
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {t('adobe_inactive')}{' '}
            <span className={`font-medium ${over ? 'text-orange-700 dark:text-orange-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {usage.daysSinceLastUse} {usage.daysSinceLastUse === 1 ? t('adobe_days_singular') : t('adobe_days_plural')}
            </span>{' '}
            <span style={{ color: 'var(--muted)' }}>({t('adobe_threshold')} {UNDERUTILIZED_THRESHOLD_DAYS} {t('adobe_days_unit')})</span>
          </p>
        </div>
      </div>

      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        over
          ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300'
          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
      }`}>
        {over ? t('usage_underutilized') : t('adobe_in_use')}
      </span>
    </div>
  )
}

export default function AdobeUsageChecker() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AdobeCheckResult | null>(null)
  const { t } = useLanguage()

  async function handleCheck() {
    setLoading(true)
    setResult(null)
    try {
      const data = await runAdobeUsageCheck()
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'var(--card)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600">
            <Layers className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>Adobe Creative Cloud</h2>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('adobe_subtitle')}</p>
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t('adobe_checking') : t('adobe_check_btn')}
        </button>
      </div>

      {/* Description */}
      {!result && !loading && (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {t('adobe_desc_part1')}{' '}
          {t('adobe_desc_not_used')}{' '}
          <span className="font-medium" style={{ color: 'var(--foreground)' }}>{UNDERUTILIZED_THRESHOLD_DAYS}+ {t('adobe_days_unit')}</span>
          {t('adobe_desc_mark_as')}{' '}
          <span className="rounded bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 text-xs font-semibold text-orange-800 dark:text-orange-300">
            Underutilized
          </span>.
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl" style={{ background: 'var(--card-border)' }} />
          ))}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-3">
          {result.error && (
            <p className="rounded-xl bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
              {result.error}
            </p>
          )}

          {result.noSubscriptionsFound && (
            <div className="rounded-xl px-4 py-6 text-center" style={{ border: '1px solid var(--card-border)', background: 'var(--input-bg)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{t('adobe_no_services')}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                {t('adobe_no_hint')}
              </p>
            </div>
          )}

          {result.checked.map((usage) => (
            <UsageResultRow key={usage.subscriptionId} usage={usage} />
          ))}

          {result.checked.length > 0 && (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
              result.markedUnderutilized > 0
                ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
            }`}>
              {result.markedUnderutilized > 0 ? (
                <>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    <span className="font-semibold">{result.markedUnderutilized}</span>{' '}
                    {result.markedUnderutilized === 1 ? t('adobe_marked_one') : t('adobe_marked_many')}{' '}
                    {t('adobe_updated_db')}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{t('adobe_all_ok')}</span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
