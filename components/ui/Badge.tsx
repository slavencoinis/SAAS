import { ReactNode } from 'react'

type Variant = 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'purple' | 'orange'

const variants: Record<Variant, string> = {
  green:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
  yellow: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
  red:    'bg-rose-50 text-rose-700 ring-1 ring-rose-200/80 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20',
  gray:   'bg-slate-50 text-slate-600 ring-1 ring-slate-200/80 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20',
  blue:   'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20',
  purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200/80 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20',
  orange: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200/80 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20',
}

export default function Badge({ children, variant = 'gray' }: { children: ReactNode; variant?: Variant }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${variants[variant]}`}>
      {children}
    </span>
  )
}
