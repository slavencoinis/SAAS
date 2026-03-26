import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/components/LanguageProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SaaS Manager',
  description: 'Upravljaj svim SaaS servisima na jednom mjestu',
}

/**
 * Inline script that runs synchronously before first paint —
 * prevents flash of wrong theme on page load.
 */
const antiFlashScript = `
(function() {
  try {
    var saved = localStorage.getItem('theme-preference');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved === 'dark' || ((!saved || saved === 'system') && prefersDark);
    if (isDark) document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bs" className="h-full" suppressHydrationWarning>
      <head>
        {/* Anti-flash: sets .dark before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
      </head>
      <body className={`${inter.className} h-full`}>
        <ThemeProvider><LanguageProvider>{children}</LanguageProvider></ThemeProvider>
      </body>
    </html>
  )
}
