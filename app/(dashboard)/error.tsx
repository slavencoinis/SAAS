'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-full">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nešto je pošlo po krivu</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{error.message}</p>
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
      >
        Pokušaj ponovo
      </button>
    </div>
  )
}
