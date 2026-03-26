import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SubscriptionForm from '@/components/SubscriptionForm'
import { Subscription } from '@/types/subscription'

export default async function EditSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!data) notFound()

  const subscription = data as Subscription

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Uredi pretplatu</h1>
        <p className="text-gray-500 text-sm mt-1">{subscription.name}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SubscriptionForm subscription={subscription} />
      </div>
    </div>
  )
}
