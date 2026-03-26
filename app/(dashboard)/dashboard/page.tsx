'use client'

import { useSubscriptions } from '@/hooks/useSubscriptions'
import { Subscription } from '@/types/subscription'
import { format, differenceInDays, parseISO } from 'date-fns'
import { CreditCard, TrendingUp, AlertTriangle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge, UsageBadge } from '@/components/StatusBadge'
import AdobeUsageChecker from '@/components/AdobeUsageChecker'

function getMonthlyEquivalent(price: number, cycle: string): number {
  if (cycle === 'yearly') return price / 12
  if (cycle === 'weekly') return price * 4.33
  if (cycle === 'one-time') return 0
  return price
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-6 w-12 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse space-y-4">
            <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex justify-between">
                <div className="space-y-1">
                  <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
                <div className="h-6 w-12 rounded-full bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse space-y-3">
        <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-16 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard content ────────────────────────────────────────────────────────

function DashboardStats({ subscriptions }: { subscriptions: Subscription[] }) {
  const active = subscriptions.filter((s) => s.status === 'active' || s.status === 'trial')
  const monthlyTotal = active.reduce((sum, s) => sum + getMonthlyEquivalent(s.price, s.billing_cycle), 0)
  const unused = subscriptions.filter((s) => s.usage_status === 'unused' && s.status === 'active')
  const today = new Date()
  const expiringSoon = subscriptions.filter((s) => {
    if (!s.renewal_date || s.status === 'cancelled') return false
    const days = differenceInDays(parseISO(s.renewal_date), today)
    return days >= 0 && days <= 30
  })

  const stats = [
    { label: 'Aktivne pretplate',  value: active.length,                icon: CreditCard,    color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950' },
    { label: 'Misecni trošak',     value: `€${monthlyTotal.toFixed(2)}`, icon: TrendingUp,    color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950'   },
    { label: 'Istice uskoro (30d)', value: expiringSoon.length,          icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950' },
    { label: 'Ne koriste se',      value: unused.length,                 icon: XCircle,       color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-950'       },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3">
            <div className={`${bg} p-2.5 rounded-lg`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DashboardContent({ subscriptions }: { subscriptions: Subscription[] }) {
  const active = subscriptions.filter((s) => s.status === 'active' || s.status === 'trial')
  const monthlyTotal = active.reduce((sum, s) => sum + getMonthlyEquivalent(s.price, s.billing_cycle), 0)
  const yearlyTotal = monthlyTotal * 12
  const unused = subscriptions.filter((s) => s.usage_status === 'unused' && s.status === 'active')
  const today = new Date()
  const expiringSoon = subscriptions.filter((s) => {
    if (!s.renewal_date || s.status === 'cancelled') return false
    const days = differenceInDays(parseISO(s.renewal_date), today)
    return days >= 0 && days <= 30
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring soon */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Istice uskoro
          </h2>
          {expiringSoon.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">Nema pretplata koje isticu u sljedecih 30 dana.</p>
          ) : (
            <div className="space-y-3">
              {expiringSoon.slice(0, 5).map((s) => {
                const days = differenceInDays(parseISO(s.renewal_date!), today)
                return (
                  <div key={s.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(parseISO(s.renewal_date!), 'dd.MM.yyyy')}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      days <= 7
                        ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {days === 0 ? 'Danas' : `${days}d`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Unused */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Pretplate koje ne koristis
          </h2>
          {unused.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">Sve aktivne pretplate se koriste.</p>
          ) : (
            <div className="space-y-3">
              {unused.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.currency} {s.price}/{s.billing_cycle === 'monthly' ? 'mj' : 'god'}</p>
                  </div>
                  <Link href={`/subscriptions/${s.id}`} className="text-xs text-indigo-500 hover:underline">Uredi</Link>
                </div>
              ))}
            </div>
          )}
          {unused.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Potencijalna ustedevina:{' '}
                <span className="font-semibold text-red-600 dark:text-red-400">
                  €{unused.reduce((s, sub) => s + getMonthlyEquivalent(sub.price, sub.billing_cycle), 0).toFixed(2)}/mj
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Sve pretplate</h2>
          <Link href="/subscriptions" className="text-sm text-indigo-500 hover:underline">Vidi sve</Link>
        </div>
        {subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-3">Nemas jos nijednu pretplatu.</p>
            <Link href="/subscriptions/new" className="inline-flex px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
              Dodaj prvu pretplatu
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">Naziv</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">Cijena</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">Obnova</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">Koristenje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {subscriptions.slice(0, 8).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-2.5 px-3">
                      <Link href={`/subscriptions/${s.id}`} className="font-medium text-gray-900 dark:text-white hover:text-indigo-500">
                        {s.name}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300">
                      {s.currency} {s.price}/{s.billing_cycle === 'monthly' ? 'mj' : s.billing_cycle === 'yearly' ? 'god' : s.billing_cycle}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300">
                      {s.renewal_date ? format(parseISO(s.renewal_date), 'dd.MM.yyyy') : '-'}
                    </td>
                    <td className="py-2.5 px-3"><StatusBadge status={s.status} /></td>
                    <td className="py-2.5 px-3"><UsageBadge usage={s.usage_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {subscriptions.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300">Godisnji trošak</p>
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">€{yearlyTotal.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-indigo-600 dark:text-indigo-400">{active.length} aktivnih pretplata</p>
            <p className="text-xs text-indigo-500 mt-1">~€{monthlyTotal.toFixed(2)}/mj</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: subscriptions, isLoading } = useSubscriptions()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Pregled svih SaaS pretplata</p>
      </div>

      {isLoading || !subscriptions ? (
        <>
          <StatsSkeleton />
          <ContentSkeleton />
        </>
      ) : (
        <>
          <DashboardStats subscriptions={subscriptions} />
          <DashboardContent subscriptions={subscriptions} />
          <AdobeUsageChecker />
        </>
      )}
    </div>
  )
}
