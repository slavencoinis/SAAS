import OpenAIUsageChecker from '@/components/integrations/OpenAIUsageChecker'
import AdobeUsageChecker from '@/components/AdobeUsageChecker'
import { Plug, Info } from 'lucide-react'

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integracije</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Simulirani API pozivi ka eksternim servisima za provjeru stvarnog korištenja licenci.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Svi API pozivi su trenutno <span className="font-semibold">simulirani (mock)</span> —
          rezultati su deterministički generirani iz ID-a servisa.
          Da povežeš pravi API, zamijeni tijelo funkcije u{' '}
          <code className="rounded bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 font-mono text-xs">
            lib/integrations/
          </code>{' '}
          sa stvarnim{' '}
          <code className="rounded bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 font-mono text-xs">
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
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
          <Plug className="h-4 w-4 text-gray-400" />
          Dostupne integracije
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'OpenAI Usage API',    status: 'Aktivno (mock)', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' },
            { name: 'Adobe Creative Cloud',status: 'Aktivno (mock)', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' },
            { name: 'GitHub Copilot API',  status: 'Uskoro',         color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'        },
            { name: 'Slack Billing API',   status: 'Uskoro',         color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'        },
            { name: 'AWS Cost Explorer',   status: 'Uskoro',         color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'        },
            { name: 'Google Workspace',    status: 'Uskoro',         color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'        },
          ].map(({ name, status, color }) => (
            <div key={name} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-800 px-4 py-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{name}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
