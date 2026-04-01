import { describe, it, expect } from 'vitest'
import { exportSubscriptionsToCSV, parseSubscriptionsFromCSV } from './csv'
import type { Subscription } from '@/types/subscription'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const base: Subscription = {
  id:             'abc-123',
  user_id:        'user-1',
  name:           'GitHub',
  description:    'Code hosting',
  url:            'https://github.com',
  price:          10,
  currency:       'USD',
  billing_cycle:  'monthly',
  start_date:     '2025-01-01',
  renewal_date:   '2026-04-01',
  status:         'active',
  usage_status:   'high',
  category:       'development',
  notes:          'Team plan',
  api_key_linked: true,
  created_at:     '2025-01-01T00:00:00Z',
  updated_at:     '2025-01-01T00:00:00Z',
}

// ─── exportSubscriptionsToCSV ─────────────────────────────────────────────────

describe('exportSubscriptionsToCSV', () => {
  it('produces a CSV with header row', () => {
    const csv = exportSubscriptionsToCSV([base])
    const lines = csv.trim().split('\n')
    expect(lines[0]).toContain('name')
    expect(lines[0]).toContain('price')
    expect(lines[0]).toContain('billing_cycle')
  })

  it('does not include id, user_id, created_at, updated_at columns', () => {
    const csv = exportSubscriptionsToCSV([base])
    expect(csv).not.toContain('user_id')
    expect(csv).not.toContain('created_at')
    expect(csv).not.toContain('updated_at')
  })

  it('serialises api_key_linked as "true"/"false"', () => {
    const csv = exportSubscriptionsToCSV([base])
    expect(csv).toContain('true')

    const csv2 = exportSubscriptionsToCSV([{ ...base, api_key_linked: false }])
    expect(csv2).toContain('false')
  })

  it('handles null optional fields as empty strings', () => {
    const csv = exportSubscriptionsToCSV([{ ...base, description: null, url: null, notes: null, category: null }])
    expect(csv).toBeTruthy()
    // Should still produce a valid CSV row
    const lines = csv.trim().split('\n')
    expect(lines).toHaveLength(2)
  })

  it('exports multiple subscriptions as multiple rows', () => {
    const csv = exportSubscriptionsToCSV([base, { ...base, name: 'Figma', price: 15 }])
    const lines = csv.trim().split('\n')
    expect(lines).toHaveLength(3) // header + 2 data rows
  })

  it('returns empty string for empty array', () => {
    const csv = exportSubscriptionsToCSV([])
    expect(csv).toBe('')
  })
})

// ─── parseSubscriptionsFromCSV ────────────────────────────────────────────────

describe('parseSubscriptionsFromCSV — happy path', () => {
  it('round-trips through export/import', () => {
    const csv = exportSubscriptionsToCSV([base])
    const { rows, errors } = parseSubscriptionsFromCSV(csv)
    expect(errors).toHaveLength(0)
    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe('GitHub')
    expect(rows[0].price).toBe(10)
    expect(rows[0].billing_cycle).toBe('monthly')
    expect(rows[0].api_key_linked).toBe(true)
  })

  it('defaults status to "active" when omitted', () => {
    const csv = `name,price,billing_cycle,currency\nNotion,8,monthly,USD`
    const { rows, errors } = parseSubscriptionsFromCSV(csv)
    expect(errors).toHaveLength(0)
    expect(rows[0].status).toBe('active')
  })

  it('defaults usage_status to "medium" when omitted', () => {
    const csv = `name,price,billing_cycle,currency\nNotion,8,monthly,USD`
    const { rows } = parseSubscriptionsFromCSV(csv)
    expect(rows[0].usage_status).toBe('medium')
  })

  it('defaults currency to "EUR" when omitted', () => {
    const csv = `name,price,billing_cycle\nNotion,8,monthly`
    const { rows } = parseSubscriptionsFromCSV(csv)
    expect(rows[0].currency).toBe('EUR')
  })

  it('sets unknown category to null', () => {
    const csv = `name,price,billing_cycle,category\nNotion,8,monthly,unicorn`
    const { rows, errors } = parseSubscriptionsFromCSV(csv)
    expect(errors).toHaveLength(0)
    expect(rows[0].category).toBeNull()
  })

  it('parses api_key_linked "true" as boolean true', () => {
    const csv = `name,price,billing_cycle,api_key_linked\nNotion,8,monthly,true`
    const { rows } = parseSubscriptionsFromCSV(csv)
    expect(rows[0].api_key_linked).toBe(true)
  })

  it('parses api_key_linked any other value as false', () => {
    const csv = `name,price,billing_cycle,api_key_linked\nNotion,8,monthly,yes`
    const { rows } = parseSubscriptionsFromCSV(csv)
    expect(rows[0].api_key_linked).toBe(false)
  })

  it('skips empty lines', () => {
    const csv = `name,price,billing_cycle\nNotion,8,monthly\n\n`
    const { rows } = parseSubscriptionsFromCSV(csv)
    expect(rows).toHaveLength(1)
  })
})

describe('parseSubscriptionsFromCSV — validation errors', () => {
  it('errors when name is missing', () => {
    const csv = `name,price,billing_cycle\n ,10,monthly`
    const { rows, errors } = parseSubscriptionsFromCSV(csv)
    expect(errors.some(e => e.includes('name is required'))).toBe(true)
    expect(rows).toHaveLength(0)
  })

  it('errors when price is not a number', () => {
    const csv = `name,price,billing_cycle\nNotion,abc,monthly`
    const { errors } = parseSubscriptionsFromCSV(csv)
    expect(errors.some(e => e.includes('invalid price'))).toBe(true)
  })

  it('errors when price is negative', () => {
    const csv = `name,price,billing_cycle\nNotion,-5,monthly`
    const { errors } = parseSubscriptionsFromCSV(csv)
    expect(errors.some(e => e.includes('invalid price'))).toBe(true)
  })

  it('errors on unknown billing_cycle', () => {
    const csv = `name,price,billing_cycle\nNotion,8,biannual`
    const { errors } = parseSubscriptionsFromCSV(csv)
    expect(errors.some(e => e.includes('invalid billing_cycle'))).toBe(true)
  })

  it('errors on unknown status', () => {
    const csv = `name,price,billing_cycle,status\nNotion,8,monthly,pending`
    const { errors } = parseSubscriptionsFromCSV(csv)
    expect(errors.some(e => e.includes('invalid status'))).toBe(true)
  })

  it('errors on unknown usage_status', () => {
    const csv = `name,price,billing_cycle,usage_status\nNotion,8,monthly,broken`
    const { errors } = parseSubscriptionsFromCSV(csv)
    expect(errors.some(e => e.includes('invalid usage_status'))).toBe(true)
  })

  it('collects multiple errors from multiple rows', () => {
    const csv = `name,price,billing_cycle\n,abc,monthly\n,xyz,weekly`
    const { errors } = parseSubscriptionsFromCSV(csv)
    expect(errors.length).toBeGreaterThanOrEqual(2)
  })

  it('skips invalid rows but keeps valid ones', () => {
    const csv = `name,price,billing_cycle\nValid,10,monthly\n,bad,monthly`
    const { rows, errors } = parseSubscriptionsFromCSV(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe('Valid')
    expect(errors).toHaveLength(1)
  })
})
