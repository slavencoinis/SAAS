'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/LanguageProvider'
import { useBudget, saveBudget } from '@/hooks/useBudget'
import { isDemoMode } from '@/lib/demo'
import { createClient } from '@/lib/supabase/client'
import { Settings, DollarSign, Mail, FlaskConical } from 'lucide-react'

// ─── Budget section ───────────────────────────────────────────────────────────

function BudgetSection() {
  const { t }                   = useLanguage()
  const { data: settings }      = useBudget()
  const [value, setValue]       = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const demo = isDemoMode()

  useEffect(() => {
    if (settings?.monthly_budget != null) {
      setValue(String(settings.monthly_budget))
    }
  }, [settings])

  async function handleSave() {
    setSaveStatus('saving')
    try {
      const num = value === '' ? null : parseFloat(value)
      if (num !== null && (isNaN(num) || num <= 0)) throw new Error('Invalid amount')
      await saveBudget(num)
      setSaveStatus('ok')
    } catch {
      setSaveStatus('error')
    }
    setTimeout(() => setSaveStatus('idle'), 2500)
  }

  const btnLabel =
    saveStatus === 'saving' ? '...' :
    saveStatus === 'ok'     ? t('budget_saved') :
    saveStatus === 'error'  ? t('budget_save_err') :
    t('budget_save')

  const btnCls =
    saveStatus === 'ok'    ? 'bg-green-600 hover:bg-green-700' :
    saveStatus === 'error' ? 'bg-red-600 hover:bg-red-700' :
    'bg-indigo-600 hover:bg-indigo-700'

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-green-50 dark:bg-green-950 p-2 rounded-lg">
          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('settings_budget_section')}</h2>
      </div>

      {demo && (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 flex items-center gap-2">
          <FlaskConical className="w-3.5 h-3.5 shrink-0" />
          {t('settings_demo_note')}
        </p>
      )}

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('budget_label')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            <input
              type="number"
              min="1"
              step="1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('budget_placeholder')}
              className="w-full pl-7 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {value === '' && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('budget_no_limit')}</p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${btnCls}`}
        >
          {btnLabel}
        </button>
      </div>
    </div>
  )
}

// ─── Email section ────────────────────────────────────────────────────────────

function EmailSection() {
  const { t } = useLanguage()
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const demo = isDemoMode()

  async function handleTestEmail() {
    if (demo) {
      setStatus('ok')
      setTimeout(() => setStatus('idle'), 2500)
      return
    }

    setStatus('sending')
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not logged in')

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-renewal-reminders`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: session.user.id, test: true }),
        }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('ok')
    } catch {
      setStatus('error')
    }
    setTimeout(() => setStatus('idle'), 3000)
  }

  const btnLabel =
    status === 'sending' ? t('settings_test_email_sending') :
    status === 'ok'      ? t('settings_test_email_ok') :
    status === 'error'   ? t('settings_test_email_err') :
    t('settings_test_email')

  const btnCls =
    status === 'ok'    ? 'bg-green-600 hover:bg-green-700 text-white' :
    status === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
    'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-50 dark:bg-indigo-950 p-2 rounded-lg">
          <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('settings_email_section')}</h2>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        {/* Short info about what the reminders do */}
        {t('settings_email_reminder_desc')}
      </p>

      <button
        onClick={handleTestEmail}
        disabled={status === 'sending'}
        className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${btnCls}`}
      >
        <Mail className="w-4 h-4" />
        {btnLabel}
        {demo && <span className="text-xs opacity-60">({t('demo_btn_sub')})</span>}
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { t } = useLanguage()

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings_title')}</h1>
        </div>
      </div>

      <BudgetSection />
      <EmailSection />
    </div>
  )
}
