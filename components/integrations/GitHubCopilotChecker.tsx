'use client'

import { useState } from 'react'
import { runGitHubCopilotCheck, GitHubCheckResult } from '@/app/actions/githubCheck'
import { GitHubCopilotUsageData, UNDERUTILIZED_THRESHOLD_PERCENT } from '@/lib/integrations/github/checkCopilot'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle, RefreshCw, GitBranch, Users } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import { isDemoMode } from '@/lib/demo'

function SeatBar({ percent }: { percent: number }) {
  const color = percent >= UNDERUTILIZED_THRESHOLD_PERCENT ? 'bg-emerald-500' : 'bg-amber-400'
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--card-border)' }}>
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${percent}%` }} />
    </div>
  )
}

function CopilotResultRow({ data }: { data: GitHubCopilotUsageData }) {
  const { t } = useLanguage()
  const warn = data.isUnderutilized

  return (
    <div className={`rounded-xl border p-4 ${
      warn
        ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30'
        : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {warn
            ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            : <CheckCircle   className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
              {data.subscriptionName}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ color: 'var(--muted)' }}>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span className={`font-medium ${warn ? 'text-amber-700 dark:text-amber-400' : ''}`}
                  style={!warn ? { color: 'var(--foreground)' } : {}}>
                  {data.activeSeats} / {data.totalSeats} {t('github_seats_active')}
                </span>
              </span>
              <span>{t('github_waste')}: <span className="font-medium" style={{ color: 'var(--foreground)' }}>${data.estimatedWasteUSD}/mo</span></span>
              {data.pendingCancellation > 0 && (
                <span className="text-amber-600 dark:text-amber-400">{data.pendingCancellation} {t('github_pending_cancel')}</span>
              )}
            </div>
            <SeatBar percent={data.activePercent} />
            <p className={`mt-1 text-xs font-medium ${warn ? 'text-amber-600 dark:text-amber-400' : ''}`}
              style={!warn ? { color: 'var(--muted)' } : {}}>
              {data.activePercent}% {t('github_seats_used')}
              {warn && ` — ${t('github_below_threshold')} ${UNDERUTILIZED_THRESHOLD_PERCENT}%`}
            </p>
          </div>
        </div>
        <span className={`shrink-0 self-start rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
          warn
            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
            : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
        }`}>
          {warn ? t('status_underutilized') : t('github_seats_ok')}
        </span>
      </div>
    </div>
  )
}

export default function GitHubCopilotChecker() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GitHubCheckResult | null>(null)
  const { t } = useLanguage()
  const demo = isDemoMode()

  async function handleCheck() {
    setLoading(true)
    setResult(null)
    try {
      if (demo) {
        // In demo mode: simulate a result with mock data
        const { simulateGitHubCopilotApi } = await import('@/lib/integrations/github/checkCopilot')
        const mockResult = simulateGitHubCopilotApi('demo-github-001', 'GitHub Copilot (Demo)')
        setResult({ checked: [mockResult], markedUnderutilized: mockResult.isUnderutilized ? 1 : 0, noSubscriptionsFound: false })
      } else {
        const data = await runGitHubCopilotCheck()
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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 dark:bg-gray-100">
            <GitBranch className="h-5 w-5 text-white dark:text-gray-900" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>GitHub Copilot</h2>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {t('github_subtitle_prefix')} {UNDERUTILIZED_THRESHOLD_PERCENT}% {t('github_subtitle_suffix')}
            </p>
          </div>
        </div>
        <button
          onClick={handleCheck}
          disabled={loading}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-gray-900 dark:bg-gray-100 px-4 py-2 text-sm font-semibold text-white dark:text-gray-900 transition-colors hover:bg-gray-700 dark:hover:bg-gray-200 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t('github_checking') : t('github_check_btn')}
        </button>
      </div>

      {!result && !loading && (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {t('github_desc')} <span className="font-medium" style={{ color: 'var(--foreground)' }}>{UNDERUTILIZED_THRESHOLD_PERCENT}%</span>.
        </p>
      )}

      {loading && (
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-xl" style={{ background: 'var(--card-border)' }} />
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3">
          {result.error && (
            <p className="rounded-xl bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-400">{result.error}</p>
          )}
          {result.noSubscriptionsFound && (
            <div className="rounded-xl px-4 py-8 text-center" style={{ border: '1px solid var(--card-border)', background: 'var(--input-bg)' }}>
              <GitBranch className="mx-auto mb-2 h-8 w-8" style={{ color: 'var(--card-border)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{t('github_no_services')}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{t('github_no_hint')}</p>
            </div>
          )}
          {result.checked.map((d) => <CopilotResultRow key={d.subscriptionId} data={d} />)}
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
