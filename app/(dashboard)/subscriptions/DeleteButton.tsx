'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { invalidateSubscriptions } from '@/hooks/useSubscriptions'

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Obrisi pretplatu "${name}"?`)) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('subscriptions').delete().eq('id', id)
    invalidateSubscriptions()  // cache se osvježi, red nestaje bez reloada
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 hover:underline disabled:opacity-50"
    >
      {loading ? '...' : 'Obrisi'}
    </button>
  )
}
