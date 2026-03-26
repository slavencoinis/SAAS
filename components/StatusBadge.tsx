import Badge from '@/components/ui/Badge'
import { SubscriptionStatus, UsageStatus } from '@/types/subscription'

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const map: Record<SubscriptionStatus, { label: string; variant: 'green' | 'blue' | 'red' | 'yellow' | 'purple' }> = {
    active: { label: 'Aktivna', variant: 'green' },
    trial: { label: 'Trial', variant: 'blue' },
    cancelled: { label: 'Otkazana', variant: 'red' },
    inactive: { label: 'Neaktivna', variant: 'yellow' },
    overlimit: { label: 'Overlimit - Review Needed', variant: 'purple' },
  }
  const { label, variant } = map[status] ?? { label: status, variant: 'gray' as const }
  return <Badge variant={variant}>{label}</Badge>
}

export function UsageBadge({ usage }: { usage: UsageStatus }) {
  const map: Record<UsageStatus, { label: string; variant: 'green' | 'blue' | 'yellow' | 'red' | 'orange' }> = {
    high: { label: 'Visoko', variant: 'green' },
    medium: { label: 'Srednje', variant: 'blue' },
    low: { label: 'Nisko', variant: 'yellow' },
    unused: { label: 'Ne koristi se', variant: 'red' },
    underutilized: { label: 'Underutilized', variant: 'orange' },
  }
  const { label, variant } = map[usage] ?? { label: usage, variant: 'gray' as const }
  return <Badge variant={variant}>{label}</Badge>
}
