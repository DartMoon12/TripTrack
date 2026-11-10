// Logo TripTrack – vektorové, takže je ostré v každé velikosti a nic nestahuje.
export default function Logo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="tt-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f59a4a" />
          <stop offset="1" stopColor="#d9621c" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#tt-logo-g)" />
      <path
        d="M11 36c4-1 6-4 9-7s6-4 9-3"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="0.1 5"
        opacity="0.9"
      />
      <circle cx="11" cy="36" r="3" fill="#fff" />
      <path
        d="M33 9c-4.4 0-8 3.4-8 7.7 0 5.6 8 13.3 8 13.3s8-7.7 8-13.3C41 12.4 37.4 9 33 9z"
        fill="#fff"
      />
      <circle cx="33" cy="16.8" r="3" fill="#e2702a" />
    </svg>
  );
}
