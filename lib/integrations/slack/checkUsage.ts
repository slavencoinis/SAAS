/**
 * Slack Usage Simulator
 *
 * Simulates what a real Slack API call would return — specifically
 * monthly active members vs total licensed seats, and cost per active user.
 *
 * Real endpoints:
 *   POST https://slack.com/api/users.list          (count total members)
 *   POST https://slack.com/api/team.info           (workspace info)
 *   Authorization: Bearer {SLACK_BOT_TOKEN}
 *
 * Note: Slack doesn't expose billing details via public API. Active user data
 * requires users.list with the users:read scope. Billing tier info comes from
 * team.info (plan field).
 *
 * Replace `simulateSlackApi` body with a real fetch() once you have
 * a Slack bot token with users:read scope.
 */

export const UNDERUTILIZED_THRESHOLD_PERCENT = 40 // flag when < 40 % of seats active

export interface SlackUsageData {
  subscriptionId: string
  subscriptionName: string
  totalMembers: number
  activeMembers: number     // members active in last 30 days
  guestMembers: number
  activePercent: number     // 0–100
  isUnderutilized: boolean
  plan: 'Free' | 'Pro' | 'Business+' | 'Enterprise'
  costPerMember: number     // USD/month
  estimatedWasteUSD: number
  simulatedAt: Date
}

/**
 * Deterministically generates mock Slack usage data from the subscription UUID.
 * Replace this function body with a real API call when ready.
 */
export function simulateSlackApi(
  subscriptionId: string,
  subscriptionName: string,
): SlackUsageData {
  const seed = subscriptionId
    .replace(/-/g, '')
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

  const plan = (['Pro', 'Business+', 'Business+', 'Enterprise'] as const)[seed % 4]
  const costPerMember = plan === 'Pro' ? 7.25 : plan === 'Business+' ? 12.50 : 15.00
  const totalMembers = 10 + (seed % 40)
  const guestMembers = seed % 5
  const activeMembers = Math.max(2, Math.floor(totalMembers * (0.25 + (seed % 55) / 100)))
  const activePercent = Math.round((activeMembers / totalMembers) * 100)
  const inactiveMembers = totalMembers - activeMembers
  const estimatedWasteUSD = parseFloat((inactiveMembers * costPerMember).toFixed(2))

  return {
    subscriptionId,
    subscriptionName,
    totalMembers,
    activeMembers,
    guestMembers,
    activePercent,
    isUnderutilized: activePercent < UNDERUTILIZED_THRESHOLD_PERCENT,
    plan,
    costPerMember,
    estimatedWasteUSD,
    simulatedAt: new Date(),
  }
}

export const SLACK_KEYWORDS = ['slack']

export function isSlackSubscription(name: string): boolean {
  return name.toLowerCase().includes('slack')
}
