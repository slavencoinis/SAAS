'use client'

import { useState } from 'react'
import { runOpenAIUsageCheck, OpenAICheckResult } from '@/app/actions/openaiCheck'
import { OpenAIUsageData, OVERLIMIT_THRESHOLD_PERCENT } from '@/lib/integrations/openai/checkUsage'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle, RefreshCw, Zap } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

function UsageBar({ percent }: { percent: number }) {
  const capped = Math.min(percent, 100)
  const color =
    capped >= OVERLIMIT_THRESHOLD_PERCENT ? 'bg-red-500' :
    capped >= 60                          ? 'bg-amber-400' :
                                            'bg-emerald-500'
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--card-border)' }}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${capped}%` }}
      />
    </div>
  )
}

function UsageResultRow({ usage }: { usage: OpenAIUsageData }) {
  const { t } = useLanguage()
  const over = usage.isOverLimit

  return (
    <div className={`rounded-xl border p-4 ${
      over
        ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30'
        : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {over
            ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            : <CheckCircle   className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
              {usage.subscriptionName}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ color: 'var(--muted)' }}>
              <span>
                {t('openai_usage_label')}{' '}
                <span className={`font-medium ${over ? 'text-red-700 dark:text-red-400' : ''}`} style={!over ? { color: 'var(--foreground)' } : {}}>
                  {usage.currentTokens.toLocaleString()} / {usage.limitTokens.toLocaleString()} {t('openai_tokens_label')}
                </span>
              </span>
              <span>
                {t('openai_period_label')}{' '}
                <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                  {usage.periodStart} → {usage.periodEnd}
                </span>
              </span>
              <span>
                {t('openai_cost_label')}{' '}
                <span className="font-medium" style={{ color: 'var(--foreground)' }}>${usage.estimatedCostUSD}</span>
              </span>
            </div>
            <UsageBar percent={usage.usagePercent} />
            <p className={`mt-1 text-xs font-medium ${over ? 'text-red-600 dark:text-red-400' : ''}`} style={!over ? { color: 'var(--muted)' } : {}}>
              {usage.usagePercent}{t('openai_percent_used')}
              {over && ` — ${t('openai_exceeds_prefix')} ${OVERLIMIT_THRESHOLD_PERCENT}${t('openai_exceeds_suffix')}`}
            </p>
          </div>
        </div>

        <span className={`shrink-0 self-start rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
          over
            ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
            : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
        }`}>
          {over ? t('status_overlimit') : t('openai_ok_status')}
        </span>
      </div>
    </div>
  )
}

export default function OpenAIUsageChecker() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OpenAICheckResult | null>(null)
  const { t } = useLanguage()

  async function handleCheck() {
    setLoading(true)
    setResult(null)
    try {
      const data = await runOpenAIUsageCheck()
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
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black dark:bg-white">
            <Zap className="h-5 w-5 text-white dark:text-black" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>OpenAI Usage API</h2>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {t('openai_subtitle_prefix')} {OVERLIMIT_THRESHOLD_PERCENT}{t('openai_subtitle_suffix')} Overlimit - Review Needed
            </p>
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={loading}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-black dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-black transition-colors hover:bg-gray-800 dark:hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t('openai_checking') : t('openai_check_btn')}
        </button>
      </div>

      {/* Description */}
      {!result && !loading && (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {t('openai_desc_prefix')}{' '}
          <span className="font-medium" style={{ color: 'var(--foreground)' }}>{OVERLIMIT_THRESHOLD_PERCENT}%</span>{' '}
          {t('openai_desc_suffix')}{' '}
          <span className="rounded bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 text-xs font-semibold text-red-800 dark:text-red-300">
            Overlimit - Review Needed
          </span>.
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl" style={{ background: 'var(--card-border)' }} />
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
            <div className="rounded-xl px-4 py-8 text-center" style={{ border: '1px solid var(--card-border)', background: 'var(--input-bg)' }}>
              <Zap className="mx-auto mb-2 h-8 w-8" style={{ color: 'var(--card-border)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{t('openai_no_services')}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                {t('openai_no_hint')}
              </p>
            </div>
          )}

          {result.checked.map((usage) => (
            <UsageResultRow key={usage.subscriptionId} usage={usage} />
          ))}

          {result.checked.length > 0 && (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
              result.markedOverlimit > 0
                ? 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
            }`}>
              {result.markedOverlimit > 0 ? (
                <>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    <span className="font-semibold">{result.markedOverlimit}</span>{' '}
                    {result.markedOverlimit === 1 ? t('openai_overlimit_one') : t('openai_overlimit_many')} {t('openai_overlimit_as')}{' '}
                    <span className="font-semibold">Overlimit - Review Needed</span> {t('openai_updated_db')}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{t('openai_all_ok_prefix')} {OVERLIMIT_THRESHOLD_PERCENT}{t('openai_all_ok_suffix')}</span>
                </>
              )}
            </div>
          )}

          <p className="text-right text-xs" style={{ color: 'var(--muted)' }}>
            {t('openai_checked_at')} {format(new Date(), 'dd.MM.yyyy HH:mm')}
          </p>
        </div>
      )}
    </div>
  )
}
