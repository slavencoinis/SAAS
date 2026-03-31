export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-6 w-12 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex justify-between">
                <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-6 w-16 rounded-full bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
