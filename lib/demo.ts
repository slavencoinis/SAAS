export const DEMO_COOKIE = 'demo_mode'

/** Set demo cookie (client-side only) */
export function enableDemoMode(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${DEMO_COOKIE}=1; path=/; max-age=7200; SameSite=Lax`
}

/** Clear demo cookie (client-side only) */
export function disableDemoMode(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0; path=/`
}

/** Check if demo mode is active (client-side only) */
export function isDemoMode(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some(c => c.trim().startsWith(`${DEMO_COOKIE}=1`))
}
