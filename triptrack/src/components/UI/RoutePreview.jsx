// Miniatura tvaru trasy z uložených bodů – čisté SVG, žádné volání Google API.
import { useMemo } from 'react';
import { decodePolyline } from '../../utils/routeUtils';

// points = body zadané uživatelem, polyline = skutečná linie po silnici (pokud je uložená)
export default function RoutePreview({ points = [], polyline }) {
  const shape = useMemo(() => {
    if (points.length < 2) return null;
    const track = decodePolyline(polyline);
    const line = track.length > 1 ? track : points;
    // hranice počítáme z linie i bodů, aby se vešlo obojí
    const all = [...line, ...points];
    const lats = all.map((p) => p.lat);
    const lngs = all.map((p) => p.lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const W = 320, H = 180, pad = 28;
    // zachovat poměr stran, aby trasa nebyla zdeformovaná
    const spanLng = Math.max(maxLng - minLng, 1e-6);
    const spanLat = Math.max(maxLat - minLat, 1e-6);
    const scale = Math.min((W - pad * 2) / spanLng, (H - pad * 2) / spanLat);
    const offX = (W - spanLng * scale) / 2;
    const offY = (H - spanLat * scale) / 2;
    const project = (p) => [
      offX + (p.lng - minLng) * scale,
      H - (offY + (p.lat - minLat) * scale),
    ];
    const xy = points.map(project);
    const d = line.map(project).map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    return { W, H, xy, d };
  }, [points, polyline]);

  return (
    <div className="route-preview" aria-hidden="true">
      {shape ? (
        <svg viewBox={`0 0 ${shape.W} ${shape.H}`} preserveAspectRatio="xMidYMid meet">
          <path d={shape.d} className="route-preview-shadow" />
          <path d={shape.d} className="route-preview-line" />
          {shape.xy.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i === 0 || i === shape.xy.length - 1 ? 6 : 3.5}
              className={i === 0 ? 'start' : i === shape.xy.length - 1 ? 'end' : 'mid'}
            />
          ))}
        </svg>
      ) : (
        <span className="route-preview-empty">Bez náhledu</span>
      )}
    </div>
  );
}
