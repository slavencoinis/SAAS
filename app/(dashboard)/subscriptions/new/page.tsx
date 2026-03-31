'use client'

import SubscriptionForm from '@/components/SubscriptionForm'
import { useLanguage } from '@/components/LanguageProvider'

export default function NewSubscriptionPage() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('page_new_title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('page_new_subtitle')}</p>
      </div>
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--card)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <SubscriptionForm />
      </div>
    </div>
  )
}
