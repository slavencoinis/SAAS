'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { invalidateSubscriptions } from '@/hooks/useSubscriptions'
import { useLanguage } from '@/components/LanguageProvider'

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  const handleDelete = async () => {
    if (!confirm(`${t('delete_confirm')} "${name}"?`)) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('subscriptions').delete().eq('id', id)
    invalidateSubscriptions()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 hover:underline disabled:opacity-50"
    >
      {loading ? '...' : t('delete_btn')}
    </button>
  )
}
