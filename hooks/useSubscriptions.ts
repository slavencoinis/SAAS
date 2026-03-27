'use client'

import useSWR, { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { Subscription } from '@/types/subscription'
import { isDemoMode } from '@/lib/demo'
import { DEMO_SUBSCRIPTIONS } from '@/lib/demo-data'

const KEY = 'subscriptions'

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchSubscriptions(): Promise<Subscription[]> {
  if (isDemoMode()) return DEMO_SUBSCRIPTIONS

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('renewal_date', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

async function fetchSubscription(id: string): Promise<Subscription | null> {
  if (isDemoMode()) return DEMO_SUBSCRIPTIONS.find(s => s.id === id) ?? null

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data ?? null
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useSubscriptions() {
  return useSWR<Subscription[]>(KEY, fetchSubscriptions, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  })
}

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

// ─── Cache invalidation ────────────────────────────────────────────────────────

export function invalidateSubscriptions() {
  mutate(KEY)
  mutate((key: string) => typeof key === 'string' && key.startsWith('subscription-'), undefined, { revalidate: true })
}

// ─── Demo-mode optimistic mutations (in-memory only, no DB) ──────────────────

export function demoUpdateSubscription(updated: Subscription) {
  mutate(KEY, (current: Subscription[] | undefined) =>
    current?.map(s => s.id === updated.id ? updated : s) ?? [updated], false)
  mutate(`subscription-${updated.id}`, updated, false)
}

export function demoAddSubscription(sub: Subscription) {
  mutate(KEY, (current: Subscription[] | undefined) =>
    [...(current ?? []), sub], false)
}

export function demoDeleteSubscription(id: string) {
  mutate(KEY, (current: Subscription[] | undefined) =>
    current?.filter(s => s.id !== id) ?? [], false)
  mutate(`subscription-${id}`, null, false)
}
