/**
 * OpenAI Usage API Simulator
 *
 * Simulates what a real OpenAI Usage API call would return —
 * specifically monthly token consumption vs. the account hard-limit.
 *
 * Real endpoint:
 *   GET https://api.openai.com/v1/usage?date=YYYY-MM-DD
 *   Authorization: Bearer {OPENAI_API_KEY}
 *
 * Real billing/limits endpoint (admin key required):
 *   GET https://api.openai.com/v1/organization/costs
 *   GET https://api.openai.com/dashboard/billing/usage
 */

export const OVERLIMIT_THRESHOLD_PERCENT = 80 // flag when usage exceeds 80 %

export interface OpenAIUsageData {
  subscriptionId: string
  subscriptionName: string
  /** Simulated tokens consumed this billing period */
  currentTokens: number
  /** Simulated hard token limit for this plan */
  limitTokens: number
  /** 0 – 100 */
  usagePercent: number
  isOverLimit: boolean
  /** Estimated USD cost (at $0.002 / 1k tokens — GPT-3.5 baseline) */
  estimatedCostUSD: number
  periodStart: string // YYYY-MM-DD
  periodEnd: string   // YYYY-MM-DD
  simulatedAt: Date
}

/**
 * Deterministically generates mock OpenAI usage from the subscription UUID.
 * Same subscription → same result each session (predictable demo behaviour).
 *
 * Swap this function body for a real fetch() once you have an OpenAI API key.
 */
export function simulateOpenAIUsageApi(
  subscriptionId: string,
  subscriptionName: string
): OpenAIUsageData {
  // Stable pseudo-random seed derived from UUID characters
  const seed = subscriptionId
    .replace(/-/g, '')
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

  const limitTokens = 1_000_000 // 1 M token plan (common Team/API tier)

  // Spread results between 55 % and 98 % so demos show both outcomes
  const usagePercent = 55 + (seed % 44)
  const currentTokens = Math.floor((limitTokens * usagePercent) / 100)
  const estimatedCostUSD = parseFloat(((currentTokens / 1000) * 0.002).toFixed(2))

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0]
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0]

  return {
    subscriptionId,
    subscriptionName,
    currentTokens,
    limitTokens,
    usagePercent,
    isOverLimit: usagePercent >= OVERLIMIT_THRESHOLD_PERCENT,
    estimatedCostUSD,
    periodStart,
    periodEnd,
    simulatedAt: new Date(),
  }
}

/** Keywords that identify an OpenAI / GPT subscription by name */
export const OPENAI_KEYWORDS = [
  'openai',
  'chatgpt',
  'gpt',
  'gpt-4',
  'gpt-3',
  'openai api',
  'openai platform',
]

export function isOpenAISubscription(name: string): boolean {
  const lower = name.toLowerCase()
  return OPENAI_KEYWORDS.some((kw) => lower.includes(kw))
}
