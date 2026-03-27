'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import { parseSubscriptionsFromCSV } from '@/lib/csv'
import { isDemoMode } from '@/lib/demo'
import { demoAddSubscription, invalidateSubscriptions } from '@/hooks/useSubscriptions'
import { createClient } from '@/lib/supabase/client'
import { Subscription } from '@/types/subscription'

export default function CsvImportButton() {
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'importing' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setStatus('importing')
    setMessage('')

    try {
      const text = await file.text()
      const { rows, errors } = parseSubscriptionsFromCSV(text)

      if (errors.length > 0 && rows.length === 0) {
        setStatus('error')
        setMessage(errors[0])
        return
      }

      if (isDemoMode()) {
        rows.forEach((row) => {
          const sub: Subscription = {
            ...row,
            id:         crypto.randomUUID(),
            user_id:    'demo',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          demoAddSubscription(sub)
        })
        setStatus('ok')
        setMessage(`${rows.length} ${t('csv_import_ok')} · ${t('csv_import_demo')}`)
      } else {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error(t('not_logged_in'))

        // Chunk into 200-row batches
        for (let i = 0; i < rows.length; i += 200) {
          const chunk = rows.slice(i, i + 200).map((r) => ({ ...r, user_id: user.id }))
          const { error } = await supabase.from('subscriptions').insert(chunk)
          if (error) throw new Error(error.message)
        }

        invalidateSubscriptions()
        setStatus('ok')
        setMessage(`${rows.length} ${t('csv_import_ok')}`)
      }
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : t('csv_import_err'))
    }

    // Auto-reset after 4s
    setTimeout(() => { setStatus('idle'); setMessage('') }, 4000)
  }

  const label =
    status === 'importing' ? t('csv_importing') :
    status === 'ok'        ? message :
    status === 'error'     ? (message || t('csv_import_err')) :
    t('csv_import')

  const cls =
    status === 'ok'    ? 'border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20' :
    status === 'error' ? 'border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20' :
    'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={status === 'importing'}
        className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border disabled:opacity-40 transition-colors max-w-[220px] truncate ${cls}`}
        title={status === 'error' ? message : undefined}
      >
        <Upload className="w-4 h-4 shrink-0" />
        <span className="truncate">{label}</span>
      </button>
    </>
  )
}
