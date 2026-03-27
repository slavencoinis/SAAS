'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FlaskConical, X } from 'lucide-react'
import { isDemoMode, disableDemoMode } from '@/lib/demo'
import { useLanguage } from '@/components/LanguageProvider'

export default function DemoBanner() {
  const [show, setShow] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    setShow(isDemoMode())
  }, [])

  if (!show) return null

  const handleExit = () => {
    disableDemoMode()
    router.push('/login')
  }

  return (
    <div className="w-full bg-amber-500 dark:bg-amber-600 text-white px-4 py-2 flex items-center justify-between gap-4 text-sm shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <FlaskConical className="w-4 h-4 shrink-0" />
        <span className="truncate font-medium">{t('demo_banner')}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/signup"
          onClick={disableDemoMode}
          className="px-3 py-1 bg-white text-amber-600 dark:text-amber-700 text-xs font-semibold rounded-md hover:bg-amber-50 transition-colors"
        >
          {t('demo_create_account')}
        </Link>
        <button
          onClick={handleExit}
          className="flex items-center gap-1 px-3 py-1 bg-amber-600 dark:bg-amber-700 text-white text-xs font-semibold rounded-md hover:bg-amber-700 dark:hover:bg-amber-800 transition-colors"
        >
          <X className="w-3 h-3" />
          {t('demo_exit')}
        </button>
      </div>
    </div>
  )
}
