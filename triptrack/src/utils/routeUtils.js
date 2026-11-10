// src/utils/routeUtils.js
// Pomocné funkce pro práci s trasami – formátování, fotky a export GPX.

export const TRAVEL_MODES = {
  DRIVING: { label: 'Auto', emoji: '🚗' },
  WALKING: { label: 'Chůze', emoji: '🚶' },
  BICYCLING: { label: 'Kolo', emoji: '🚲' },
  TRANSIT: { label: 'MHD', emoji: '🚌' },
};

export const AVAILABLE_TAGS = [
  'Příroda', 'Město', 'Pro rodiny', 'Náročná',
  'Vyhlídka', 'Asfalt', 'Dobrodružství', 'Pro kočárek',
  'Kolo', 'Běh', 'Pro vozíčkáře',
];

export function travelModeLabel(mode) {
  const m = TRAVEL_MODES[mode];
  return m ? `${m.emoji} ${m.label}` : mode || '';
}

// "12 345" metrů -> "12,3 km"
export function formatDistance(meters) {
  if (meters == null || Number.isNaN(meters)) return '–';
  if (meters < 1000) return `${Math.round(meters)} m`;
  // cs-CZ formát: "2 195,8 km" (mezera po tisících, desetinná čárka)
  return `${(meters / 1000).toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
}

// 5400 sekund -> "1 h 30 min"
export function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return '–';
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${Math.max(m, 1)} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// Starší trasy mají vzdálenost jen jako text ("12,3 km" / "450 m").
// Pro statistiky a řazení ji převedeme zpět na metry.
export function distanceToMeters(route) {
  if (typeof route?.distanceMeters === 'number') return route.distanceMeters;
  const text = String(route?.distance || '').replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(text);
  if (Number.isNaN(num)) return 0;
  return text.endsWith('km') ? num * 1000 : num;
}

export function parsePoints(points) {
  if (Array.isArray(points)) return points;
  if (typeof points === 'string') {
    try {
      const parsed = JSON.parse(points);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// Zmenší fotku v prohlížeči (canvas) a převede ji na JPEG.
// Fotka z mobilu má klidně 4 MB – po zmenšení na 1280 px má ~150 kB,
// takže se vejde do dokumentu ve Firestore (limit 1 MB) a trasy se rychle načítají.
export function compressImage(file, { maxSize = 1280, quality = 0.8 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Soubor není obrázek.'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Obrázek se nepodařilo načíst.'));
    };
    img.src = url;
  });
}

function escapeXml(text) {
  return String(text ?? '').replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[c]));
}

// Vytvoří GPX soubor (formát pro navigace, Garmin, Mapy.cz, Strava…).
// waypoints = body zadané uživatelem, track = přesná linie trasy z Google.
export function buildGpx({ name, description, waypoints = [], track = [] }) {
  const wpts = waypoints
    .map((p, i) => `  <wpt lat="${p.lat}" lon="${p.lng}"><name>Bod ${i + 1}</name></wpt>`)
    .join('\n');
  const line = (track.length ? track : waypoints)
    .map((p) => `      <trkpt lat="${p.lat}" lon="${p.lng}" />`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TripTrack" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${escapeXml(name)}</name><desc>${escapeXml(description)}</desc></metadata>
${wpts}
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>
${line}
    </trkseg>
  </trk>
</gpx>
`;
}

export function downloadTextFile(filename, content, type = 'application/gpx+xml') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function slugify(text) {
  return String(text || 'trasa')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'trasa';
}

// Dekódování "encoded polyline" (formát Googlu pro linii trasy) bez načítání Google Maps.
// Používá se pro miniatury tras v seznamu. Popis formátu:
// https://developers.google.com/maps/documentation/utilities/polylinealgorithm
export function decodePolyline(encoded) {
  if (!encoded || typeof encoded !== 'string') return [];
  const points = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    for (const axis of ['lat', 'lng']) {
      let result = 0, shift = 0, byte;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20 && index < encoded.length);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === 'lat') lat += delta; else lng += delta;
    }
    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}
