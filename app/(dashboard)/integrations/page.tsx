'use client'

import OpenAIUsageChecker from '@/components/integrations/OpenAIUsageChecker'
import AdobeUsageChecker from '@/components/AdobeUsageChecker'
import { Plug, Info } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

export default function IntegrationsPage() {
  const { t } = useLanguage()

  const integrationList = [
    { name: 'OpenAI Usage API',     statusKey: 'integration_active' as const, color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
    { name: 'Adobe Creative Cloud', statusKey: 'integration_active' as const, color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
    { name: 'GitHub Copilot API',   statusKey: 'integration_soon'   as const, color: 'bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400' },
    { name: 'Slack Billing API',    statusKey: 'integration_soon'   as const, color: 'bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400' },
    { name: 'AWS Cost Explorer',    statusKey: 'integration_soon'   as const, color: 'bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400' },
    { name: 'Google Workspace',     statusKey: 'integration_soon'   as const, color: 'bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{t('integrations_title')}</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          {t('integrations_subtitle')}
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
        <p className="text-sm text-indigo-700 dark:text-indigo-300">
          {t('integrations_mock_note')} <span className="font-semibold">{t('integrations_mock_word')}</span>{' '}
          {t('integrations_mock_rest')}{' '}
          <code className="rounded bg-indigo-100 dark:bg-indigo-500/20 px-1 py-0.5 font-mono text-xs">
            lib/integrations/
          </code>{' '}
          {t('integrations_mock_end')}{' '}
          <code className="rounded bg-indigo-100 dark:bg-indigo-500/20 px-1 py-0.5 font-mono text-xs">
            fetch()
          </code>{' '}
          pozivom.
        </p>
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-1 gap-6">
        <OpenAIUsageChecker />
        <AdobeUsageChecker />
      </div>

      {/* Available integrations overview */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--card)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <h2 className="mb-5 flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
          <Plug className="h-4 w-4" style={{ color: 'var(--muted)' }} />
          {t('integrations_available')}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {integrationList.map(({ name, statusKey, color }) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ border: '1px solid var(--card-border)' }}
            >
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{name}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${color}`}>{t(statusKey)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
