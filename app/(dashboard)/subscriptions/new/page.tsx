'use client'

import SubscriptionForm from '@/components/SubscriptionForm'

export default function NewSubscriptionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dodaj servis</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Unesi podatke o novom SaaS servisu</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <SubscriptionForm />
      </div>
    </div>
  )
}
