'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type ThemePreference = 'system' | 'light' | 'dark'

interface ThemeContextValue {
  preference: ThemePreference
  resolved: 'light' | 'dark'
  setPreference: (t: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system')
  const [resolved, setResolved] = useState<'light' | 'dark'>('dark')

  // On mount, read saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme-preference') as ThemePreference | null
    if (saved && ['system', 'light', 'dark'].includes(saved)) {
      setPreferenceState(saved)
    }
  }, [])

  // Whenever preference changes, apply .dark class to <html>
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const isDark =
        preference === 'dark' ||
        (preference === 'system' && media.matches)

      document.documentElement.classList.toggle('dark', isDark)
      setResolved(isDark ? 'dark' : 'light')
    }

    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [preference])

  const setPreference = (t: ThemePreference) => {
    setPreferenceState(t)
    localStorage.setItem('theme-preference', t)
  }

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
