'use server'

import { createClient } from '@/lib/supabase/server'
import { simulateAdobeApiCall, isAdobeSubscription, AdobeAppUsage } from '@/lib/adobe/checkAdobeUsage'

export interface AdobeCheckResult {
  checked: AdobeAppUsage[]
  markedUnderutilized: number
  noSubscriptionsFound: boolean
  error?: string
}

export async function runAdobeUsageCheck(): Promise<AdobeCheckResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { checked: [], markedUnderutilized: 0, noSubscriptionsFound: false, error: 'Nisi prijavljen.' }
  }

  // Fetch all active subscriptions for this user
  const { data: subs, error: fetchError } = await supabase
    .from('subscriptions')
    .select('id, name, status')
    .eq('user_id', user.id)
    .neq('status', 'cancelled')

  if (fetchError) {
    return { checked: [], markedUnderutilized: 0, noSubscriptionsFound: false, error: fetchError.message }
  }

  // Filter to Adobe/Photoshop subscriptions
  const adobeSubs = (subs ?? []).filter((s) => isAdobeSubscription(s.name))

  if (adobeSubs.length === 0) {
    return { checked: [], markedUnderutilized: 0, noSubscriptionsFound: true }
  }

  const results: AdobeAppUsage[] = []
  let markedCount = 0

  for (const sub of adobeSubs) {
    // Simulate the Adobe CC API call
    const usage = simulateAdobeApiCall(sub.id, sub.name, 'Photoshop')
    results.push(usage)

    if (usage.isUnderutilized) {
      // Update usage_status to 'underutilized' in Supabase
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ usage_status: 'underutilized' })
        .eq('id', sub.id)
        .eq('user_id', user.id)

      if (!updateError) {
        markedCount++
      }
    }
  }

  return {
    checked: results,
    markedUnderutilized: markedCount,
    noSubscriptionsFound: false,
  }
}
