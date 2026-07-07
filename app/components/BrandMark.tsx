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
        <linearGradient id="flightcheck-mark" x1="12" y1="16" x2="52" y2="48">
          <stop stopColor="#f8fafc" />
          <stop offset="0.55" stopColor="#9fffc7" />
          <stop offset="1" stopColor="#31e981" />
        </linearGradient>
      </defs>
      <rect x="5" y="5" width="54" height="54" rx="18" fill="#050505" stroke="#2b2f2c" />
      <path
        d="M16 22h22c6 0 10 4 10 10s-4 10-10 10H16"
        fill="none"
        stroke="url(#flightcheck-mark)"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 32h18"
        fill="none"
        stroke="#f8fafc"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <path
        d="M16 42h18"
        fill="none"
        stroke="#31e981"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <circle cx="48" cy="32" r="4.5" fill="#31e981" />
    </svg>
  );
}
