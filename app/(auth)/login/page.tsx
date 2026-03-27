'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Layers, FlaskConical } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import { enableDemoMode } from '@/lib/demo'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDemo = () => {
    enableDemoMode()
    router.push('/dashboard')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(t('login_error'))
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const inputCls = [
    'w-full px-3 py-2 rounded-lg text-sm',
    'border border-gray-300 dark:border-gray-600',
    'bg-white dark:bg-gray-800',
    'text-gray-900 dark:text-gray-100',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500',
  ].join(' ')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <Layers className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SaaS Manager</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('login_subtitle')}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login_password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? t('login_loading') : t('login_btn')}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={handleDemo}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            >
              <FlaskConical className="w-4 h-4" />
              <span>{t('demo_btn')}</span>
              <span className="text-xs text-indigo-400 dark:text-indigo-500">— {t('demo_btn_sub')}</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            {t('login_no_account')}{' '}
            <Link href="/signup" className="text-indigo-500 font-medium hover:underline">
              {t('login_register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
