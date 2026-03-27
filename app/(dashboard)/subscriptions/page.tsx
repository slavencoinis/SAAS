'use client'

import { useMemo, useState } from 'react'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useLanguage } from '@/components/LanguageProvider'
import { Subscription } from '@/types/subscription'
import { differenceInDays, parseISO } from 'date-fns'
import { getDisplayRenewal, formatRenewal } from '@/lib/renewalUtils'
import Link from 'next/link'
import { PlusCircle, ExternalLink, Search, X, SlidersHorizontal, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { StatusBadge, UsageBadge } from '@/components/StatusBadge'
import DeleteButton from './DeleteButton'

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey    = 'name' | 'category' | 'price' | 'renewal' | 'status' | 'usage'
type SortDir    = 'asc' | 'desc'
type ViewPeriod = 'monthly' | 'yearly'

// ─── Price normalisation ──────────────────────────────────────────────────────

function toMonthly(price: number, cycle: string): number {
  if (cycle === 'yearly')   return price / 12
  if (cycle === 'weekly')   return price * 4.333
  if (cycle === 'one-time') return 0
  return price
}

function toYearly(price: number, cycle: string): number {
  if (cycle === 'yearly')   return price
  if (cycle === 'weekly')   return price * 52
  if (cycle === 'one-time') return 0
  return price * 12
}

/** Return normalised price + suffix label for the chosen view period */
function normalisePrice(
  price: number,
  cycle: string,
  currency: string,
  view: ViewPeriod,
  cycleShortMo: string,
  cycleShortYr: string,
): { amount: string; suffix: string; approx: boolean } {
  if (cycle === 'one-time') return { amount: `${currency} ${price}`, suffix: '', approx: false }
  const approx = (view === 'monthly' && cycle !== 'monthly') || (view === 'yearly' && cycle !== 'yearly')
  if (view === 'monthly') {
    return { amount: `${currency} ${toMonthly(price, cycle).toFixed(2)}`, suffix: `/${cycleShortMo}`, approx }
  }
  return { amount: `${currency} ${toYearly(price, cycle).toFixed(2)}`, suffix: `/${cycleShortYr}`, approx }
}

// ─── Sort helpers ─────────────────────────────────────────────────────────────

const STATUS_ORDER: Record<string, number> = {
  active: 0, trial: 1, overlimit: 2, paused: 3, cancelled: 4, inactive: 5,
}
const USAGE_ORDER: Record<string, number> = {
  high: 0, medium: 1, low: 2, unused: 3, underutilized: 4,
}

function sortSubscriptions(list: Subscription[], key: SortKey, dir: SortDir): Subscription[] {
  const sorted = [...list].sort((a, b) => {
    switch (key) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'category':
        return (a.category ?? 'other').localeCompare(b.category ?? 'other')
      case 'price':
        return toMonthly(a.price, a.billing_cycle) - toMonthly(b.price, b.billing_cycle)
      case 'renewal': {
        const da = getDisplayRenewal(a.renewal_date, a.start_date, a.billing_cycle)
        const db = getDisplayRenewal(b.renewal_date, b.start_date, b.billing_cycle)
        if (!da && !db) return 0
        if (!da) return 1
        if (!db) return -1
        return da.getTime() - db.getTime()
      }
      case 'status':
        return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
      case 'usage':
        return (USAGE_ORDER[a.usage_status] ?? 9) - (USAGE_ORDER[b.usage_status] ?? 9)
      default:
        return 0
    }
  })
  return dir === 'desc' ? sorted.reverse() : sorted
}

// ─── Category key map ─────────────────────────────────────────────────────────

const categoryKeys: Record<string, 'cat_productivity' | 'cat_development' | 'cat_design' | 'cat_marketing' | 'cat_communication' | 'cat_storage' | 'cat_other'> = {
  productivity:  'cat_productivity',
  development:   'cat_development',
  design:        'cat_design',
  marketing:     'cat_marketing',
  communication: 'cat_communication',
  storage:       'cat_storage',
  other:         'cat_other',
}

// ─── Sortable header cell ──────────────────────────────────────────────────────

