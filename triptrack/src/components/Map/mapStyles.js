// Tmavý vzhled mapy (Google Maps "styles")
export const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2129' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2129' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a919c' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d6a77a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#a0896f' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1e2b24' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c323d' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#20252e' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4a4034' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#2a241d' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#262b34' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#14243a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6a8a' }] },
];
