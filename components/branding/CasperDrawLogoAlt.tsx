interface CasperDrawLogoAltProps {
  className?: string;
  animated?: boolean;
}

export function CasperDrawLogoAlt({ className = "h-10", animated = false }: CasperDrawLogoAltProps) {
  return (
    <svg
      viewBox="0 0 400 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="altMainGradient" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="25%" stopColor="#FF6B6B" />
          <stop offset="50%" stopColor="#FF00FF" />
          <stop offset="75%" stopColor="#00FFFF" />
          <stop offset="100%" stopColor="#9933FF" />
        </linearGradient>

        <linearGradient id="altAccentGradient" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00FFFF" />
          <stop offset="100%" stopColor="#9933FF" />
        </linearGradient>

        {/* Ticket gradients */}
        <linearGradient id="altTicket1" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>

        <linearGradient id="altTicket2" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF00FF" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>

        <linearGradient id="altTicket3" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00FFFF" />
          <stop offset="100%" stopColor="#0099FF" />
        </linearGradient>

        {/* Glow filters */}
        <filter id="altGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <filter id="altStrongGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Animated gradient (if enabled) */}
        {animated && (
          <linearGradient id="animatedGradient" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD700">
              <animate attributeName="stop-color" values="#FFD700; #FF00FF; #00FFFF; #FFD700" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#FF00FF">
              <animate attributeName="stop-color" values="#FF00FF; #00FFFF; #FFD700; #FF00FF" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#00FFFF">
              <animate attributeName="stop-color" values="#00FFFF; #FFD700; #FF00FF; #00FFFF" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        )}
      </defs>

      {/* Background tech pattern */}
      <g opacity="0.1">
        {/* Grid */}
        <path d="M 0 10 L 320 10 M 0 30 L 320 30 M 0 50 L 320 50" stroke="#00FFFF" strokeWidth="0.5" />
        <path d="M 50 0 L 50 70 M 100 0 L 100 70 M 150 0 L 150 70 M 200 0 L 200 70 M 250 0 L 250 70" stroke="#FF00FF" strokeWidth="0.5" />
        
        {/* Circuit nodes */}
        <circle cx="50" cy="10" r="1.5" fill="#00FFFF" />
        <circle cx="150" cy="30" r="1.5" fill="#FF00FF" />
        <circle cx="250" cy="50" r="1.5" fill="#FFD700" />
      </g>

      {/* 3-Stacked Tickets */}
      <g filter="url(#altGlow)">
        {/* Ticket 3 (Back) - Cyan */}
        <g transform="translate(-4, 8) rotate(-8, 40, 35)">
          <rect x="15" y="18" width="50" height="30" rx="3" fill="url(#altTicket3)" opacity="0.85" stroke="#00FFFF" strokeWidth="2.5"/>
          <circle cx="17" cy="23" r="1.5" fill="#0D1117" />
          <circle cx="17" cy="33" r="1.5" fill="#0D1117" />
          <circle cx="17" cy="43" r="1.5" fill="#0D1117" />
          <circle cx="63" cy="23" r="1.5" fill="#0D1117" />
          <circle cx="63" cy="33" r="1.5" fill="#0D1117" />
          <circle cx="63" cy="43" r="1.5" fill="#0D1117" />
          <line x1="25" y1="26" x2="55" y2="26" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
          <line x1="25" y1="33" x2="50" y2="33" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.8" />
          <line x1="25" y1="40" x2="53" y2="40" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
        </g>

        {/* Ticket 2 (Middle) - Pink */}
        <g transform="translate(0, 4) rotate(-3, 40, 35)">
          <rect x="15" y="18" width="50" height="30" rx="3" fill="url(#altTicket2)" opacity="0.9" stroke="#FF00FF" strokeWidth="2.5"/>
          <circle cx="17" cy="23" r="1.5" fill="#0D1117" />
          <circle cx="17" cy="33" r="1.5" fill="#0D1117" />
          <circle cx="17" cy="43" r="1.5" fill="#0D1117" />
          <circle cx="63" cy="23" r="1.5" fill="#0D1117" />
          <circle cx="63" cy="33" r="1.5" fill="#0D1117" />
          <circle cx="63" cy="43" r="1.5" fill="#0D1117" />
          <line x1="25" y1="26" x2="55" y2="26" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" />
          <circle cx="40" cy="33" r="3.5" fill="#FFFFFF" opacity="0.9" />
          <line x1="25" y1="40" x2="53" y2="40" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" />
        </g>

        {/* Ticket 1 (Front) - Gold */}
        <g transform="translate(4, 0) rotate(2, 40, 35)">
          <rect x="15" y="18" width="50" height="30" rx="3" fill="url(#altTicket1)" stroke="#FFD700" strokeWidth="3"/>
          <circle cx="17" cy="23" r="1.5" fill="#0D1117" />
          <circle cx="17" cy="33" r="1.5" fill="#0D1117" />
          <circle cx="17" cy="43" r="1.5" fill="#0D1117" />
          <circle cx="63" cy="23" r="1.5" fill="#0D1117" />
          <circle cx="63" cy="33" r="1.5" fill="#0D1117" />
          <circle cx="63" cy="43" r="1.5" fill="#0D1117" />
          <text x="40" y="36" fontFamily="Arial" fontSize="18" fontWeight="900" fill="#FFFFFF" textAnchor="middle" opacity="0.95">$</text>
          <line x1="25" y1="24" x2="35" y2="24" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
          <line x1="45" y1="24" x2="55" y2="24" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
          <line x1="25" y1="42" x2="35" y2="42" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
          <line x1="45" y1="42" x2="55" y2="42" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
        </g>
      </g>

      {/* Sparkles around tickets */}
      <g opacity="0.9" filter="url(#altGlow)">
        <path d="M 8 16 L 9 18 L 11 17 L 9 19 L 10 21 L 8 20 L 6 21 L 7 19 L 5 18 L 7 17 Z" fill="#FFD700" />
        <path d="M 70 20 L 71 22 L 73 21 L 71 23 L 72 25 L 70 24 L 68 25 L 69 23 L 67 22 L 69 21 Z" fill="#00FFFF" />
        <path d="M 10 54 L 11 56 L 13 55 L 11 57 L 12 59 L 10 58 L 8 59 L 9 57 L 7 56 L 9 55 Z" fill="#FF00FF" />
      </g>

      {/* Main Text Group */}
      <g filter="url(#altStrongGlow)">
        {/* CASPER */}
        <text
          x="90"
          y="38"
          fontFamily="'Arial Black', Arial, sans-serif"
          fontSize="26"
          fontWeight="900"
          fill={animated ? "url(#animatedGradient)" : "url(#altMainGradient)"}
          letterSpacing="2"
          style={{ textTransform: 'uppercase' }}
        >
          CASPER
        </text>

        {/* Separator dot */}
        <circle cx="228" cy="34" r="3" fill="#FF00FF" opacity="0.8" />
        <circle cx="228" cy="34" r="1.5" fill="#FFFFFF" />

        {/* DRAW */}
        <text
          x="245"
          y="38"
          fontFamily="'Arial Black', Arial, sans-serif"
          fontSize="26"
          fontWeight="900"
          fill={animated ? "url(#animatedGradient)" : "url(#altMainGradient)"}
          letterSpacing="2"
          style={{ textTransform: 'uppercase' }}
        >
          DRAW
        </text>
      </g>

      {/* Right decorative element - Sparkles */}
      <g opacity="0.9" filter="url(#altGlow)">
        {/* Large sparkle */}
        <path
          d="M 370 18 L 372 23 L 377 21 L 372 26 L 374 31 L 370 28 L 366 31 L 368 26 L 363 23 L 368 21 Z"
          fill="#FFD700"
        />
        {/* Medium sparkle */}
        <path
          d="M 360 35 L 361.5 38 L 364.5 37 L 361.5 40 L 363 43 L 360 41 L 357 43 L 358.5 40 L 355.5 38 L 358.5 37 Z"
          fill="#00FFFF"
        />
        {/* Small sparkle */}
        <path
          d="M 377 45 L 378 47 L 380 46 L 378 48 L 379 50 L 377 49 L 375 50 L 376 48 L 374 47 L 376 46 Z"
          fill="#FF00FF"
        />
      </g>

      {/* Quantum dots accent */}
      <g opacity="0.6">
        <circle cx="92" cy="20" r="1.5" fill="#00FFFF">
          {animated && <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />}
        </circle>
        <circle cx="360" cy="20" r="1.5" fill="#FF00FF">
          {animated && <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />}
        </circle>
        <circle cx="225" cy="12" r="1" fill="#FFD700">
          {animated && <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />}
        </circle>
      </g>
    </svg>
  );
}
