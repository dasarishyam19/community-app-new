export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="95" fill="url(#gradient)" />

      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      {/* Connection nodes - representing people/areas */}
      <g fill="white">
        {/* Center node */}
        <circle cx="100" cy="100" r="20" />

        {/* Surrounding nodes in a hexagon pattern */}
        <circle cx="100" cy="55" r="12" />
        <circle cx="139" cy="77.5" r="12" />
        <circle cx="139" cy="122.5" r="12" />
        <circle cx="100" cy="145" r="12" />
        <circle cx="61" cy="122.5" r="12" />
        <circle cx="61" cy="77.5" r="12" />
      </g>

      {/* Connection lines */}
      <g stroke="white" strokeWidth="3" opacity="0.8">
        <line x1="100" y1="100" x2="100" y2="55" />
        <line x1="100" y1="100" x2="139" y2="77.5" />
        <line x1="100" y1="100" x2="139" y2="122.5" />
        <line x1="100" y1="100" x2="100" y2="145" />
        <line x1="100" y1="100" x2="61" y2="122.5" />
        <line x1="100" y1="100" x2="61" y2="77.5" />
      </g>

      {/* Hash symbol # */}
      <g fill="white" fontWeight="bold" fontSize="36" fontFamily="Arial, sans-serif">
        <text x="100" y="108" textAnchor="middle" dominantBaseline="middle">#</text>
      </g>
    </svg>
  );
}
