'use server'

import { createClient } from '@/lib/supabase/server'
import { simulateAWSCostExplorer, isAWSSubscription, AWSCostData } from '@/lib/integrations/aws/checkCostExplorer'

export interface AWSCheckResult {
  checked: AWSCostData[]
  markedOverlimit: number
  noSubscriptionsFound: boolean
  error?: string
}

export async function runAWSCostCheck(): Promise<AWSCheckResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { checked: [], markedOverlimit: 0, noSubscriptionsFound: false, error: 'Nisi prijavljen.' }

  const { data: subs, error: fetchError } = await supabase
    .from('subscriptions')
    .select('id, name, status')
    .eq('user_id', user.id)
    .neq('status', 'cancelled')

  if (fetchError) return { checked: [], markedOverlimit: 0, noSubscriptionsFound: false, error: fetchError.message }

  const awsSubs = (subs ?? []).filter((s) => isAWSSubscription(s.name))
  if (awsSubs.length === 0) return { checked: [], markedOverlimit: 0, noSubscriptionsFound: true }

  const results: AWSCostData[] = []
  let markedCount = 0

  for (const sub of awsSubs) {
    const usage = simulateAWSCostExplorer(sub.id, sub.name)
    results.push(usage)

    if (usage.isOverBudget) {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'overlimit' })
        .eq('id', sub.id)
        .eq('user_id', user.id)
      if (!error) markedCount++
    }
  }

  return { checked: results, markedOverlimit: markedCount, noSubscriptionsFound: false }
}
