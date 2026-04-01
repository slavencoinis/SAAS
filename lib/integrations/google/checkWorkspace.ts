/**
 * Google Workspace Usage Simulator
 *
 * Simulates what the Google Workspace Admin SDK would return — specifically
 * active users vs total licensed users, and storage utilisation.
 *
 * Real endpoint (Google Admin SDK):
 *   GET https://admin.googleapis.com/admin/directory/v1/users?domain={domain}&maxResults=500
 *   GET https://admin.googleapis.com/admin/reports/v1/usage/users/all/dates/{date}
 *   Authorization: Bearer {GOOGLE_OAUTH_TOKEN}  (scope: admin.directory.user.readonly)
 *
 * Replace `simulateGoogleWorkspaceApi` body with a real fetch() once
 * a service account or OAuth token is configured.
 */

export const INACTIVE_THRESHOLD_DAYS = 30    // flag users not logged in for 30+ days
export const UNDERUTILIZED_THRESHOLD = 50    // flag when < 50 % of users active

export interface GoogleWorkspaceUsageData {
  subscriptionId: string
  subscriptionName: string
  totalLicenses: number
  activeUsers: number        // logged in within last 30 days
  inactiveUsers: number
  activePercent: number      // 0–100
  isUnderutilized: boolean
  storageUsedGB: number
  storageLimitGB: number
  storagePercent: number
  plan: 'Business Starter' | 'Business Standard' | 'Business Plus' | 'Enterprise'
  costPerUser: number        // USD/month
  estimatedWasteUSD: number
  simulatedAt: Date
}

/**
 * Deterministically generates mock Google Workspace data from the subscription UUID.
 * Replace this function body with real Admin SDK calls when ready.
 */
export function simulateGoogleWorkspaceApi(
  subscriptionId: string,
  subscriptionName: string,
): GoogleWorkspaceUsageData {
  const seed = subscriptionId
    .replace(/-/g, '')
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

  const plans = ['Business Starter', 'Business Standard', 'Business Plus', 'Enterprise'] as const
  const plan = plans[seed % 4]
  const costPerUser = ({ 'Business Starter': 6, 'Business Standard': 12, 'Business Plus': 18, 'Enterprise': 30 })[plan]

  const totalLicenses = 5 + (seed % 30)
  const activeUsers = Math.max(1, Math.floor(totalLicenses * (0.35 + (seed % 50) / 100)))
  const inactiveUsers = totalLicenses - activeUsers
  const activePercent = Math.round((activeUsers / totalLicenses) * 100)

  const storageLimitGB = totalLicenses * (plan === 'Business Starter' ? 30 : plan === 'Business Standard' ? 204 : 500)
  const storageUsedGB = Math.floor(storageLimitGB * (0.15 + (seed % 50) / 100))
  const storagePercent = Math.round((storageUsedGB / storageLimitGB) * 100)

  const estimatedWasteUSD = parseFloat((inactiveUsers * costPerUser).toFixed(2))

  return {
    subscriptionId,
    subscriptionName,
    totalLicenses,
    activeUsers,
    inactiveUsers,
    activePercent,
    isUnderutilized: activePercent < UNDERUTILIZED_THRESHOLD,
    storageUsedGB,
    storageLimitGB,
    storagePercent,
    plan,
    costPerUser,
    estimatedWasteUSD,
    simulatedAt: new Date(),
  }
}

export const GOOGLE_WORKSPACE_KEYWORDS = [
  'google workspace',
  'gsuite',
  'g suite',
  'google apps',
  'workspace',
]

export function isGoogleWorkspaceSubscription(name: string): boolean {
  const lower = name.toLowerCase()
  return GOOGLE_WORKSPACE_KEYWORDS.some((kw) => lower.includes(kw))
}
