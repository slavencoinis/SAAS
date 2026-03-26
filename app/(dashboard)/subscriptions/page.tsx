import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Subscription } from '@/types/subscription'
import { format, differenceInDays, parseISO } from 'date-fns'
import Link from 'next/link'
import { PlusCircle, ExternalLink } from 'lucide-react'
import { StatusBadge, UsageBadge } from '@/components/StatusBadge'
import DeleteButton from './DeleteButton'

const categoryLabels: Record<string, string> = {
  productivity: 'Produktivnost',
  development: 'Development',
  design: 'Dizajn',
  marketing: 'Marketing',
  communication: 'Komunikacija',
  storage: 'Storage',
  other: 'Ostalo',
}

export default async function SubscriptionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const subscriptions: Subscription[] = subs ?? []
  const today = new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pretplate</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subscriptions.length} ukupno</p>
        </div>
        <Link
          href="/subscriptions/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Dodaj pretplatu
        </Link>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-400 dark:text-gray-500 mb-4">Nemas jos nijednu pretplatu.</p>
          <Link
            href="/subscriptions/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            <PlusCircle className="w-4 h-4" />
            Dodaj prvu pretplatu
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Naziv</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Kategorija</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Cijena</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Datum obnove</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Koristenje</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {subscriptions.map((s) => {
                  const daysUntilRenewal = s.renewal_date
                    ? differenceInDays(parseISO(s.renewal_date), today)
                    : null
                  const isExpiringSoon =
                    daysUntilRenewal !== null && daysUntilRenewal >= 0 && daysUntilRenewal <= 7

                  return (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <Link
                              href={`/subscriptions/${s.id}`}
                              className="font-medium text-gray-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400"
                            >
                              {s.name}
                            </Link>
                            {s.description && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[180px]">{s.description}</p>
                            )}
                          </div>
                          {s.url && (
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 dark:text-gray-600 hover:text-indigo-500">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                        {s.category ? categoryLabels[s.category] : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-200 font-medium">
                        {s.currency} {s.price}
                        <span className="text-gray-400 dark:text-gray-500 font-normal text-xs ml-1">
                          /{s.billing_cycle === 'monthly' ? 'mj' : s.billing_cycle === 'yearly' ? 'god' : s.billing_cycle}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {s.renewal_date ? (
                          <div>
                            <span className={isExpiringSoon ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-200'}>
                              {format(parseISO(s.renewal_date), 'dd.MM.yyyy')}
                            </span>
                            {daysUntilRenewal !== null && daysUntilRenewal >= 0 && daysUntilRenewal <= 30 && (
                              <span className={`ml-2 text-xs ${daysUntilRenewal <= 7 ? 'text-red-500' : 'text-yellow-500'}`}>
                                ({daysUntilRenewal === 0 ? 'danas' : `${daysUntilRenewal}d`})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                      <td className="py-3 px-4"><UsageBadge usage={s.usage_status} /></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/subscriptions/${s.id}`} className="text-xs text-indigo-500 hover:underline">
                            Uredi
                          </Link>
                          <DeleteButton id={s.id} name={s.name} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
