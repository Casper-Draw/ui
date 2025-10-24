interface CasperDrawIconProps {
  className?: string;
}

export function CasperDrawIcon({ className = "w-6 h-6" }: CasperDrawIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main ticket/card with Autonom RNG circuit pattern */}
      <rect
        x="8"
        y="14"
        width="48"
        height="36"
        rx="6"
        fill="url(#drawGradient)"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Autonom RNG circuit lines */}
      <g opacity="0.4" stroke="#00FFFF" strokeWidth="1.5">
        <line x1="14" y1="22" x2="24" y2="22" />
        <line x1="40" y1="22" x2="50" y2="22" />
        <line x1="14" y1="42" x2="24" y2="42" />
        <line x1="40" y1="42" x2="50" y2="42" />
        <circle cx="27" cy="22" r="2" fill="#00FFFF" />
        <circle cx="37" cy="22" r="2" fill="#00FFFF" />
        <circle cx="27" cy="42" r="2" fill="#00FFFF" />
        <circle cx="37" cy="42" r="2" fill="#00FFFF" />
      </g>

      {/* Central lightning bolt (instant draw) */}
      <path
        d="M36 18 L26 32 L30 32 L28 46 L38 28 L34 28 L36 18 Z"
        fill="url(#lightningGradient)"
        stroke="#FFD700"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Sparkle effects */}
      <g opacity="0.9">
        {/* Top left sparkle */}
        <path
          d="M16 18 L17 20 L19 19 L17 21 L18 23 L16 22 L14 23 L15 21 L13 20 L15 19 Z"
          fill="#FFD700"
        />
        {/* Top right sparkle */}
        <path
          d="M48 18 L49 20 L51 19 L49 21 L50 23 L48 22 L46 23 L47 21 L45 20 L47 19 Z"
          fill="#00FFFF"
        />
        {/* Bottom sparkles */}
        <circle cx="18" cy="45" r="1.5" fill="#FFD700" />
        <circle cx="46" cy="45" r="1.5" fill="#ff0080ff" />
      </g>

      {/* Curved arrows indicating randomness/draw */}
      <g opacity="0.3" stroke="#ff0080ff" strokeWidth="1.5" fill="none">
        <path d="M 20 28 Q 24 24 28 28" strokeLinecap="round" />
        <path d="M 36 36 Q 40 40 44 36" strokeLinecap="round" />
      </g>

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="drawGradient" x1="8" y1="14" x2="56" y2="50">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="50%" stopColor="#DB2777" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="lightningGradient" x1="28" y1="18" x2="34" y2="46">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  );
}
