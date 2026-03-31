'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Subscription } from '@/types/subscription'
import { useLanguage } from '@/components/LanguageProvider'
import { getMonthlyEquivalent } from '@/lib/renewalUtils'

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { color: string; label: Record<string, string> }> = {
  development:   { color: '#6366f1', label: { sr: 'Development',   en: 'Development'   } },
  design:        { color: '#a855f7', label: { sr: 'Dizajn',        en: 'Design'        } },
  productivity:  { color: '#3b82f6', label: { sr: 'Produktivnost', en: 'Productivity'  } },
  communication: { color: '#22c55e', label: { sr: 'Komunikacija',  en: 'Communication' } },
  marketing:     { color: '#f43f5e', label: { sr: 'Marketing',     en: 'Marketing'     } },
  storage:       { color: '#f59e0b', label: { sr: 'Storage',       en: 'Storage'       } },
  other:         { color: '#94a3b8', label: { sr: 'Ostalo',        en: 'Other'         } },
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { name: string; value: number; pct: number } }[] }) {
  if (!active || !payload?.length) return null
  const { name, value, pct } = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
      <p className="text-gray-600 dark:text-gray-300">€{value.toFixed(2)}/mj</p>
      <p className="text-gray-400 dark:text-gray-500">{pct.toFixed(1)}%</p>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  subscriptions: Subscription[]
}

export default function CostByCategoryChart({ subscriptions }: Props) {
  const { t, lang } = useLanguage()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  // Only count billing subscriptions
  const billing = subscriptions.filter(s => ['active', 'trial'].includes(s.status))

  // Group by category
  const byCategory: Record<string, number> = {}
  for (const s of billing) {
    const cat = s.category ?? 'other'
    byCategory[cat] = (byCategory[cat] ?? 0) + getMonthlyEquivalent(s.price, s.billing_cycle)
  }

  const total = Object.values(byCategory).reduce((a, b) => a + b, 0)

  const data = Object.entries(byCategory)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, value]) => ({
      name: CATEGORY_CONFIG[cat]?.label[lang] ?? cat,
      value: parseFloat(value.toFixed(2)),
      color: CATEGORY_CONFIG[cat]?.color ?? '#94a3b8',
      pct: total > 0 ? (value / total) * 100 : 0,
    }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-600">
        {t('chart_no_data')}
      </div>
    )
  }

  const legendColor = isDark ? '#9ca3af' : '#6b7280'

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center total label — placed below chart but looks like it is center */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
            <span style={{ color: legendColor }}>{entry.name}</span>
            <span className="font-medium" style={{ color: isDark ? '#e5e7eb' : '#111827' }}>
              €{entry.value.toFixed(0)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-600">
        {t('chart_total_tooltip')}: <span className="font-semibold text-gray-700 dark:text-gray-300">€{total.toFixed(2)}/{t('cycle_short_monthly')}</span>
      </p>
    </div>
  )
}
