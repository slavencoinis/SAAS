export const unstable_instant = { prefetch: 'static' }

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SubscriptionForm from '@/components/SubscriptionForm'
import { Subscription } from '@/types/subscription'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse space-y-6">
      {/* Row 1: Naziv + URL */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-10 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
      {/* Opis */}
      <div className="space-y-2">
        <div className="h-3 w-12 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
      {/* Row 2: Cijena + Valuta + Ciklus */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
      {/* Row 3: Datumi */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
      {/* Row 4: Status + Usage + Kategorija */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
      {/* Biljeske */}
      <div className="space-y-2">
        <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
      {/* Buttons */}
      <div className="flex gap-3">
        <div className="h-10 w-32 rounded-lg bg-indigo-100 dark:bg-indigo-900/40" />
        <div className="h-10 w-24 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  )
}

// ─── Dynamic content ──────────────────────────────────────────────────────────

async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!data) notFound()

  const subscription = data as Subscription

  return (
    <>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{subscription.name}</p>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <SubscriptionForm subscription={subscription} />
      </div>
    </>
  )
}

// ─── Page shell (renders instantly) ──────────────────────────────────────────

export default function EditSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="space-y-6">
      {/* Static header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Uredi pretplatu</h1>
      </div>

      {/* Form streams in with skeleton */}
      <Suspense fallback={<FormSkeleton />}>
        <EditForm params={params} />
      </Suspense>
    </div>
  )
}
