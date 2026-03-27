'use client'

import useSWR, { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { isDemoMode } from '@/lib/demo'

const KEY = 'user-settings'

const DEMO_BUDGET = 300

export interface UserSettings {
  monthly_budget: number | null
}

async function fetchSettings(): Promise<UserSettings> {
  if (isDemoMode()) return { monthly_budget: DEMO_BUDGET }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { monthly_budget: null }

  const { data } = await supabase
    .from('user_settings')
    .select('monthly_budget')
    .eq('user_id', user.id)
    .maybeSingle()

  return { monthly_budget: data?.monthly_budget ?? null }
}

export function useBudget() {
  return useSWR<UserSettings>(KEY, fetchSettings, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  })
}

export async function saveBudget(amount: number | null): Promise<void> {
  if (isDemoMode()) {
    mutate(KEY, { monthly_budget: amount }, false)
    return
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: user.id, monthly_budget: amount }, { onConflict: 'user_id' })

  if (error) throw new Error(error.message)
  mutate(KEY)
}
