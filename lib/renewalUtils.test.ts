import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { format } from 'date-fns'
import { calcNextRenewal, getDisplayRenewal, formatRenewal, paidThisYear } from './renewalUtils'

// Fix "today" to 2026-03-31 so tests are deterministic
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-03-31T12:00:00'))
})

afterEach(() => {
  vi.useRealTimers()
})

const fmt = (d: Date | null) => d ? format(d, 'yyyy-MM-dd') : null

// ─── calcNextRenewal ──────────────────────────────────────────────────────────

describe('calcNextRenewal', () => {
  it('returns null for one-time billing', () => {
    expect(calcNextRenewal('2026-01-01', 'one-time')).toBeNull()
  })

  it('returns null for missing start date', () => {
    expect(calcNextRenewal('', 'monthly')).toBeNull()
  })

  it('returns next month for a monthly subscription started in the past', () => {
    expect(fmt(calcNextRenewal('2026-01-15', 'monthly'))).toBe('2026-04-15')
  })

  it('returns next year for a yearly subscription started in the past', () => {
    expect(fmt(calcNextRenewal('2025-03-31', 'yearly'))).toBe('2026-03-31')
  })

  it('returns next week for a weekly subscription started in the past', () => {
    expect(fmt(calcNextRenewal('2026-03-25', 'weekly'))).toBe('2026-04-01')
  })

  it('returns one period after start for a future start date', () => {
    expect(fmt(calcNextRenewal('2026-04-10', 'monthly'))).toBe('2026-05-10')
  })
})

// ─── getDisplayRenewal ────────────────────────────────────────────────────────

describe('getDisplayRenewal', () => {
  it('prefers stored renewal_date over calculated', () => {
    expect(fmt(getDisplayRenewal('2026-05-01', '2026-01-01', 'monthly'))).toBe('2026-05-01')
  })

  it('falls back to calculated date when renewal_date is null', () => {
    expect(getDisplayRenewal(null, '2026-01-15', 'monthly')).not.toBeNull()
  })

  it('returns null when both renewal_date and start_date are missing', () => {
    expect(getDisplayRenewal(null, null, 'monthly')).toBeNull()
  })
})

// ─── formatRenewal ────────────────────────────────────────────────────────────

describe('formatRenewal', () => {
  it('formats a date as dd.MM.yyyy', () => {
    expect(formatRenewal(new Date('2026-05-01T12:00:00'))).toBe('01.05.2026')
  })

  it('returns "-" for null', () => {
    expect(formatRenewal(null)).toBe('-')
  })
})

// ─── paidThisYear ─────────────────────────────────────────────────────────────

describe('paidThisYear', () => {
  it('returns 0 for one-time billing', () => {
    expect(paidThisYear(10, 'one-time', '2026-01-01')).toBe(0)
  })

  it('returns 0 for missing start date', () => {
    expect(paidThisYear(10, 'monthly', null)).toBe(0)
  })

  it('calculates monthly payments from start of year for sub started before 2026', () => {
    // differenceInMonths(Mar31, Jan1) = 2, +1 = 3 months charged (Jan, Feb, Mar)
    expect(paidThisYear(100, 'monthly', '2025-06-01')).toBe(300)
  })

  it('calculates monthly payments from subscription start within the year', () => {
    // Started Feb 1 — differenceInMonths(Mar31, Feb01) = 1, +1 = 2 months
    expect(paidThisYear(50, 'monthly', '2026-02-01')).toBe(100)
  })

  it('returns price once for yearly subscription active this year', () => {
    expect(paidThisYear(120, 'yearly', '2025-01-01')).toBe(120)
  })

  it('returns 0 for future start date', () => {
    expect(paidThisYear(100, 'monthly', '2026-05-01')).toBe(0)
  })
})
