'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Subscription, SubscriptionInsert } from '@/types/subscription'
import { invalidateSubscriptions, demoUpdateSubscription, demoAddSubscription } from '@/hooks/useSubscriptions'
import { useLanguage } from '@/components/LanguageProvider'
import { calcNextRenewal, toISODate } from '@/lib/renewalUtils'
import { isDemoMode } from '@/lib/demo'

interface Props {
  subscription?: Subscription
}

const defaultValues: SubscriptionInsert = {
  name: '',
  description: '',
  url: '',
  price: 0,
  currency: 'EUR',
  billing_cycle: 'monthly',
  start_date: '',
  renewal_date: '',
  status: 'active',
  usage_status: 'medium',
  category: 'other',
  notes: '',
  api_key_linked: false,
}

export default function SubscriptionForm({ subscription }: Props) {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<SubscriptionInsert>(
    subscription
      ? {
          name: subscription.name,
          description: subscription.description ?? '',
          url: subscription.url ?? '',
          price: subscription.price,
          currency: subscription.currency,
          billing_cycle: subscription.billing_cycle,
          start_date: subscription.start_date ?? '',
          renewal_date: subscription.renewal_date ?? '',
          status: subscription.status,
          usage_status: subscription.usage_status,
          category: subscription.category ?? 'other',
          notes: subscription.notes ?? '',
          api_key_linked: subscription.api_key_linked ?? false,
        }
      : defaultValues
  )

  // Reset form if we navigate from one subscription's edit page to another
  useEffect(() => {
    if (subscription) {
      setForm({
        name:            subscription.name,
        description:     subscription.description ?? '',
        url:             subscription.url ?? '',
        price:           subscription.price,
        currency:        subscription.currency,
        billing_cycle:   subscription.billing_cycle,
        start_date:      subscription.start_date ?? '',
        renewal_date:    subscription.renewal_date ?? '',
        status:          subscription.status,
        usage_status:    subscription.usage_status,
        category:        subscription.category ?? 'other',
        notes:           subscription.notes ?? '',
        api_key_linked:  subscription.api_key_linked ?? false,
      })
    }
  }, [subscription?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key: keyof SubscriptionInsert, value: string | number | boolean) =>
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // Auto-calculate renewal date when start_date or billing_cycle changes
      if (key === 'start_date' || key === 'billing_cycle') {
        const sd = key === 'start_date' ? (value as string) : prev.start_date
        const bc = key === 'billing_cycle' ? (value as string) : prev.billing_cycle
        if (sd && bc !== 'one-time') {
          const calc = calcNextRenewal(sd, bc)
          if (calc) next.renewal_date = toISODate(calc)
        } else if (bc === 'one-time') {
          next.renewal_date = ''
        }
      }
      return next
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      ...form,
      price: Number(form.price),
      start_date: form.start_date || null,
      renewal_date: form.renewal_date || null,
      description: form.description || null,
      url: form.url || null,
      notes: form.notes || null,
    }

    // ── Demo mode: update in-memory cache, skip DB ──────────────────────────
    if (isDemoMode()) {
      const now = new Date().toISOString()
      if (subscription) {
        demoUpdateSubscription({ ...subscription, ...payload, updated_at: now })
      } else {
        demoAddSubscription({
          ...payload,
          id: `demo-new-${Date.now()}`,
          user_id: 'demo',
          created_at: now,
          updated_at: now,
        } as import('@/types/subscription').Subscription)
      }
      router.push('/subscriptions')
      return
    }

    // ── Real mode: save to Supabase ─────────────────────────────────────────
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError(t('not_logged_in')); setLoading(false); return }

    let err
    if (subscription) {
      const res = await supabase.from('subscriptions').update(payload).eq('id', subscription.id)
      err = res.error
    } else {
      const res = await supabase.from('subscriptions').insert({ ...payload, user_id: user.id })
      err = res.error
    }

    if (err) { setError(err.message); setLoading(false); return }
    invalidateSubscriptions()
    router.push('/subscriptions')
  }

  // ─── Shared class strings ────────────────────────────────────────────────
  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all'
  const inputStyle = {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--input-text)',
  }

  const labelCls = 'block text-[11px] font-semibold uppercase tracking-wide mb-1.5'
  const labelStyle = { color: 'var(--muted)' }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={labelStyle}>{t('form_name')}</label>
          <input
            className={inputCls}
            style={inputStyle}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="npr. GitHub, Figma..."
            required
          />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>{t('form_url')}</label>
          <input
            className={inputCls}
            style={inputStyle}
            value={form.url ?? ''}
            onChange={(e) => set('url', e.target.value)}
            placeholder="https://..."
            type="url"
          />
        </div>
      </div>

      <div>
        <label className={labelCls} style={labelStyle}>{t('form_description')}</label>
        <input
          className={inputCls}
          style={inputStyle}
          value={form.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
          placeholder={t('form_desc_placeholder')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls} style={labelStyle}>{t('form_price')}</label>
          <input
            className={inputCls}
            style={inputStyle}
            value={form.price}
            onChange={(e) => set('price', e.target.value === '' ? 0 : parseFloat(e.target.value))}
            type="number"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>{t('form_currency')}</label>
          <select className={inputCls} style={inputStyle} value={form.currency} onChange={(e) => set('currency', e.target.value)}>
            <option>EUR</option>
            <option>USD</option>
            <option>BAM</option>
            <option>RSD</option>
            <option>GBP</option>
          </select>
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>{t('form_billing_cycle')}</label>
          <select className={inputCls} style={inputStyle} value={form.billing_cycle} onChange={(e) => set('billing_cycle', e.target.value)}>
            <option value="monthly">{t('billing_monthly')}</option>
            <option value="yearly">{t('billing_yearly')}</option>
            <option value="weekly">{t('billing_weekly')}</option>
            <option value="one-time">{t('billing_once')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={labelStyle}>{t('form_start_date')}</label>
          <input
            className={inputCls}
            style={inputStyle}
            value={form.start_date ?? ''}
            onChange={(e) => set('start_date', e.target.value)}
            type="date"
          />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>{t('form_renewal_date')}</label>
          <input
            className={inputCls}
            style={inputStyle}
            value={form.renewal_date ?? ''}
            onChange={(e) => set('renewal_date', e.target.value)}
            type="date"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls} style={labelStyle}>{t('form_status')}</label>
          <select className={inputCls} style={inputStyle} value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="active">{t('status_active')}</option>
            <option value="trial">{t('status_trial')}</option>
            <option value="paused">{t('status_paused')}</option>
            <option value="cancelled">{t('status_cancelled')}</option>
            <option value="overlimit">{t('status_overlimit')}</option>
          </select>
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>{t('form_usage_status')}</label>
          <select className={inputCls} style={inputStyle} value={form.usage_status} onChange={(e) => set('usage_status', e.target.value)}>
            <option value="high">{t('usage_high')}</option>
            <option value="medium">{t('usage_medium')}</option>
            <option value="low">{t('usage_low')}</option>
            <option value="unused">{t('usage_unused')}</option>
            <option value="underutilized">{t('usage_underutilized')}</option>
          </select>
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>{t('form_category')}</label>
          <select className={inputCls} style={inputStyle} value={form.category ?? 'other'} onChange={(e) => set('category', e.target.value)}>
            <option value="productivity">{t('cat_productivity')}</option>
            <option value="development">{t('cat_development')}</option>
            <option value="design">{t('cat_design')}</option>
            <option value="marketing">{t('cat_marketing')}</option>
            <option value="communication">{t('cat_communication')}</option>
            <option value="storage">{t('cat_storage')}</option>
            <option value="other">{t('cat_other')}</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls} style={labelStyle}>{t('form_notes')}</label>
        <textarea
          className={inputCls}
          style={inputStyle}
          value={form.notes ?? ''}
          onChange={(e) => set('notes', e.target.value)}
          rows={3}
          placeholder={t('form_notes_placeholder')}
        />
      </div>

      {/* API Key Linked toggle */}
      <div className="flex items-center justify-between rounded-xl px-4 py-3.5" style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{t('form_api_key_title')}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            {t('form_api_key_desc')}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.api_key_linked ?? false}
          onClick={() => set('api_key_linked', !(form.api_key_linked ?? false))}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
            form.api_key_linked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
              form.api_key_linked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? t('btn_saving') : subscription ? t('btn_save_changes') : t('btn_add_service')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm font-medium rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
        >
          {t('btn_cancel')}
        </button>
      </div>
    </form>
  )
}
