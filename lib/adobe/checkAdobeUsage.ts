/**
 * Adobe Creative Cloud Usage Simulator
 *
 * Simulates what a real Adobe CC API call would return — specifically
 * the last time a given application (e.g. Photoshop) was opened by the user.
 *
 * Real endpoint would look like:
 *   GET https://cc-api-adobe.io/v1/apps/usage?app=photoshop&userId={uid}
 *   Authorization: Bearer {adobeOAuthToken}
 */

export const UNDERUTILIZED_THRESHOLD_DAYS = 15

export interface AdobeAppUsage {
  subscriptionId: string
  subscriptionName: string
  appName: string
  lastOpened: Date
  daysSinceLastUse: number
  isUnderutilized: boolean
  simulatedAt: Date
}

/**
 * Deterministically generates a "last opened" date from the subscription ID
 * so the same subscription always returns the same simulated result within
 * a single session (makes demo behaviour predictable).
 *
 * Replace this function body with a real fetch() call when Adobe OAuth
 * credentials are available.
 */
export function simulateAdobeApiCall(
  subscriptionId: string,
  subscriptionName: string,
  appName: string = 'Photoshop'
): AdobeAppUsage {
  // Derive a stable pseudo-random number from the subscription UUID
  const seed = subscriptionId
    .replace(/-/g, '')
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

  // Spread results across 1–28 days ago so demos show both outcomes
  const daysAgo = (seed % 28) + 1

  const lastOpened = new Date()
  lastOpened.setDate(lastOpened.getDate() - daysAgo)
  lastOpened.setHours(8 + (seed % 10), seed % 60, 0, 0) // realistic work-hour timestamp

  return {
    subscriptionId,
    subscriptionName,
    appName,
    lastOpened,
    daysSinceLastUse: daysAgo,
    isUnderutilized: daysAgo > UNDERUTILIZED_THRESHOLD_DAYS,
    simulatedAt: new Date(),
  }
}

/** Names that are considered Adobe / Creative Cloud subscriptions */
export const ADOBE_KEYWORDS = [
  'adobe',
  'photoshop',
  'illustrator',
  'premiere',
  'after effects',
  'indesign',
  'lightroom',
  'acrobat',
  'creative cloud',
]

export function isAdobeSubscription(name: string): boolean {
  const lower = name.toLowerCase()
  return ADOBE_KEYWORDS.some((kw) => lower.includes(kw))
}
