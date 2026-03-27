'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme, ThemePreference } from '@/components/ThemeProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { Language } from '@/lib/i18n'
import {
  LayoutDashboard,
  CreditCard,
  PlusCircle,
  LogOut,
  Plug,
  Sun,
  Moon,
  Monitor,
  X,
  Settings,
} from 'lucide-react'
import { OptiStackMark } from '@/components/OptiStackLogo'
import { disableDemoMode, isDemoMode } from '@/lib/demo'

const themeOptions: { value: ThemePreference; icon: typeof Sun; labelKey: 'theme_system' | 'theme_light' | 'theme_dark' }[] = [
  { value: 'system', icon: Monitor, labelKey: 'theme_system' },
  { value: 'light',  icon: Sun,     labelKey: 'theme_light'  },
  { value: 'dark',   icon: Moon,    labelKey: 'theme_dark'   },
]

const langOptions: { value: Language; label: string }[] = [
  { value: 'sr', label: 'SR' },
  { value: 'en', label: 'EN' },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { preference, setPreference } = useTheme()
  const { lang, setLang, t } = useLanguage()

  const navItems = [
    { href: '/dashboard',         label: t('nav_dashboard'),    icon: LayoutDashboard },
    { href: '/subscriptions',     label: t('nav_services'),     icon: CreditCard      },
    { href: '/subscriptions/new', label: t('nav_add_service'),  icon: PlusCircle      },
    { href: '/integrations',      label: t('nav_integrations'), icon: Plug            },
    { href: '/settings',          label: t('nav_settings'),     icon: Settings        },
  ]

  const handleLogout = async () => {
    if (isDemoMode()) {
      disableDemoMode()
    } else {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    // Full page navigation so server gets the cleared cookie immediately
    window.location.replace('/login')
  }

  const handleNavClick = () => {
    // Close mobile drawer after navigation
    onMobileClose?.()
  }

  return (
    <aside
      className={[
        // Base
        'w-64 bg-gray-900 text-white flex flex-col shrink-0',
        // Mobile: fixed overlay, slides in from left
        'fixed inset-y-0 left-0 z-30 transition-transform duration-200 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: static, always visible
        'lg:static lg:translate-x-0 lg:h-screen',
      ].join(' ')}
    >
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b border-gray-700/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OptiStackMark size={34} />
          <div className="leading-none">
            <span className="text-[17px] font-bold tracking-tight text-white">Opti</span>
            <span className="text-[17px] font-bold tracking-tight text-indigo-400">Stack</span>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* ── Language + Theme ──────────────────────────────────────────────── */}
      <div className="px-3 py-2 border-t border-gray-700 flex items-center gap-2">
        {/* Language */}
        <div className="flex gap-0.5 bg-gray-800 rounded-md p-0.5 flex-1">
          {langOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setLang(value)}
              className={`flex-1 py-1 rounded text-[11px] font-semibold transition-colors ${
                lang === value ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Theme */}
        <div className="flex gap-0.5 bg-gray-800 rounded-md p-0.5 flex-1">
          {themeOptions.map(({ value, icon: Icon, labelKey }) => (
            <button
              key={value}
              onClick={() => setPreference(value)}
              title={t(labelKey)}
              className={`flex-1 flex items-center justify-center py-1 rounded transition-colors ${
                preference === value ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Logout ────────────────────────────────────────────────────────── */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {t('nav_sign_out')}
        </button>
      </div>
    </aside>
  )
}
