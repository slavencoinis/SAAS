'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { format, subMonths, endOfMonth, parseISO, startOfMonth, isSameMonth } from 'date-fns'
import { Subscription } from '@/types/subscription'
import { useLanguage } from '@/components/LanguageProvider'

// ─── Helper ───────────────────────────────────────────────────────────────────

function toMonthly(price: number, cycle: string): number {
  if (cycle === 'yearly')   return price / 12
  if (cycle === 'weekly')   return price * 4.333
  if (cycle === 'one-time') return 0
  return price
}

function buildTrendData(subscriptions: Subscription[], numMonths = 7) {
  const today = new Date()
  const months = Array.from({ length: numMonths }, (_, i) =>
    subMonths(today, numMonths - 1 - i)
  )

  return months.map((date) => {
    const monthEnd   = endOfMonth(date)
    const isCurrent  = isSameMonth(date, today)

    let total = 0
    for (const sub of subscriptions) {
      if (!sub.start_date) continue
      const startDate = parseISO(sub.start_date)
      // Must have started on or before this month
      if (startDate > monthEnd) continue

      // For current and past months: include active/trial always
      // Cancelled/paused: include in all past months (we don't know stop date)
      if (isCurrent) {
        if (!['active', 'trial'].includes(sub.status)) continue
      }
      // Past months: include everything that was started
      total += toMonthly(sub.price, sub.billing_cycle)
    }

    return {
      month: format(date, 'MMM yy'),
      total: parseFloat(total.toFixed(2)),
      isCurrent,
    }
  })
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-900 dark:text-white mb-0.5">{label}</p>
      <p className="text-indigo-600 dark:text-indigo-400 font-medium">€{payload[0].value.toFixed(2)}</p>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  subscriptions: Subscription[]
}

export default function MonthlyTrendChart({ subscriptions }: Props) {
  const { t } = useLanguage()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const data = buildTrendData(subscriptions)

  if (subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-600">
        {t('chart_no_data')}
      </div>
    )
  }

  const gridColor  = isDark ? '#1f2937' : '#f3f4f6'
  const axisColor  = isDark ? '#6b7280' : '#9ca3af'
  const barDefault = isDark ? '#4338ca' : '#6366f1'
  const barCurrent = isDark ? '#818cf8' : '#4f46e5'

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={28} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={gridColor} />
        <XAxis
          dataKey="month"
          tick={{ fill: axisColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: axisColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `€${v}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#1f2937' : '#f9fafb', radius: 4 }} />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.isCurrent ? barCurrent : barDefault} opacity={entry.isCurrent ? 1 : 0.65} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
