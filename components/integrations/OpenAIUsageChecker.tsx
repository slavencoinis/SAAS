'use client'

import { useState } from 'react'
import { runOpenAIUsageCheck, OpenAICheckResult } from '@/app/actions/openaiCheck'
import { OpenAIUsageData, OVERLIMIT_THRESHOLD_PERCENT } from '@/lib/integrations/openai/checkUsage'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle, RefreshCw, Zap } from 'lucide-react'

function UsageBar({ percent }: { percent: number }) {
  const capped = Math.min(percent, 100)
  const color =
    capped >= OVERLIMIT_THRESHOLD_PERCENT ? 'bg-red-500' :
    capped >= 60                          ? 'bg-yellow-400' :
                                            'bg-green-500'
  return (
    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${capped}%` }}
      />
    </div>
  )
}

function UsageResultRow({ usage }: { usage: OpenAIUsageData }) {
  const over = usage.isOverLimit

  return (
    <div className={`rounded-lg border p-4 ${
      over
        ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30'
        : 'border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {over
            ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            : <CheckCircle   className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {usage.subscriptionName}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
              <span>
                Potrošnja:{' '}
                <span className={`font-medium ${over ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>
                  {usage.currentTokens.toLocaleString()} / {usage.limitTokens.toLocaleString()} tokena
                </span>
              </span>
              <span>
                Period:{' '}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {usage.periodStart} → {usage.periodEnd}
                </span>
              </span>
              <span>
                Proc. trošak:{' '}
                <span className="font-medium text-gray-700 dark:text-gray-200">${usage.estimatedCostUSD}</span>
              </span>
            </div>
            <UsageBar percent={usage.usagePercent} />
            <p className={`mt-1 text-xs font-medium ${over ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {usage.usagePercent}% iskorišćeno
              {over && ` — prelazi ${OVERLIMIT_THRESHOLD_PERCENT}% prag`}
            </p>
          </div>
        </div>

        <span className={`shrink-0 self-start rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          over
            ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
            : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
        }`}>
          {over ? 'Overlimit' : 'U redu'}
        </span>
      </div>
    </div>
  )
}

export default function OpenAIUsageChecker() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OpenAICheckResult | null>(null)

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
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black dark:bg-white">
            <Zap className="h-5 w-5 text-white dark:text-black" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">OpenAI Usage API</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Prag upozorenja: {OVERLIMIT_THRESHOLD_PERCENT}% — status → Overlimit - Review Needed
            </p>
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={loading}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-black dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-black transition-colors hover:bg-gray-800 dark:hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Provjerava...' : 'Simuliraj provjeru'}
        </button>
      </div>

      {/* Description */}
      {!result && !loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Simulira poziv ka OpenAI Usage API-ju i provjerava potrošnju tokena za tekući period naplate.
          Pretplate čija je potrošnja ≥{' '}
          <span className="font-medium text-gray-700 dark:text-gray-200">{OVERLIMIT_THRESHOLD_PERCENT}%</span> limita
          automatski dobijaju status{' '}
          <span className="rounded bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 text-xs font-semibold text-red-800 dark:text-red-300">
            Overlimit - Review Needed
          </span>.
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
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
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-8 text-center">
              <Zap className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Nema OpenAI pretplata</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Dodaj pretplatu čiji naziv sadrži "OpenAI", "ChatGPT", "GPT-4" itd.
              </p>
            </div>
          )}

          {result.checked.map((usage) => (
            <UsageResultRow key={usage.subscriptionId} usage={usage} />
          ))}

          {result.checked.length > 0 && (
            <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
              result.markedOverlimit > 0
                ? 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300'
                : 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300'
            }`}>
              {result.markedOverlimit > 0 ? (
                <>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    <span className="font-semibold">{result.markedOverlimit}</span>{' '}
                    {result.markedOverlimit === 1 ? 'pretplata označena' : 'pretplate označene'} kao{' '}
                    <span className="font-semibold">Overlimit - Review Needed</span> i ažurirane u bazi.
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>Sve OpenAI pretplate su ispod {OVERLIMIT_THRESHOLD_PERCENT}% limita.</span>
                </>
              )}
            </div>
          )}

          <p className="text-right text-xs text-gray-400 dark:text-gray-600">
            Provjereno: {format(new Date(), 'dd.MM.yyyy HH:mm')}
          </p>
        </div>
      )}
    </div>
  )
}
