export function ClubLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield outline */}
      <path
        d="M60 2 L115 20 L115 85 Q115 120 60 138 Q5 120 5 85 L5 20 Z"
        fill="#1a5c1a"
        stroke="#32cd32"
        strokeWidth="3"
      />

      {/* Inner shield */}
      <path
        d="M60 8 L109 24 L109 83 Q109 114 60 132 Q11 114 11 83 L11 24 Z"
        fill="#0d3d0d"
      />

      {/* Top banner */}
      <rect x="15" y="18" width="90" height="22" rx="2" fill="#1a5c1a" />
      <text
        x="60"
        y="33"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="11"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
      >
        ФК ВИХЪР
      </text>

      {/* Green and white stripes */}
      <rect x="20" y="44" width="16" height="40" fill="#ffffff" />
      <rect x="36" y="44" width="16" height="40" fill="#32cd32" />
      <rect x="52" y="44" width="16" height="40" fill="#ffffff" />
      <rect x="68" y="44" width="16" height="40" fill="#32cd32" />
      <rect x="84" y="44" width="16" height="40" fill="#ffffff" />

      {/* Football icon circle */}
      <circle cx="60" cy="64" r="14" fill="#1a5c1a" stroke="#32cd32" strokeWidth="1.5" />
      <circle cx="60" cy="64" r="10" fill="none" stroke="#ffffff" strokeWidth="1" />
      <text
        x="60"
        y="68"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="12"
      >
        ⚽
      </text>

      {/* Bottom banner - ВОЙВОДИНОВО */}
      <rect x="15" y="88" width="90" height="20" rx="2" fill="#1a5c1a" />
      <text
        x="60"
        y="102"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="8.5"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        ВОЙВОДИНОВО
      </text>

      {/* Year */}
      <text
        x="60"
        y="122"
        textAnchor="middle"
        fill="#32cd32"
        fontSize="14"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
      >
        1961
      </text>
    </svg>
  );
}
