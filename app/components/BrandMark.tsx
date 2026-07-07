export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Fiber Flightcheck logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="flightcheck-mark" x1="8" y1="8" x2="56" y2="56">
          <stop stopColor="#5df2a6" />
          <stop offset="0.52" stopColor="#47d9ff" />
          <stop offset="1" stopColor="#7aa2ff" />
        </linearGradient>
        <filter id="flightcheck-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feColorMatrix
            in="blur"
            result="glow"
            values="0 0 0 0 0.36 0 0 0 0 0.95 0 0 0 0 0.65 0 0 0 .42 0"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="6" y="6" width="52" height="52" rx="16" fill="#07111d" stroke="#1f3b45" />
      <path
        d="M19 43V20h27M19 32h20M19 43h28"
        fill="none"
        stroke="url(#flightcheck-mark)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#flightcheck-glow)"
      />
      <circle cx="47" cy="20" r="4" fill="#5df2a6" />
      <circle cx="47" cy="43" r="4" fill="#47d9ff" />
    </svg>
  );
}
