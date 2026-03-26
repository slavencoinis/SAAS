'use client'

import useSWR, { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { Subscription } from '@/types/subscription'

const KEY = 'subscriptions'

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchSubscriptions(): Promise<Subscription[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('renewal_date', { ascending: true })

  return data ?? []
}

async function fetchSubscription(id: string): Promise<Subscription | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  return data ?? null
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Sve pretplate — cache-ovano, nakon prvog učitavanja instant.
 * Ekvivalent Firebase onSnapshot ali pull-based.
 */
export function useSubscriptions() {
  return useSWR<Subscription[]>(KEY, fetchSubscriptions, {
    revalidateOnFocus: false,       // ne refetcha kad se vrati u tab
    revalidateOnReconnect: true,    // refetcha kad se vrati internet
    dedupingInterval: 5000,         // 5s window — dupli pozivi koriste cache
  })
}

/**
 * Jedna pretplata po ID-u — gleda prvo u lokalni cache liste, pa fetcha ako nema.
 */
export function useSubscription(id: string) {
  return useSWR<Subscription | null>(
    id ? `subscription-${id}` : null,
    () => fetchSubscription(id),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )
}

/**
 * Invalidira cache — pozovi nakon insert/update/delete
 * da se podaci osvježe bez page reloada.
 */
export function invalidateSubscriptions() {
  mutate(KEY)
  mutate((key: string) => typeof key === 'string' && key.startsWith('subscription-'), undefined, { revalidate: true })
}
