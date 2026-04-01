'use client'

import { useState } from 'react'
import { runAWSCostCheck, AWSCheckResult } from '@/app/actions/awsCheck'
import { AWSCostData, BUDGET_INCREASE_THRESHOLD_PERCENT } from '@/lib/integrations/aws/checkCostExplorer'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle, RefreshCw, Cloud, TrendingUp, TrendingDown } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import { isDemoMode } from '@/lib/demo'

function AWSResultRow({ data }: { data: AWSCostData }) {
  const { t } = useLanguage()
  const over = data.isOverBudget
  const up = data.monthOverMonthChange > 0

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
              {data.subscriptionName}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ color: 'var(--muted)' }}>
              <span>
                {t('aws_current_month')}: <span className={`font-medium ${over ? 'text-red-700 dark:text-red-400' : ''}`}
                  style={!over ? { color: 'var(--foreground)' } : {}}>
                  ${data.currentMonthUSD}
                </span>
              </span>
              <span className="flex items-center gap-0.5">
                {up ? <TrendingUp className="h-3 w-3 text-red-500" /> : <TrendingDown className="h-3 w-3 text-emerald-500" />}
                <span className={up ? 'text-red-600 dark:text-red-400 font-medium' : 'text-emerald-600 dark:text-emerald-400 font-medium'}>
                  {up ? '+' : ''}{data.monthOverMonthChange}% {t('aws_vs_last_month')}
                </span>
              </span>
              <span>{t('aws_forecast')}: <span className="font-medium" style={{ color: 'var(--foreground)' }}>${data.forecastedMonthUSD}</span></span>
            </div>

            {/* Top services */}
            <div className="mt-3 space-y-1.5">
              {data.topServices.map((svc) => (
                <div key={svc.serviceName} className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--muted)' }}>{svc.serviceName}</span>
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>${svc.currentMonthUSD}</span>
                </div>
              ))}
            </div>

            {over && (
              <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                {t('aws_cost_spike')} {BUDGET_INCREASE_THRESHOLD_PERCENT}% {t('aws_threshold_exceeded')}
              </p>
            )}
          </div>
        </div>
        <span className={`shrink-0 self-start rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
          over
            ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
            : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
        }`}>
          {over ? t('status_overlimit') : t('aws_ok')}
        </span>
      </div>
    </div>
  )
}

export default function AWSCostChecker() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AWSCheckResult | null>(null)
  const { t } = useLanguage()
  const demo = isDemoMode()

  async function handleCheck() {
    setLoading(true)
    setResult(null)
    try {
      if (demo) {
        const { simulateAWSCostExplorer } = await import('@/lib/integrations/aws/checkCostExplorer')
        const mockResult = simulateAWSCostExplorer('demo-aws-001', 'AWS (Demo)')
        setResult({ checked: [mockResult], markedOverlimit: mockResult.isOverBudget ? 1 : 0, noSubscriptionsFound: false })
      } else {
        const data = await runAWSCostCheck()
        setResult(data)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF9900]">
            <Cloud className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>AWS Cost Explorer</h2>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {t('aws_subtitle_prefix')} {BUDGET_INCREASE_THRESHOLD_PERCENT}% {t('aws_subtitle_suffix')}
            </p>
          </div>
        </div>
        <button
          onClick={handleCheck}
          disabled={loading}
          className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
          style={{ background: '#FF9900' }}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t('aws_checking') : t('aws_check_btn')}
        </button>
      </div>

      {!result && !loading && (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>{t('aws_desc')}</p>
      )}

      {loading && (
        <div className="h-24 animate-pulse rounded-xl" style={{ background: 'var(--card-border)' }} />
      )}

      {result && !loading && (
        <div className="space-y-3">
          {result.error && (
            <p className="rounded-xl bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-400">{result.error}</p>
          )}
          {result.noSubscriptionsFound && (
            <div className="rounded-xl px-4 py-8 text-center" style={{ border: '1px solid var(--card-border)', background: 'var(--input-bg)' }}>
              <Cloud className="mx-auto mb-2 h-8 w-8" style={{ color: 'var(--card-border)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{t('aws_no_services')}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{t('aws_no_hint')}</p>
            </div>
          )}
          {result.checked.map((d) => <AWSResultRow key={d.subscriptionId} data={d} />)}
          {result.checked.length > 0 && (
            <p className="text-right text-xs" style={{ color: 'var(--muted)' }}>
              {t('openai_checked_at')} {format(new Date(), 'dd.MM.yyyy HH:mm')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
