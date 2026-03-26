'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Language, TranslationKey, translations } from '@/lib/i18n'

interface LanguageContextValue {
  lang: Language
  setLang: (l: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'sr',
  setLang: () => {},
  t: (key) => translations.sr[key],
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('sr')

  // Read persisted preference on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lang') as Language | null
      if (stored === 'sr' || stored === 'en') setLangState(stored)
    } catch {}
  }, [])

  const setLang = (l: Language) => {
    setLangState(l)
    try { localStorage.setItem('lang', l) } catch {}
  }

  const t = (key: TranslationKey): string => translations[lang][key] ?? translations.sr[key]

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
