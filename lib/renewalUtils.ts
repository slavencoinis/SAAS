import { addMonths, addYears, addWeeks, isBefore, parseISO, startOfDay, startOfYear, format, differenceInMonths, differenceInWeeks } from 'date-fns'

export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'one-time'

export function getMonthlyEquivalent(price: number, cycle: BillingCycle | string): number {
  if (cycle === 'yearly')   return price / 12
  if (cycle === 'weekly')   return price * 4.33
  if (cycle === 'one-time') return 0
  return price
}

export function getYearlyEquivalent(price: number, cycle: BillingCycle | string): number {
  if (cycle === 'yearly')   return price
  if (cycle === 'weekly')   return price * 52
  if (cycle === 'one-time') return 0
  return price * 12
}

/**
 * Given a start date and billing cycle, returns the next upcoming renewal date.
 * Returns null for one-time payments or missing data.
 */
export function calcNextRenewal(startDate: string, billingCycle: string): Date | null {
  if (!startDate || billingCycle === 'one-time') return null

  const start = parseISO(startDate)
  const today = startOfDay(new Date())

  // If subscription hasn't started yet, first renewal is one period after start
  if (!isBefore(start, today)) {
    if (billingCycle === 'monthly') return addMonths(start, 1)
    if (billingCycle === 'yearly')  return addYears(start, 1)
    if (billingCycle === 'weekly')  return addWeeks(start, 1)
    return null
  }

  // Walk forward from start date until we pass today
  let next = start
  let i = 0
  while (isBefore(next, today) && i < 1200) {
    if (billingCycle === 'monthly') next = addMonths(next, 1)
    else if (billingCycle === 'yearly')  next = addYears(next, 1)
    else if (billingCycle === 'weekly')  next = addWeeks(next, 1)
    else break
    i++
  }

  return next
}

/**
 * Returns the renewal date string (ISO yyyy-MM-dd) to display.
 * Uses stored renewal_date if present, otherwise calculates from start_date + billing_cycle.
 */
export function getDisplayRenewal(
  renewalDate: string | null | undefined,
  startDate: string | null | undefined,
  billingCycle: string,
): Date | null {
  if (renewalDate) return parseISO(renewalDate)
  if (startDate)   return calcNextRenewal(startDate, billingCycle)
  return null
}

/** Format a renewal Date for display, or return '-' */
export function formatRenewal(date: Date | null): string {
  return date ? format(date, 'dd.MM.yyyy') : '-'
}

/** ISO string (yyyy-MM-dd) from a Date, for storing in DB / form state */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Statuses that count toward active billing.
 */
export const BILLING_STATUSES = ['active', 'trial', 'overlimit'] as const

/**
 * Calculate how much was paid this calendar year for a subscription.
 * Used for cancelled/paused services to show past spend without projecting future.
 */
export function paidThisYear(price: number, billingCycle: string, startDate: string | null | undefined): number {
  if (!startDate || billingCycle === 'one-time') return 0

  const today = startOfDay(new Date())
  const yearStart = startOfYear(today)
  const start = parseISO(startDate)

  // Effective start for this year's calculation
  const from = isBefore(start, yearStart) ? yearStart : start

  if (!isBefore(from, today)) return 0 // started in the future

  if (billingCycle === 'monthly') {
    const months = differenceInMonths(today, from)
    return (months + 1) * price  // +1 because the current month was charged
  }
  if (billingCycle === 'weekly') {
    const weeks = differenceInWeeks(today, from)
    return (weeks + 1) * price
  }
  if (billingCycle === 'yearly') {
    // One yearly charge if the subscription was active at any point this year
    return price
  }
  return 0
}
