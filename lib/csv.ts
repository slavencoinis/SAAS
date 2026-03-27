import Papa from 'papaparse'
import { Subscription, SubscriptionInsert, BillingCycle, SubscriptionStatus, UsageStatus, Category } from '@/types/subscription'

const BILLING_CYCLES: BillingCycle[]         = ['monthly', 'yearly', 'weekly', 'one-time']
const STATUSES: SubscriptionStatus[]         = ['active', 'paused', 'cancelled', 'trial', 'overlimit', 'inactive']
const USAGE_STATUSES: UsageStatus[]          = ['high', 'medium', 'low', 'unused', 'underutilized']
const CATEGORIES: (Category | null)[]        = ['productivity', 'development', 'design', 'marketing', 'communication', 'storage', 'other', null]

const HEADERS = [
  'name', 'description', 'url',
  'price', 'currency', 'billing_cycle',
  'start_date', 'renewal_date',
  'status', 'usage_status', 'category',
  'notes', 'api_key_linked',
] as const

export function exportSubscriptionsToCSV(subscriptions: Subscription[]): string {
  const rows = subscriptions.map((s) => ({
    name:           s.name,
    description:    s.description ?? '',
    url:            s.url ?? '',
    price:          s.price,
    currency:       s.currency,
    billing_cycle:  s.billing_cycle,
    start_date:     s.start_date ?? '',
    renewal_date:   s.renewal_date ?? '',
    status:         s.status,
    usage_status:   s.usage_status,
    category:       s.category ?? '',
    notes:          s.notes ?? '',
    api_key_linked: s.api_key_linked ? 'true' : 'false',
  }))

  return Papa.unparse(rows, { header: true, columns: HEADERS as unknown as string[] })
}

export interface ParseResult {
  rows: SubscriptionInsert[]
  errors: string[]
}

export function parseSubscriptionsFromCSV(csvText: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  const errors: string[] = result.errors.map((e) => `Row ${e.row}: ${e.message}`)
  const rows: SubscriptionInsert[] = []

  result.data.forEach((row, i) => {
    const rowNum = i + 2 // +2 because header is row 1

    const name = row.name?.trim()
    if (!name) { errors.push(`Row ${rowNum}: name is required`); return }

    const price = parseFloat(row.price)
    if (isNaN(price) || price < 0) { errors.push(`Row ${rowNum}: invalid price "${row.price}"`); return }

    const cycle = row.billing_cycle?.trim() as BillingCycle
    if (!BILLING_CYCLES.includes(cycle)) { errors.push(`Row ${rowNum}: invalid billing_cycle "${row.billing_cycle}"`); return }

    const status = (row.status?.trim() || 'active') as SubscriptionStatus
    if (!STATUSES.includes(status)) { errors.push(`Row ${rowNum}: invalid status "${row.status}"`); return }

    const usage = (row.usage_status?.trim() || 'medium') as UsageStatus
    if (!USAGE_STATUSES.includes(usage)) { errors.push(`Row ${rowNum}: invalid usage_status "${row.usage_status}"`); return }

    const rawCat = row.category?.trim() || null
    const category = (rawCat && CATEGORIES.includes(rawCat as Category) ? rawCat : null) as Category | null

    rows.push({
      name,
      description:    row.description?.trim() || null,
      url:            row.url?.trim() || null,
      price,
      currency:       row.currency?.trim() || 'EUR',
      billing_cycle:  cycle,
      start_date:     row.start_date?.trim() || null,
      renewal_date:   row.renewal_date?.trim() || null,
      status,
      usage_status:   usage,
      category,
      notes:          row.notes?.trim() || null,
      api_key_linked: row.api_key_linked?.trim() === 'true',
    })
  })

  return { rows, errors }
}
