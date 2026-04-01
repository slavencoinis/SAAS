'use server'

import { createClient } from '@/lib/supabase/server'
import { simulateGoogleWorkspaceApi, isGoogleWorkspaceSubscription, GoogleWorkspaceUsageData } from '@/lib/integrations/google/checkWorkspace'

export interface GoogleCheckResult {
  checked: GoogleWorkspaceUsageData[]
  markedUnderutilized: number
  noSubscriptionsFound: boolean
  error?: string
}

export async function runGoogleWorkspaceCheck(): Promise<GoogleCheckResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { checked: [], markedUnderutilized: 0, noSubscriptionsFound: false, error: 'Nisi prijavljen.' }

  const { data: subs, error: fetchError } = await supabase
    .from('subscriptions')
    .select('id, name, status')
    .eq('user_id', user.id)
    .neq('status', 'cancelled')

  if (fetchError) return { checked: [], markedUnderutilized: 0, noSubscriptionsFound: false, error: fetchError.message }

  const googleSubs = (subs ?? []).filter((s) => isGoogleWorkspaceSubscription(s.name))
  if (googleSubs.length === 0) return { checked: [], markedUnderutilized: 0, noSubscriptionsFound: true }

  const results: GoogleWorkspaceUsageData[] = []
  let markedCount = 0

  for (const sub of googleSubs) {
    const usage = simulateGoogleWorkspaceApi(sub.id, sub.name)
    results.push(usage)

    if (usage.isUnderutilized) {
      const { error } = await supabase
        .from('subscriptions')
        .update({ usage_status: 'underutilized' })
        .eq('id', sub.id)
        .eq('user_id', user.id)
      if (!error) markedCount++
    }
  }

  return { checked: results, markedUnderutilized: markedCount, noSubscriptionsFound: false }
}
