import { addMonths, addYears, addWeeks, isBefore, parseISO, startOfDay, format } from 'date-fns'

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
