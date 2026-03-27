'use client'

/**
 * OptiStack logo mark — three staggered bars that form a cascading stack,
 * representing layered technology + optimization direction.
 * The gradient background (indigo → violet) matches the app's primary palette.
 */
export function OptiStackMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="OptiStack"
    >
      <defs>
        <linearGradient id="os-mark-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect width="32" height="32" rx="8" fill="url(#os-mark-g)" />

      {/* Three staggered bars — each shifted right by 4px, same width (16px)
          Creates a cascade that reads as a stack viewed in perspective */}
      <rect x="4"  y="9"    width="16" height="3.5" rx="1.75" fill="white" fillOpacity="0.95" />
      <rect x="8"  y="14.5" width="16" height="3.5" rx="1.75" fill="white" fillOpacity="0.70" />
      <rect x="12" y="20"   width="16" height="3.5" rx="1.75" fill="white" fillOpacity="0.45" />
    </svg>
  )
}

/**
 * Stylish spend / dollar icon.
 * A geometric dollar sign (vertical bar + S-curve) inside a clean circle ring —
 * looks like a logo mark rather than a utility icon.
 */
export function SpendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer ring — coin / badge feel */}
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />

      {/* Vertical bar of the dollar sign */}
      <path d="M10 5.5v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* S-curve body of the dollar sign */}
      <path
        d="M12.5 7.8c0-.95-1.1-1.6-2.5-1.6S7.5 6.85 7.5 7.8c0 .95 1 1.35 2.5 1.6 1.5.25 2.5.7 2.5 1.65S11.4 12.7 10 12.7s-2.5-.65-2.5-1.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
