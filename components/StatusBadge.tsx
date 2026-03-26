'use client'

import Badge from '@/components/ui/Badge'
import { SubscriptionStatus, UsageStatus } from '@/types/subscription'
import { useLanguage } from '@/components/LanguageProvider'

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const { t } = useLanguage()

  const map: Record<SubscriptionStatus, { labelKey: 'status_active' | 'status_trial' | 'status_cancelled' | 'status_inactive' | 'status_overlimit' | 'status_paused'; variant: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'orange' }> = {
    active:    { labelKey: 'status_active',    variant: 'green'  },
    trial:     { labelKey: 'status_trial',     variant: 'blue'   },
    paused:    { labelKey: 'status_paused',    variant: 'yellow' },
    cancelled: { labelKey: 'status_cancelled', variant: 'red'    },
    inactive:  { labelKey: 'status_inactive',  variant: 'yellow' },
    overlimit: { labelKey: 'status_overlimit', variant: 'purple' },
  }
  const { labelKey, variant } = map[status] ?? { labelKey: 'status_active', variant: 'gray' as const }
  return <Badge variant={variant}>{t(labelKey)}</Badge>
}

export function UsageBadge({ usage }: { usage: UsageStatus }) {
  const { t } = useLanguage()

  const map: Record<UsageStatus, { labelKey: 'usage_high' | 'usage_medium' | 'usage_low' | 'usage_unused' | 'usage_underutilized'; variant: 'green' | 'blue' | 'yellow' | 'red' | 'orange' }> = {
    high:          { labelKey: 'usage_high',          variant: 'green'  },
    medium:        { labelKey: 'usage_medium',        variant: 'blue'   },
    low:           { labelKey: 'usage_low',           variant: 'yellow' },
    unused:        { labelKey: 'usage_unused',        variant: 'red'    },
    underutilized: { labelKey: 'usage_underutilized', variant: 'orange' },
  }
  const { labelKey, variant } = map[usage] ?? { labelKey: 'usage_medium', variant: 'gray' as const }
  return <Badge variant={variant}>{t(labelKey)}</Badge>
}
