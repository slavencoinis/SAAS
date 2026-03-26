export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'one-time'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'trial' | 'overlimit'
export type UsageStatus = 'high' | 'medium' | 'low' | 'unused' | 'underutilized'
export type Category =
  | 'productivity'
  | 'development'
  | 'design'
  | 'marketing'
  | 'communication'
  | 'storage'
  | 'other'

export interface Subscription {
  id: string
  user_id: string
  name: string
  description: string | null
  url: string | null
  price: number
  currency: string
  billing_cycle: BillingCycle
  start_date: string | null
  renewal_date: string | null
  status: SubscriptionStatus
  usage_status: UsageStatus
  category: Category | null
  notes: string | null
  api_key_linked: boolean | null
  created_at: string
  updated_at: string
}

export type SubscriptionInsert = Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>
