'use client'

import { useSubscription } from '@/hooks/useSubscriptions'
import { useLanguage } from '@/components/LanguageProvider'
import SubscriptionForm from '@/components/SubscriptionForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { use } from 'react'

const card = {
  background: 'var(--card)',
  border: '1px solid var(--card-border)',
  boxShadow: 'var(--shadow-sm)',
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FormSkeleton() {
  const bone = { background: 'var(--card-border)' }
  return (
    <div className="rounded-2xl p-6 animate-pulse space-y-6" style={card}>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-2.5 w-16 rounded" style={bone} />
            <div className="h-10 rounded-xl" style={bone} />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-12 rounded" style={bone} />
        <div className="h-10 rounded-xl" style={bone} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-2.5 w-16 rounded" style={bone} />
            <div className="h-10 rounded-xl" style={bone} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-2.5 w-24 rounded" style={bone} />
            <div className="h-10 rounded-xl" style={bone} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-2.5 w-16 rounded" style={bone} />
            <div className="h-10 rounded-xl" style={bone} />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-16 rounded" style={bone} />
        <div className="h-24 rounded-xl" style={bone} />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-36 rounded-xl bg-indigo-100 dark:bg-indigo-900/40" />
        <div className="h-10 w-24 rounded-xl" style={bone} />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: subscription, isLoading } = useSubscription(id)
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/subscriptions/${id}`}
          className="p-1.5 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: 'var(--muted)' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{t('page_edit_title')}</h1>
          {subscription && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{subscription.name}</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <FormSkeleton />
      ) : !subscription ? (
        <div className="rounded-2xl p-12 text-center" style={card}>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>{t('service_not_found')}</p>
          <Link href="/subscriptions" className="text-sm text-indigo-500 hover:underline">
            {t('back_to_list')}
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl p-6" style={card}>
          <SubscriptionForm subscription={subscription} />
        </div>
      )}
    </div>
  )
}
