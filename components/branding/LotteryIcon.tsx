interface LotteryIconProps {
  className?: string;
}

export function LotteryIcon({ className = "w-6 h-6" }: LotteryIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main ticket shape */}
      <rect
        x="8"
        y="12"
        width="48"
        height="40"
        rx="4"
        fill="url(#ticketGradient)"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Perforation circles on left */}
      <circle cx="8" cy="20" r="2" fill="white" />
      <circle cx="8" cy="28" r="2" fill="white" />
      <circle cx="8" cy="36" r="2" fill="white" />
      <circle cx="8" cy="44" r="2" fill="white" />
      
      {/* Perforation circles on right */}
      <circle cx="56" cy="20" r="2" fill="white" />
      <circle cx="56" cy="28" r="2" fill="white" />
      <circle cx="56" cy="36" r="2" fill="white" />
      <circle cx="56" cy="44" r="2" fill="white" />
      
      {/* Dollar sign */}
      <path
        d="M32 19 L32 45 M28 23 C28 21 30 19 32 19 C34 19 36 21 36 23 C36 25 34 26 32 26 L30 26 C28 26 26 28 26 30 C26 32 28 34 30 34 L34 34 C36 34 38 36 38 38 C38 40 36 42 34 42 C32 42 30 40 30 38"
        stroke="#FFD700"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Sparkles */}
      <g opacity="0.8">
        <path
          d="M16 16 L17 18 L19 17 L17 19 L18 21 L16 20 L14 21 L15 19 L13 18 L15 17 Z"
          fill="#FFD700"
        />
        <path
          d="M48 16 L49 18 L51 17 L49 19 L50 21 L48 20 L46 21 L47 19 L45 18 L47 17 Z"
          fill="#FFD700"
        />
        <path
          d="M16 48 L17 50 L19 49 L17 51 L18 53 L16 52 L14 53 L15 51 L13 50 L15 49 Z"
          fill="#FBBF24"
        />
        <path
          d="M48 48 L49 50 L51 49 L49 51 L50 53 L48 52 L46 53 L47 51 L45 50 L47 49 Z"
          fill="#FBBF24"
        />
      </g>
      
      {/* Coin accents */}
      <circle cx="20" cy="32" r="3" fill="#FFD700" opacity="0.6" />
      <circle cx="44" cy="32" r="3" fill="#FFD700" opacity="0.6" />
      
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="ticketGradient" x1="8" y1="12" x2="56" y2="52">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
      </defs>
    </svg>
  );
}
