/**
 * GitHub Copilot Usage Simulator
 *
 * Simulates what a real GitHub Copilot Billing API call would return —
 * specifically seat assignments (active vs total) and daily active users.
 *
 * Real endpoint (requires manage_billing:copilot OAuth scope):
 *   GET https://api.github.com/orgs/{org}/copilot/billing/seats
 *   GET https://api.github.com/orgs/{org}/copilot/usage
 *   Authorization: Bearer {GITHUB_TOKEN}
 *
 * Replace `simulateGitHubCopilotApi` body with a real fetch() once you have
 * a GitHub token with the manage_billing:copilot scope.
 */

export const UNDERUTILIZED_THRESHOLD_PERCENT = 50 // flag when < 50 % of seats active

export interface GitHubCopilotUsageData {
  subscriptionId: string
  subscriptionName: string
  totalSeats: number
  activeSeats: number      // seats used in last 30 days
  pendingCancellation: number
  activePercent: number    // 0–100
  isUnderutilized: boolean
  costPerSeat: number      // USD/month
  estimatedWasteUSD: number
  simulatedAt: Date
}

/**
 * Deterministically generates mock Copilot seat data from the subscription UUID.
 * Replace this function body with a real API call when ready.
 */
export function simulateGitHubCopilotApi(
  subscriptionId: string,
  subscriptionName: string,
): GitHubCopilotUsageData {
  const seed = subscriptionId
    .replace(/-/g, '')
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

  const totalSeats = 5 + (seed % 20)               // 5–24 seats
  const activeSeats = Math.max(1, Math.floor(totalSeats * (0.3 + (seed % 60) / 100)))
  const pendingCancellation = (seed % 3 === 0) ? 1 : 0
  const activePercent = Math.round((activeSeats / totalSeats) * 100)
  const costPerSeat = 19                             // $19/seat/month (Copilot Business)
  const inactiveSeats = totalSeats - activeSeats
  const estimatedWasteUSD = inactiveSeats * costPerSeat

  return {
    subscriptionId,
    subscriptionName,
    totalSeats,
    activeSeats,
    pendingCancellation,
    activePercent,
    isUnderutilized: activePercent < UNDERUTILIZED_THRESHOLD_PERCENT,
    costPerSeat,
    estimatedWasteUSD,
    simulatedAt: new Date(),
  }
}

export const GITHUB_COPILOT_KEYWORDS = [
  'github',
  'copilot',
  'github copilot',
  'gh copilot',
]

export function isGitHubCopilotSubscription(name: string): boolean {
  const lower = name.toLowerCase()
  return GITHUB_COPILOT_KEYWORDS.some((kw) => lower.includes(kw))
}
