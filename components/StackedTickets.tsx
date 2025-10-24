interface StackedTicketsProps {
  className?: string;
}

export function StackedTickets({ className = "h-10" }: StackedTicketsProps) {
  return (
    <svg
      viewBox="0 0 75 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Ticket gradients */}
        <linearGradient
          id="ticket1Gradient"
          x1="0"
          y1="0"
          x2="50"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>

        <linearGradient
          id="ticket2Gradient"
          x1="0"
          y1="0"
          x2="50"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ff0080ff" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>

        <linearGradient
          id="ticket3Gradient"
          x1="0"
          y1="0"
          x2="50"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#00FFFF" />
          <stop offset="100%" stopColor="#0099FF" />
        </linearGradient>

        {/* Glow filters */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="ticketGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 3-Stacked Tickets - Back to Front */}
      <g filter="url(#ticketGlow)">
        {/* Ticket 3 (Back) - Cyan */}
        <g transform="translate(-4, 8) rotate(-8, 35, 35)">
          <rect
            x="10"
            y="20"
            width="50"
            height="30"
            rx="3"
            fill="url(#ticket3Gradient)"
            opacity="0.85"
            stroke="#00FFFF"
            strokeWidth="2"
          />
          {/* Perforations */}
          <circle cx="12" cy="25" r="1.5" fill="#0D1117" />
          <circle cx="12" cy="35" r="1.5" fill="#0D1117" />
          <circle cx="12" cy="45" r="1.5" fill="#0D1117" />
          <circle cx="58" cy="25" r="1.5" fill="#0D1117" />
          <circle cx="58" cy="35" r="1.5" fill="#0D1117" />
          <circle cx="58" cy="45" r="1.5" fill="#0D1117" />
          {/* Ticket details */}
          <line
            x1="20"
            y1="28"
            x2="50"
            y2="28"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <line
            x1="20"
            y1="35"
            x2="45"
            y2="35"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            opacity="0.8"
          />
          <line
            x1="20"
            y1="42"
            x2="48"
            y2="42"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            opacity="0.6"
          />
        </g>

        {/* Ticket 2 (Middle) - Pink */}
        <g transform="translate(0, 4) rotate(-3, 35, 35)">
          <rect
            x="10"
            y="20"
            width="50"
            height="30"
            rx="3"
            fill="url(#ticket2Gradient)"
            opacity="0.9"
            stroke="#ff0080ff"
            strokeWidth="2"
          />
          {/* Perforations */}
          <circle cx="12" cy="25" r="1.5" fill="#0D1117" />
          <circle cx="12" cy="35" r="1.5" fill="#0D1117" />
          <circle cx="12" cy="45" r="1.5" fill="#0D1117" />
          <circle cx="58" cy="25" r="1.5" fill="#0D1117" />
          <circle cx="58" cy="35" r="1.5" fill="#0D1117" />
          <circle cx="58" cy="45" r="1.5" fill="#0D1117" />
          {/* Ticket details */}
          <line
            x1="20"
            y1="28"
            x2="50"
            y2="28"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            opacity="0.7"
          />
          <circle cx="35" cy="35" r="3" fill="#FFFFFF" opacity="0.9" />
          <line
            x1="20"
            y1="42"
            x2="48"
            y2="42"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            opacity="0.7"
          />
        </g>

        {/* Ticket 1 (Front) - Gold */}
        <g transform="translate(4, 0) rotate(2, 35, 35)">
          <rect
            x="10"
            y="20"
            width="50"
            height="30"
            rx="3"
            fill="url(#ticket1Gradient)"
            stroke="#FFD700"
            strokeWidth="2.5"
          />
          {/* Perforations */}
          <circle cx="12" cy="25" r="1.5" fill="#0D1117" />
          <circle cx="12" cy="35" r="1.5" fill="#0D1117" />
          <circle cx="12" cy="45" r="1.5" fill="#0D1117" />
          <circle cx="58" cy="25" r="1.5" fill="#0D1117" />
          <circle cx="58" cy="35" r="1.5" fill="#0D1117" />
          <circle cx="58" cy="45" r="1.5" fill="#0D1117" />
          {/* Ticket details - dollar sign */}
          <text
            x="35"
            y="35"
            fontFamily="Arial"
            fontSize="16"
            fontWeight="900"
            fill="#FFFFFF"
            textAnchor="middle"
            dominantBaseline="middle"
            opacity="0.95"
          >
            $
          </text>
          {/* Decorative lines */}
          <line
            x1="20"
            y1="26"
            x2="30"
            y2="26"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            opacity="0.8"
          />
          <line
            x1="40"
            y1="26"
            x2="50"
            y2="26"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            opacity="0.8"
          />
          <line
            x1="20"
            y1="44"
            x2="30"
            y2="44"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            opacity="0.8"
          />
          <line
            x1="40"
            y1="44"
            x2="50"
            y2="44"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            opacity="0.8"
          />
        </g>
      </g>

      {/* Sparkles around tickets 
      <g opacity="0.9">
        <path
          d="M 8 18 L 9 20 L 11 19 L 9 21 L 10 23 L 8 22 L 6 23 L 7 21 L 5 20 L 7 19 Z"
          fill="#FFD700"
          filter="url(#glow)"
        />
        <path
          d="M 62 22 L 63 24 L 65 23 L 63 25 L 64 27 L 62 26 L 60 27 L 61 25 L 59 24 L 61 23 Z"
          fill="#00FFFF"
          filter="url(#glow)"
        />
        <path
          d="M 10 52 L 11 54 L 13 53 L 11 55 L 12 57 L 10 56 L 8 57 L 9 55 L 7 54 L 9 53 Z"
          fill="#FF00FF"
          filter="url(#glow)"
        />
      </g>
      */}
    </svg>
  );
}
