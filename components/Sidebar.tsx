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
    window.location.replace('/login')
  }

  const handleNavClick = () => {
    onMobileClose?.()
  }

  return (
    <aside
      className={[
        'w-60 flex flex-col shrink-0',
        'fixed inset-y-0 left-0 z-30 transition-transform duration-200 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:static lg:translate-x-0 lg:h-screen',
      ].join(' ')}
      style={{ background: 'var(--card)', borderRight: '1px solid var(--card-border)' }}
    >
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2.5">
          <OptiStackMark size={32} />
          <div className="leading-none">
            <span className="text-[16px] font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Opti</span>
            <span className="text-[16px] font-bold tracking-tight text-indigo-500">Stack</span>
          </div>
        </div>
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--muted)' }}
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                active
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                  : 'hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
              style={!active ? { color: 'var(--muted)' } : {}}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* ── Language + Theme ──────────────────────────────────────────────── */}
      <div className="px-3 py-2.5 flex items-center gap-2" style={{ borderTop: '1px solid var(--card-border)' }}>
        <div className="flex gap-0.5 rounded-lg p-0.5 flex-1" style={{ background: 'var(--background)' }}>
          {langOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setLang(value)}
              className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-all ${
                lang === value
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              style={lang !== value ? { color: 'var(--muted)' } : {}}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-0.5 rounded-lg p-0.5 flex-1" style={{ background: 'var(--background)' }}>
          {themeOptions.map(({ value, icon: Icon, labelKey }) => (
            <button
              key={value}
              onClick={() => setPreference(value)}
              title={t(labelKey)}
              className={`flex-1 flex items-center justify-center py-1 rounded-md transition-all ${
                preference === value
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              style={preference !== value ? { color: 'var(--muted)' } : {}}
            >
              <Icon className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Logout ────────────────────────────────────────────────────────── */}
      <div className="p-3" style={{ borderTop: '1px solid var(--card-border)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl text-[13px] font-medium transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          style={{ color: 'var(--muted)' }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {t('nav_sign_out')}
        </button>
      </div>
    </aside>
  )
}
