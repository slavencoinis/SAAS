/**
 * AWS Cost Explorer Simulator
 *
 * Simulates what the AWS Cost Explorer API would return — specifically
 * current month spend, previous month comparison, and top service costs.
 *
 * Real endpoint (AWS SDK v3):
 *   import { CostExplorerClient, GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer"
 *   const client = new CostExplorerClient({
 *     region: "us-east-1",
 *     credentials: { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY }
 *   })
 *
 * Replace `simulateAWSCostExplorer` body with a real AWS SDK call once
 * credentials are configured as environment variables.
 */

export const BUDGET_INCREASE_THRESHOLD_PERCENT = 20 // flag when spend up >20% vs last month

export interface AWSServiceCost {
  serviceName: string
  currentMonthUSD: number
  previousMonthUSD: number
  changePercent: number
}

export interface AWSCostData {
  subscriptionId: string
  subscriptionName: string
  currentMonthUSD: number
  previousMonthUSD: number
  monthOverMonthChange: number   // percent, can be negative
  isOverBudget: boolean          // true if >20% increase vs prior month
  topServices: AWSServiceCost[]
  forecastedMonthUSD: number
  simulatedAt: Date
}

const AWS_SERVICES = [
  'EC2', 'S3', 'RDS', 'Lambda', 'CloudFront',
  'ECS', 'EKS', 'DynamoDB', 'SQS', 'API Gateway',
]

/**
 * Deterministically generates mock AWS cost data from the subscription UUID.
 * Replace this function body with real AWS SDK calls when ready.
 */
export function simulateAWSCostExplorer(
  subscriptionId: string,
  subscriptionName: string,
): AWSCostData {
  const seed = subscriptionId
    .replace(/-/g, '')
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

  const baseMonthly = 50 + (seed % 450)             // $50–$500/month base
  const changePercent = -15 + (seed % 50)           // -15% to +35% change
  const currentMonthUSD = parseFloat((baseMonthly * (1 + changePercent / 100)).toFixed(2))
  const previousMonthUSD = parseFloat(baseMonthly.toFixed(2))
  const forecastedMonthUSD = parseFloat((currentMonthUSD * 1.05).toFixed(2))

  // Pick 3 top services deterministically
  const serviceCount = 3
  const topServices: AWSServiceCost[] = Array.from({ length: serviceCount }, (_, i) => {
    const svc = AWS_SERVICES[(seed + i * 3) % AWS_SERVICES.length]
    const portion = [0.45, 0.30, 0.15][i]
    const svcCurrent = parseFloat((currentMonthUSD * portion).toFixed(2))
    const svcPrev = parseFloat((previousMonthUSD * portion).toFixed(2))
    const svcChange = parseFloat(((svcCurrent - svcPrev) / svcPrev * 100).toFixed(1))
    return { serviceName: svc, currentMonthUSD: svcCurrent, previousMonthUSD: svcPrev, changePercent: svcChange }
  })

  return {
    subscriptionId,
    subscriptionName,
    currentMonthUSD,
    previousMonthUSD,
    monthOverMonthChange: parseFloat(changePercent.toFixed(1)),
    isOverBudget: changePercent > BUDGET_INCREASE_THRESHOLD_PERCENT,
    topServices,
    forecastedMonthUSD,
    simulatedAt: new Date(),
  }
}

export const AWS_KEYWORDS = ['aws', 'amazon web services', 'amazon aws', 'ec2', 's3']

export function isAWSSubscription(name: string): boolean {
  const lower = name.toLowerCase()
  return AWS_KEYWORDS.some((kw) => lower.includes(kw))
}
