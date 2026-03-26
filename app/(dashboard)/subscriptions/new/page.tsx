import SubscriptionForm from '@/components/SubscriptionForm'

export default function NewSubscriptionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dodaj pretplatu</h1>
        <p className="text-gray-500 text-sm mt-1">Unesi podatke o novoj SaaS pretplati</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SubscriptionForm />
      </div>
    </div>
  )
}
