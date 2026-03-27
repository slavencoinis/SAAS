'use client'

import { Download } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import { Subscription } from '@/types/subscription'
import { exportSubscriptionsToCSV } from '@/lib/csv'

interface Props {
  subscriptions: Subscription[]
}

export default function CsvExportButton({ subscriptions }: Props) {
  const { t } = useLanguage()

  function handleExport() {
    const csv = exportSubscriptionsToCSV(subscriptions)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href     = url
    a.download = `optistack-${date}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      disabled={subscriptions.length === 0}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
    >
      <Download className="w-4 h-4" />
      {t('csv_export')}
    </button>
  )
}
