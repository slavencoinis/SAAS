'use client'

import { useState } from 'react'
import { runGoogleWorkspaceCheck, GoogleCheckResult } from '@/app/actions/googleCheck'
import { GoogleWorkspaceUsageData, UNDERUTILIZED_THRESHOLD } from '@/lib/integrations/google/checkWorkspace'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle, RefreshCw, Globe, HardDrive } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import { isDemoMode } from '@/lib/demo'

function LicenseBar({ percent }: { percent: number }) {
  const color = percent >= UNDERUTILIZED_THRESHOLD ? 'bg-emerald-500' : 'bg-amber-400'
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--card-border)' }}>
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${percent}%` }} />
    </div>
  )
}

function StorageBar({ percent }: { percent: number }) {
  const color = percent >= 80 ? 'bg-red-500' : percent >= 60 ? 'bg-amber-400' : 'bg-blue-500'
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--card-border)' }}>
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${percent}%` }} />
    </div>
  )
}

function GoogleResultRow({ data }: { data: GoogleWorkspaceUsageData }) {
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
              <span>
                <span className={`font-medium ${warn ? 'text-amber-700 dark:text-amber-400' : ''}`}
                  style={!warn ? { color: 'var(--foreground)' } : {}}>
                  {data.activeUsers} / {data.totalLicenses}
                </span> {t('google_users_active')}
              </span>
              <span>{t('google_plan')}: <span className="font-medium" style={{ color: 'var(--foreground)' }}>{data.plan}</span></span>
              <span>{t('google_waste')}: <span className="font-medium" style={{ color: 'var(--foreground)' }}>${data.estimatedWasteUSD}/mo</span></span>
            </div>
            <LicenseBar percent={data.activePercent} />
            <p className={`mt-1 text-xs font-medium ${warn ? 'text-amber-600 dark:text-amber-400' : ''}`}
              style={!warn ? { color: 'var(--muted)' } : {}}>
              {data.activePercent}% {t('google_licenses_active')}
              {warn && ` — ${t('google_below_threshold')} ${UNDERUTILIZED_THRESHOLD}%`}
            </p>

            {/* Storage */}
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
              <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" /> {t('google_storage')}</span>
                <span>{data.storageUsedGB} GB / {data.storageLimitGB} GB ({data.storagePercent}%)</span>
              </div>
              <StorageBar percent={data.storagePercent} />
            </div>
          </div>
        </div>
        <span className={`shrink-0 self-start rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
          warn
            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
            : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
        }`}>
          {warn ? t('status_underutilized') : t('google_ok')}
        </span>
      </div>
    </div>
  )
}

export default function GoogleWorkspaceChecker() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GoogleCheckResult | null>(null)
  const { t } = useLanguage()
  const demo = isDemoMode()

  async function handleCheck() {
    setLoading(true)
    setResult(null)
    try {
      if (demo) {
        const { simulateGoogleWorkspaceApi } = await import('@/lib/integrations/google/checkWorkspace')
        const mockResult = simulateGoogleWorkspaceApi('demo-google-001', 'Google Workspace (Demo)')
        setResult({ checked: [mockResult], markedUnderutilized: mockResult.isUnderutilized ? 1 : 0, noSubscriptionsFound: false })
      } else {
        const data = await runGoogleWorkspaceCheck()
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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4285F4]">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>Google Workspace</h2>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {t('google_subtitle_prefix')} {UNDERUTILIZED_THRESHOLD}% {t('google_subtitle_suffix')}
            </p>
          </div>
        </div>
        <button
          onClick={handleCheck}
          disabled={loading}
          className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
          style={{ background: '#4285F4' }}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t('google_checking') : t('google_check_btn')}
        </button>
      </div>

      {!result && !loading && (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>{t('google_desc')}</p>
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
              <Globe className="mx-auto mb-2 h-8 w-8" style={{ color: 'var(--card-border)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{t('google_no_services')}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{t('google_no_hint')}</p>
            </div>
          )}
          {result.checked.map((d) => <GoogleResultRow key={d.subscriptionId} data={d} />)}
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