function SortTh({
  label, sortKey, active, dir, onClick,
}: {
  label: string
  sortKey: SortKey
  active: boolean
  dir: SortDir
  onClick: (k: SortKey) => void
}) {
  return (
    <th
      className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 select-none"
    >
      <button
        onClick={() => onClick(sortKey)}
        className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors group"
      >
        {label}
        <span className={active ? 'text-indigo-500' : 'text-gray-300 dark:text-gray-600 group-hover:text-gray-400'}>
          {active
            ? dir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
            : <ChevronsUpDown className="w-3 h-3" />
          }
        </span>
      </button>
    </th>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
      <div className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-8 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-2.5 w-20 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="h-3.5 w-20 rounded bg-gray-100 dark:bg-gray-800 self-center" />
          <div className="h-3.5 w-16 rounded bg-gray-100 dark:bg-gray-800 self-center" />
          <div className="h-3.5 w-24 rounded bg-gray-100 dark:bg-gray-800 self-center" />
          <div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-800 self-center" />
          <div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-800 self-center" />
        </div>
      ))}
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

function SubscriptionsTable({
  subscriptions,
  sortKey, sortDir, onSort,
  viewPeriod,
  onReset,
}: {
  subscriptions: Subscription[]
  sortKey: SortKey
  sortDir: SortDir
  onSort: (k: SortKey) => void
  viewPeriod: ViewPeriod
  onReset: () => void
}) {
  const { t } = useLanguage()
  const today = new Date()

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
        <Search className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
        <p className="text-gray-400 dark:text-gray-500 mb-3 text-sm">{t('filter_no_results')}</p>
        <button onClick={onReset} className="text-sm text-indigo-500 hover:underline">
          {t('filter_reset')}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <SortTh label={t('col_name')}     sortKey="name"     active={sortKey === 'name'}     dir={sortDir} onClick={onSort} />
              <SortTh label={t('col_category')} sortKey="category" active={sortKey === 'category'} dir={sortDir} onClick={onSort} />
              <SortTh label={t('col_price')}    sortKey="price"    active={sortKey === 'price'}    dir={sortDir} onClick={onSort} />
              <SortTh label={t('col_renewal')}  sortKey="renewal"  active={sortKey === 'renewal'}  dir={sortDir} onClick={onSort} />
              <SortTh label={t('col_status')}   sortKey="status"   active={sortKey === 'status'}   dir={sortDir} onClick={onSort} />
              <SortTh label={t('col_usage')}    sortKey="usage"    active={sortKey === 'usage'}    dir={sortDir} onClick={onSort} />
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {subscriptions.map((s) => {
              const renewalDate      = getDisplayRenewal(s.renewal_date, s.start_date, s.billing_cycle)
              const daysUntilRenewal = renewalDate ? differenceInDays(renewalDate, today) : null
              const isExpiringSoon   = daysUntilRenewal !== null && daysUntilRenewal >= 0 && daysUntilRenewal <= 7

              return (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <Link
                          href={`/subscriptions/${s.id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400"
                        >
                          {s.name}
                        </Link>
                        {s.description && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[180px]">{s.description}</p>
                        )}
                      </div>
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 dark:text-gray-600 hover:text-indigo-500">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                    {s.category && categoryKeys[s.category] ? t(categoryKeys[s.category]) : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {(() => {
                      const { amount, suffix, approx } = normalisePrice(
                        s.price, s.billing_cycle, s.currency,
                        viewPeriod, t('cycle_short_monthly'), t('cycle_short_yearly'),
                      )
                      return (
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          {approx && <span className="text-gray-400 dark:text-gray-500 font-normal mr-0.5">≈</span>}
                          {amount}
                          <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">{suffix}</span>
                        </span>
                      )
                    })()}
                  </td>
                  <td className="py-3 px-4">
                    {renewalDate ? (
                      <div>
                        <span className={isExpiringSoon ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-200'}>
                          {formatRenewal(renewalDate)}
                        </span>
                        {daysUntilRenewal !== null && daysUntilRenewal >= 0 && daysUntilRenewal <= 30 && (
                          <span className={`ml-2 text-xs ${daysUntilRenewal <= 7 ? 'text-red-500' : 'text-yellow-500'}`}>
                            ({daysUntilRenewal === 0 ? t('today') : `${daysUntilRenewal}d`})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                  <td className="py-3 px-4"><UsageBadge usage={s.usage_status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/subscriptions/${s.id}`} className="text-xs text-indigo-500 hover:underline">
                        {t('edit')}
                      </Link>
                      <DeleteButton id={s.id} name={s.name} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const { data: subscriptions, isLoading } = useSubscriptions()
  const { t } = useLanguage()

  const [query,          setQuery]          = useState('')
  const [statusFilter,   setStatusFilter]   = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [billingFilter,  setBillingFilter]  = useState('all')
  const [sortKey,        setSortKey]        = useState<SortKey>('renewal')
  const [sortDir,        setSortDir]        = useState<SortDir>('asc')
  const [viewPeriod,     setViewPeriod]     = useState<ViewPeriod>('monthly')

  const isFiltered = query !== '' || statusFilter !== 'all' || categoryFilter !== 'all' || billingFilter !== 'all'

  const resetFilters = () => {
    setQuery('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setBillingFilter('all')
  }

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    if (!subscriptions) return []
    const q = query.toLowerCase()
    const result = subscriptions.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q) && !(s.description ?? '').toLowerCase().includes(q)) return false
      if (statusFilter   !== 'all' && s.status                    !== statusFilter)   return false
      if (categoryFilter !== 'all' && (s.category ?? 'other')     !== categoryFilter) return false
      if (billingFilter  !== 'all' && s.billing_cycle             !== billingFilter)  return false
      return true
    })
    return sortSubscriptions(result, sortKey, sortDir)
  }, [subscriptions, query, statusFilter, categoryFilter, billingFilter, sortKey, sortDir])

  const selectCls = [
    'h-9 pl-3 pr-8 rounded-lg text-sm appearance-none cursor-pointer',
    'border border-gray-200 dark:border-gray-700',
    'bg-white dark:bg-gray-800',
    'text-gray-700 dark:text-gray-200',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500',
  ].join(' ')

  const total = subscriptions?.length ?? 0

  return (
    <div className="space-y-4">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('services_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {isLoading || !subscriptions
              ? t('services_loading')
              : isFiltered
                ? `${filtered.length} ${t('filter_showing')} · ${total} ${t('services_total')}`
                : `${total} ${t('services_total')}`}
          </p>
        </div>
        <Link
          href="/subscriptions/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          {t('add_service_btn')}
        </Link>
      </div>

      {/* ── Search + Filters ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className={[
              'w-full h-9 pl-9 pr-8 rounded-lg text-sm',
              'border border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500',
            ].join(' ')}
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Period toggle */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs font-semibold shrink-0">
          <button
            onClick={() => setViewPeriod('monthly')}
            className={`px-3 h-9 transition-colors ${
              viewPeriod === 'monthly'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            /{t('cycle_short_monthly')}
          </button>
          <button
            onClick={() => setViewPeriod('yearly')}
            className={`px-3 h-9 border-l border-gray-200 dark:border-gray-700 transition-colors ${
              viewPeriod === 'yearly'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            /{t('cycle_short_yearly')}
          </button>
        </div>

        <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0 hidden sm:block" />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
          <option value="all">{t('filter_status')}: {t('filter_all')}</option>
          <option value="active">{t('status_active')}</option>
          <option value="trial">{t('status_trial')}</option>
          <option value="paused">{t('status_paused')}</option>
          <option value="cancelled">{t('status_cancelled')}</option>
          <option value="overlimit">{t('status_overlimit')}</option>
        </select>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectCls}>
          <option value="all">{t('filter_category')}: {t('filter_all')}</option>
          <option value="productivity">{t('cat_productivity')}</option>
          <option value="development">{t('cat_development')}</option>
          <option value="design">{t('cat_design')}</option>
          <option value="marketing">{t('cat_marketing')}</option>
          <option value="communication">{t('cat_communication')}</option>
          <option value="storage">{t('cat_storage')}</option>
          <option value="other">{t('cat_other')}</option>
        </select>

        <select value={billingFilter} onChange={(e) => setBillingFilter(e.target.value)} className={selectCls}>
          <option value="all">{t('filter_billing')}: {t('filter_all')}</option>
          <option value="monthly">{t('billing_monthly')}</option>
          <option value="yearly">{t('billing_yearly')}</option>
          <option value="weekly">{t('billing_weekly')}</option>
          <option value="one-time">{t('billing_once')}</option>
        </select>

        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            {t('filter_reset')}
          </button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      {isLoading || !subscriptions ? (
        <TableSkeleton />
      ) : subscriptions.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-400 dark:text-gray-500 mb-4">{t('no_services_empty')}</p>
          <Link
            href="/subscriptions/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            <PlusCircle className="w-4 h-4" />
            {t('add_first_btn')}
          </Link>
        </div>
      ) : (
        <SubscriptionsTable
          subscriptions={filtered}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          viewPeriod={viewPeriod}
          onReset={resetFilters}
        />
      )}
    </div>
  )
}
