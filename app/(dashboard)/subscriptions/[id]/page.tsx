'use client'

import { useSubscription } from '@/hooks/useSubscriptions'
import SubscriptionForm from '@/components/SubscriptionForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { use } from 'react'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-3 w-12 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-36 rounded-lg bg-indigo-100 dark:bg-indigo-900/40" />
        <div className="h-10 w-24 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: subscription, isLoading } = useSubscription(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/subscriptions"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Uredi servis</h1>
          {subscription && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{subscription.name}</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <FormSkeleton />
      ) : !subscription ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-400 dark:text-gray-500 mb-4">Servis nije pronađen.</p>
          <Link href="/subscriptions" className="text-sm text-indigo-500 hover:underline">
            Nazad na listu
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <SubscriptionForm subscription={subscription} />
        </div>
      )}
    </div>
  )
}
