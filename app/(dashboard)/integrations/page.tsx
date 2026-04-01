'use client'

import OpenAIUsageChecker from '@/components/integrations/OpenAIUsageChecker'
import AdobeUsageChecker from '@/components/AdobeUsageChecker'
import GitHubCopilotChecker from '@/components/integrations/GitHubCopilotChecker'
import SlackUsageChecker from '@/components/integrations/SlackUsageChecker'
import AWSCostChecker from '@/components/integrations/AWSCostChecker'
import GoogleWorkspaceChecker from '@/components/integrations/GoogleWorkspaceChecker'
import { Info } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

export default function IntegrationsPage() {
  const { t } = useLanguage()

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

      {/* Integration cards — 2 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OpenAIUsageChecker />
        <AdobeUsageChecker />
        <GitHubCopilotChecker />
        <SlackUsageChecker />
        <AWSCostChecker />
        <GoogleWorkspaceChecker />
      </div>
    </div>
  )
}
