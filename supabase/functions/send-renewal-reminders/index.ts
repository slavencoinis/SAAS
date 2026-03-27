// Supabase Edge Function (Deno) — send renewal reminder emails via Resend
// Runs daily via pg_cron at 08:00 UTC, or manually via POST for test emails

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY   = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL       = Deno.env.get('FROM_EMAIL') ?? 'OptiStack <onboarding@resend.dev>'

interface Subscription {
  id: string
  name: string
  renewal_date: string | null
  price: number
  currency: string
  billing_cycle: string
  status: string
  user_id: string
}

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  let filterUserId: string | null = null
  let isTest = false

  if (req.method === 'POST') {
    try {
      const body = await req.json()
      if (body.user_id) filterUserId = body.user_id
      if (body.test)    isTest = true
    } catch { /* empty body ok */ }
  }

  // ── Admin client (service role — bypasses RLS) ────────────────────────────
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // ── Compute date window ───────────────────────────────────────────────────
  const today   = new Date()
  const in7days = new Date(today)
  in7days.setDate(in7days.getDate() + 7)
  const todayStr   = today.toISOString().slice(0, 10)
  const in7daysStr = in7days.toISOString().slice(0, 10)

  // ── Query subscriptions (no cross-schema join) ────────────────────────────
  // In test mode: return up to 3 active subscriptions regardless of date
  let query = admin
    .from('subscriptions')
    .select('id, name, renewal_date, price, currency, billing_cycle, status, user_id')
    .in('status', ['active', 'trial', 'overlimit'])

  if (!isTest) {
    query = query.gte('renewal_date', todayStr).lte('renewal_date', in7daysStr)
  } else {
    query = query.limit(3)
  }

  if (filterUserId) query = query.eq('user_id', filterUserId)

  const { data: subs, error: subsError } = await query
  if (subsError) {
    return new Response(JSON.stringify({ error: subsError.message }), { status: 500 })
  }
  if (!subs || subs.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: 'No upcoming renewals' }), { status: 200 })
  }

  // ── Group by user_id ──────────────────────────────────────────────────────
  const byUser = new Map<string, Subscription[]>()
  for (const s of subs as Subscription[]) {
    if (!byUser.has(s.user_id)) byUser.set(s.user_id, [])
    byUser.get(s.user_id)!.push(s)
  }

  // ── Fetch emails via Admin Auth API ───────────────────────────────────────
  let sent = 0
  const errors: string[] = []

  for (const [userId, userSubs] of byUser) {
    // Get user email via admin API
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId)
    if (userError || !userData?.user?.email) {
      errors.push(`user ${userId}: could not fetch email`)
      continue
    }
    const email = userData.user.email

    const rows_html = userSubs.map((s) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${s.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${s.renewal_date ?? '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${s.currency} ${s.price}/${
          s.billing_cycle === 'monthly' ? 'mj' : s.billing_cycle === 'yearly' ? 'god' : s.billing_cycle
        }</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
  <div style="margin-bottom:24px;">
    <span style="font-size:20px;font-weight:700;">
      <span style="color:#111">Opti</span><span style="color:#4f46e5">Stack</span>
    </span>
  </div>
  <h2 style="margin:0 0 8px;font-size:18px;">Servisima uskoro ističe pretplata</h2>
  <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Sljedeći servisi obnavljaju se u roku od 7 dana:</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead>
      <tr style="background:#f9fafb;">
        <th style="text-align:left;padding:8px 12px;font-weight:600;color:#374151;">Servis</th>
        <th style="text-align:left;padding:8px 12px;font-weight:600;color:#374151;">Datum obnove</th>
        <th style="text-align:left;padding:8px 12px;font-weight:600;color:#374151;">Cijena</th>
      </tr>
    </thead>
    <tbody>${rows_html}</tbody>
  </table>
  <div style="margin-top:24px;padding-top:24px;border-top:1px solid #f0f0f0;">
    <a href="https://saasslaven.vercel.app/dashboard"
       style="display:inline-block;padding:10px 20px;background:#4f46e5;color:white;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;">
      Otvori OptiStack
    </a>
  </div>
  ${isTest ? '<p style="margin-top:16px;font-size:12px;color:#9ca3af;"><em>Ovo je test email.</em></p>' : ''}
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      [email],
        subject: `OptiStack: ${userSubs.length} servis${userSubs.length > 1 ? 'a' : ''} uskoro ističe`,
        html,
      }),
    })

    if (res.ok) {
      sent++
    } else {
      const err = await res.text()
      errors.push(`${email}: ${err}`)
      console.error('Resend error for', email, err)
    }
  }

  return new Response(
    JSON.stringify({ sent, total_subscriptions: subs.length, errors }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
