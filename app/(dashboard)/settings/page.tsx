'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/LanguageProvider'
import { useBudget, saveBudget } from '@/hooks/useBudget'
import { isDemoMode } from '@/lib/demo'
import { createClient } from '@/lib/supabase/client'
import { Settings, DollarSign, Mail, FlaskConical } from 'lucide-react'

const card = {
  background: 'var(--card)',
  border: '1px solid var(--card-border)',
  boxShadow: 'var(--shadow-sm)',
}

// ─── Budget section ───────────────────────────────────────────────────────────

function BudgetSection() {
  const { t }                       = useLanguage()
  const { data: settings }          = useBudget()
  const [value, setValue]           = useState('')
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
    saveStatus === 'ok'    ? 'bg-emerald-600 hover:bg-emerald-700' :
    saveStatus === 'error' ? 'bg-rose-600 hover:bg-rose-700' :
    'bg-indigo-600 hover:bg-indigo-700'

  return (
    <div className="rounded-2xl p-6 space-y-4" style={card}>
      <div className="flex items-center gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-2.5 rounded-xl">
          <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>{t('settings_budget_section')}</h2>
      </div>

      {demo && (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <FlaskConical className="w-3.5 h-3.5 shrink-0" />
          {t('settings_demo_note')}
        </p>
      )}

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted)' }}>
            {t('budget_label')}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted)' }}>€</span>
            <input
              type="number"
              min="1"
              step="1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('budget_placeholder')}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
            />
          </div>
          {value === '' && (
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{t('budget_no_limit')}</p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 ${btnCls}`}
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
    status === 'ok'    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
    status === 'error' ? 'bg-rose-600 hover:bg-rose-700 text-white' :
    'hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium'

  return (
    <div className="rounded-2xl p-6 space-y-4" style={card}>
      <div className="flex items-center gap-3">
        <div className="bg-indigo-50 dark:bg-indigo-500/10 p-2.5 rounded-xl">
          <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>{t('settings_email_section')}</h2>
      </div>

      <p className="text-sm" style={{ color: 'var(--muted)' }}>
        {t('settings_email_reminder_desc')}
      </p>

      <button
        onClick={handleTestEmail}
        disabled={status === 'sending'}
        className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${btnCls}`}
        style={!['ok', 'error'].includes(status) ? { border: '1px solid var(--card-border)', color: 'var(--foreground)' } : {}}
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
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings className="w-5 h-5" style={{ color: 'var(--muted)' }} />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{t('settings_title')}</h1>
      </div>

      <BudgetSection />
      <EmailSection />
    </div>
  )
}
