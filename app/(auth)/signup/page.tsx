'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { OptiStackMark } from '@/components/OptiStackLogo'
import { Language } from '@/lib/i18n'
import { useLanguage } from '@/components/LanguageProvider'

export default function SignupPage() {
  const { t, lang, setLang } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMessage(t('signup_success'))
    setLoading(false)
  }

  const inputStyle = {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--input-text)',
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 mb-4">
            <OptiStackMark size={36} />
          </div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Opti<span className="text-indigo-500">Stack</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{t('signup_subtitle')}</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm">
                {message}
              </div>
            )}
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                style={inputStyle}
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted)' }}>{t('login_password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                style={inputStyle}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors mt-1"
            >
              {loading ? t('signup_loading') : t('signup_btn')}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--muted)' }}>
            {t('signup_has_account')}{' '}
            <Link href="/login" className="text-indigo-500 font-semibold hover:underline">
              {t('signup_login')}
            </Link>
          </p>
        </div>

        {/* Language toggle */}
        <div className="flex justify-center mt-6">
          <div className="flex gap-0.5 rounded-xl p-0.5" style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}>
            {(['sr', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  lang === l
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'hover:text-gray-800 dark:hover:text-white'
                }`}
                style={lang !== l ? { color: 'var(--muted)' } : {}}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
