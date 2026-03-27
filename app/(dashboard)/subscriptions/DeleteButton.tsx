'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { invalidateSubscriptions, demoDeleteSubscription } from '@/hooks/useSubscriptions'
import { useLanguage } from '@/components/LanguageProvider'
import { isDemoMode } from '@/lib/demo'

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  const handleDelete = async () => {
    if (!confirm(`${t('delete_confirm')} "${name}"?`)) return
    setLoading(true)
    setError('')

    if (isDemoMode()) {
      demoDeleteSubscription(id)
      return
    }

    const supabase = createClient()
    const { error: deleteError } = await supabase.from('subscriptions').delete().eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      setLoading(false)
      return
    }

    invalidateSubscriptions()
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs text-red-500 hover:underline disabled:opacity-50"
      >
        {loading ? '...' : t('delete_btn')}
      </button>
      {error && (
        <span className="text-xs text-red-600 mt-0.5">{error}</span>
      )}
    </span>
  )
}
