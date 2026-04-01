'use server'

import { createClient } from '@/lib/supabase/server'
import { simulateSlackApi, isSlackSubscription, SlackUsageData } from '@/lib/integrations/slack/checkUsage'

export interface SlackCheckResult {
  checked: SlackUsageData[]
  markedUnderutilized: number
  noSubscriptionsFound: boolean
  error?: string
}

export async function runSlackUsageCheck(): Promise<SlackCheckResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { checked: [], markedUnderutilized: 0, noSubscriptionsFound: false, error: 'Nisi prijavljen.' }

  const { data: subs, error: fetchError } = await supabase
    .from('subscriptions')
    .select('id, name, status')
    .eq('user_id', user.id)
    .neq('status', 'cancelled')

  if (fetchError) return { checked: [], markedUnderutilized: 0, noSubscriptionsFound: false, error: fetchError.message }

  const slackSubs = (subs ?? []).filter((s) => isSlackSubscription(s.name))
  if (slackSubs.length === 0) return { checked: [], markedUnderutilized: 0, noSubscriptionsFound: true }

  const results: SlackUsageData[] = []
  let markedCount = 0

  for (const sub of slackSubs) {
    const usage = simulateSlackApi(sub.id, sub.name)
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
