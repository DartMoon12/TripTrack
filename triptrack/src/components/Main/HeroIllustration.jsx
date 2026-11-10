// Ilustrace pro úvodní stránku – "mapa" s trasou nakreslená v SVG.
// Má pár kB místo původních 3 MB a barvy se řídí světlým/tmavým režimem.
import { FaClock, FaRulerHorizontal } from 'react-icons/fa';

export default function HeroIllustration() {
  return (
    <div className="hero-art" aria-hidden="true">
      <svg viewBox="0 0 560 440" className="hero-map">
        <defs>
          <pattern id="hero-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" className="hero-grid-line" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="560" height="440" rx="28" className="hero-map-bg" />
        <rect x="0" y="0" width="560" height="440" rx="28" fill="url(#hero-grid)" />

        {/* řeka, park a jezero */}
        <path d="M-10 300 C 90 260, 140 340, 240 310 S 420 230, 570 270" className="hero-water" />
        <ellipse cx="455" cy="110" rx="70" ry="44" className="hero-lake" />
        <path d="M40 60 h120 a20 20 0 0 1 20 20 v60 a20 20 0 0 1 -20 20 h-120 a20 20 0 0 1 -20 -20 v-60 a20 20 0 0 1 20 -20z" className="hero-park" />

        {/* silnice */}
        <path d="M0 200 H560" className="hero-road" />
        <path d="M300 0 V440" className="hero-road" />
        <path d="M0 400 L560 140" className="hero-road thin" />

        {/* trasa */}
        <path
          d="M90 360 C 130 300, 170 300, 210 250 S 260 170, 320 180 S 400 150, 440 90"
          className="hero-route-shadow"
        />
        <path
          d="M90 360 C 130 300, 170 300, 210 250 S 260 170, 320 180 S 400 150, 440 90"
          className="hero-route"
        />

        {/* body trasy */}
        {[[90, 360, '1'], [210, 250, '2'], [320, 180, '3']].map(([x, y, n]) => (
          <g key={n} transform={`translate(${x} ${y})`}>
            <circle r="15" className="hero-point" />
            <text y="5" textAnchor="middle" className="hero-point-label">{n}</text>
          </g>
        ))}

        {/* cíl */}
        <g transform="translate(440 90)">
          <path d="M0 -38 c-12 0 -21 9 -21 20 0 15 21 34 21 34 s21 -19 21 -34 c0 -11 -9 -20 -21 -20z" className="hero-pin" />
          <circle cy="-18" r="7" fill="#fff" />
        </g>
      </svg>

      {/* plovoucí karty */}
      <div className="hero-float hero-float-stats">
        <span className="hero-float-title">Víkend v Českém ráji</span>
        <div className="d-flex gap-3 mt-1">
          <span><FaRulerHorizontal /> 18,4 km</span>
          <span><FaClock /> 4 h 35 min</span>
        </div>
      </div>
      <div className="hero-float hero-float-rating">
        <span className="hero-stars">★★★★★</span>
        <span className="small">„Krásné výhledy!“</span>
      </div>
    </div>
  );
}
