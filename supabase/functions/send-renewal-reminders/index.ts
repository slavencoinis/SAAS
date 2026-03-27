// Supabase Edge Function (Deno) — send renewal reminder emails via Resend
// Runs daily via pg_cron at 08:00 UTC, or manually via POST for test emails

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL        = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY      = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL          = Deno.env.get('FROM_EMAIL') ?? 'OptiStack <reminders@optistack.app>'

interface Subscription {
  id: string
  name: string
  renewal_date: string | null
  price: number
  currency: string
  billing_cycle: string
  status: string
}

interface RenewalRow extends Subscription {
  user_email: string
  user_id: string
}

Deno.serve(async (req: Request) => {
  // ── Auth ──────────────────────────────────────────────────────────────────
  // Accept either service role key (cron) or a user JWT (test email button)
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

  // ── Supabase client with service role (bypasses RLS) ─────────────────────
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  // ── Compute date window ───────────────────────────────────────────────────
  const today   = new Date()
  const in7days = new Date(today)
  in7days.setDate(in7days.getDate() + 7)

  const todayStr   = today.toISOString().slice(0, 10)
  const in7daysStr = in7days.toISOString().slice(0, 10)

  // ── Query subscriptions + user emails via auth.users ─────────────────────
  let query = supabase
    .from('subscriptions')
    .select('id, name, renewal_date, price, currency, billing_cycle, status, user_id, auth.users!inner(email)')
    .gte('renewal_date', todayStr)
    .lte('renewal_date', in7daysStr)
    .in('status', ['active', 'trial', 'overlimit'])

  if (filterUserId) {
    query = query.eq('user_id', filterUserId)
  }

  const { data: rows, error } = await query
  if (error) {
    console.error('DB query error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  if (!rows || rows.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: 'No upcoming renewals' }), { status: 200 })
  }

  // ── Group by user ─────────────────────────────────────────────────────────
  const byUser = new Map<string, { email: string; subs: Subscription[] }>()
  for (const row of rows as unknown as RenewalRow[]) {
    const email = (row as unknown as { 'auth.users': { email: string } })['auth.users']?.email ?? ''
    if (!email) continue
    if (!byUser.has(row.user_id)) byUser.set(row.user_id, { email, subs: [] })
    byUser.get(row.user_id)!.subs.push(row)
  }

  // ── Send emails ───────────────────────────────────────────────────────────
  let sent = 0
  const errors: string[] = []

  for (const [, { email, subs }] of byUser) {
    const rows_html = subs.map((s) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${s.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${s.renewal_date ?? '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${s.currency} ${s.price}/${s.billing_cycle === 'monthly' ? 'mj' : s.billing_cycle === 'yearly' ? 'god' : s.billing_cycle}</td>
      </tr>`).join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <div style="width:36px;height:36px;background:#4f46e5;border-radius:8px;display:flex;align-items:center;justify-content:center;">
            <span style="color:white;font-weight:bold;font-size:16px;">O</span>
          </div>
          <span style="font-size:20px;font-weight:700;"><span style="color:#111">Opti</span><span style="color:#4f46e5">Stack</span></span>
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

        <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
          Šalje OptiStack — automatski podsjetnik za obnovu SaaS servisa.<br>
          ${isTest ? '<em>Ovo je test email.</em>' : ''}
        </p>
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
        subject: `OptiStack: ${subs.length} servis${subs.length > 1 ? 'a' : ''} uskoro ističe`,
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
    JSON.stringify({ sent, total_subscriptions: rows.length, errors }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
