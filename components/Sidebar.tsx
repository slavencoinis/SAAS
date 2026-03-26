'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme, ThemePreference } from '@/components/ThemeProvider'
import {
  LayoutDashboard,
  CreditCard,
  PlusCircle,
  LogOut,
  Layers,
  Plug,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',        label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/subscriptions',    label: 'Servisi',          icon: CreditCard      },
  { href: '/subscriptions/new',label: 'Dodaj servis',     icon: PlusCircle      },
  { href: '/integrations',     label: 'Integracije',      icon: Plug            },
]

const themeOptions: { value: ThemePreference; icon: typeof Sun; label: string }[] = [
  { value: 'system', icon: Monitor, label: 'Sistem' },
  { value: 'light',  icon: Sun,     label: 'Svijetla' },
  { value: 'dark',   icon: Moon,    label: 'Tamna'    },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { preference, setPreference } = useTheme()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Layers className="w-7 h-7 text-indigo-400" />
          <span className="text-xl font-bold">SaaS Manager</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Theme switcher */}
      <div className="px-4 py-3 border-t border-gray-700">
        <p className="text-xs font-medium text-gray-500 mb-2 px-1">Tema</p>
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          {themeOptions.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setPreference(value)}
              title={label}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                preference === value
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Odjava
        </button>
      </div>
    </aside>
  )
}
