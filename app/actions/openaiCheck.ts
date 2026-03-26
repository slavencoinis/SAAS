'use server'

import { createClient } from '@/lib/supabase/server'
import {
  simulateOpenAIUsageApi,
  isOpenAISubscription,
  OpenAIUsageData,
} from '@/lib/integrations/openai/checkUsage'

export interface OpenAICheckResult {
  checked: OpenAIUsageData[]
  markedOverlimit: number
  noSubscriptionsFound: boolean
  error?: string
}

/**
 * Server action — finds all OpenAI/GPT subscriptions for the authenticated user,
 * runs the simulated usage check, and updates status to 'overlimit' in Supabase
 * for any subscription whose usage exceeds the 80 % threshold.
 */
export async function runOpenAIUsageCheck(): Promise<OpenAICheckResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      checked: [],
      markedOverlimit: 0,
      noSubscriptionsFound: false,
      error: 'Nisi prijavljen.',
    }
  }

  const { data: subs, error: fetchError } = await supabase
    .from('subscriptions')
    .select('id, name, status')
    .eq('user_id', user.id)
    .neq('status', 'cancelled')

  if (fetchError) {
    return {
      checked: [],
      markedOverlimit: 0,
      noSubscriptionsFound: false,
      error: fetchError.message,
    }
  }

  const openaiSubs = (subs ?? []).filter((s) => isOpenAISubscription(s.name))

  if (openaiSubs.length === 0) {
    return { checked: [], markedOverlimit: 0, noSubscriptionsFound: true }
  }

  const results: OpenAIUsageData[] = []
  let markedCount = 0

  for (const sub of openaiSubs) {
    const usage = simulateOpenAIUsageApi(sub.id, sub.name)
    results.push(usage)

    if (usage.isOverLimit) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ status: 'overlimit' })
        .eq('id', sub.id)
        .eq('user_id', user.id)

      if (!updateError) markedCount++
    }
  }

  return {
    checked: results,
    markedOverlimit: markedCount,
    noSubscriptionsFound: false,
  }
}
