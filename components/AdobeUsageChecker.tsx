'use client'

import { useState } from 'react'
import { runAdobeUsageCheck, AdobeCheckResult } from '@/app/actions/adobeCheck'
import { AdobeAppUsage, UNDERUTILIZED_THRESHOLD_DAYS } from '@/lib/adobe/checkAdobeUsage'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle, RefreshCw, Layers } from 'lucide-react'

function UsageResultRow({ usage }: { usage: AdobeAppUsage }) {
  const formattedDate = format(new Date(usage.lastOpened), 'dd.MM.yyyy HH:mm')
  const over = usage.isUnderutilized

  return (
    <div className={`flex items-start justify-between gap-4 rounded-lg border p-4 ${
      over
        ? 'border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/30'
        : 'border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30'
    }`}>
      <div className="flex items-start gap-3">
        {over
          ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
          : <CheckCircle   className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
        }
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{usage.subscriptionName}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Posljednji put otvoren:{' '}
            <span className="font-medium text-gray-700 dark:text-gray-200">{formattedDate}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Neaktivan:{' '}
            <span className={`font-medium ${over ? 'text-orange-700 dark:text-orange-400' : 'text-green-700 dark:text-green-400'}`}>
              {usage.daysSinceLastUse} {usage.daysSinceLastUse === 1 ? 'dan' : 'dana'}
            </span>{' '}
            <span className="text-gray-400 dark:text-gray-500">(prag: {UNDERUTILIZED_THRESHOLD_DAYS} dana)</span>
          </p>
        </div>
      </div>

      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        over
          ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300'
          : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
      }`}>
        {over ? 'Underutilized' : 'U upotrebi'}
      </span>
    </div>
  )
}

export default function AdobeUsageChecker() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AdobeCheckResult | null>(null)

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
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
            <Layers className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Adobe Creative Cloud</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Provjera stvarnog korištenja licenci</p>
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Provjerava...' : 'Simuliraj provjeru'}
        </button>
      </div>

      {/* Description */}
      {!result && !loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Simulira Adobe CC API poziv koji provjerava kada je Photoshop posljednji put otvoren.
          Ako nije korišten{' '}
          <span className="font-medium text-gray-700 dark:text-gray-200">{UNDERUTILIZED_THRESHOLD_DAYS}+ dana</span>,
          licenca se automatski označava kao{' '}
          <span className="rounded bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 text-xs font-medium text-orange-800 dark:text-orange-300">
            Underutilized
          </span>.
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-3">
          {result.error && (
            <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {result.error}
            </p>
          )}

          {result.noSubscriptionsFound && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Nema Adobe pretplata</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Dodaj pretplatu čiji naziv sadrži "Adobe", "Photoshop", "Creative Cloud" itd.
              </p>
            </div>
          )}

          {result.checked.map((usage) => (
            <UsageResultRow key={usage.subscriptionId} usage={usage} />
          ))}

          {result.checked.length > 0 && (
            <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
              result.markedUnderutilized > 0
                ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300'
                : 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300'
            }`}>
              {result.markedUnderutilized > 0 ? (
                <>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    <span className="font-semibold">{result.markedUnderutilized}</span>{' '}
                    {result.markedUnderutilized === 1 ? 'licenca označena' : 'licence označene'} kao{' '}
                    <span className="font-semibold">Underutilized</span> i ažurirane u bazi.
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>Sve Adobe licence se aktivno koriste.</span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
