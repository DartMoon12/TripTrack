// src/components/Map/TripMap.jsx
// Plánovač tras na Google mapě.
//
// Šetření API (kvůli bezplatnému limitu):
//  - trasa se přepočítá až 0,7 s po poslední změně, ne po každém kliknutí,
//  - uložená trasa si pamatuje linii (polyline), takže její zobrazení
//    nevolá Directions API vůbec.

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleMap, useLoadScript, MarkerF as Marker, PolylineF as Polyline, Autocomplete } from '@react-google-maps/api';
// MarkerF/PolylineF = verze komponent, které fungují s React 18+ (StrictMode). Obyčejný Marker se nevykreslí.
import toast from 'react-hot-toast';
import {
  FaSearch, FaUndo, FaTrashAlt, FaTimes, FaSave, FaFileExport, FaShareAlt,
  FaLocationArrow, FaChevronUp, FaChevronDown, FaPlus, FaRulerHorizontal, FaClock, FaMousePointer,
} from 'react-icons/fa';
import { useRoutesStorage } from '../../Hooks/RouteStorageContext';
import { useTheme } from '../Theme/ThemeContext';
import { darkMapStyle } from './mapStyles';
import SaveRouteModal from './SaveRouteModal';
import {
  TRAVEL_MODES, formatDistance, formatDuration, distanceToMeters,
  buildGpx, downloadTextFile, slugify,
} from '../../utils/routeUtils';
import { copyRouteLink } from '../../utils/share';
import './TripMap.css';

const MAP_KEY = import.meta.env.VITE_MAP_KEY;
const LIBRARIES = ['places', 'geometry']; // musí být konstanta mimo komponentu
const DEFAULT_CENTER = { lat: 50.0755, lng: 14.4378 }; // Praha
const RECALC_DELAY = 700;
const ACCENT = '#e8772e';

const toLatLngLiteral = (p) => ({ lat: p.lat(), lng: p.lng() });

export default function TripMap() {
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: MAP_KEY, libraries: LIBRARIES });

  const { theme } = useTheme();
  const { saveRoute, fetchRouteById } = useRoutesStorage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeIdParam = searchParams.get('routeId');

  const [path, setPath] = useState([]);
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [directions, setDirections] = useState(null);
  const [savedTrack, setSavedTrack] = useState(null); // linie načtené uložené trasy
  const [routeInfo, setRouteInfo] = useState(null); // { distanceMeters, durationSeconds }
  const [status, setStatus] = useState('idle'); // idle | loading | error | notfound
  const [loadedRoute, setLoadedRoute] = useState(null);
  const [searchPlace, setSearchPlace] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // upravil uživatel načtenou trasu?

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const requestIdRef = useRef(0);
  const loadedRouteIdRef = useRef(null);

  const fitToPoints = useCallback((points) => {
    const map = mapRef.current;
    if (!map || !window.google || points.length === 0) return;
    if (points.length === 1) { map.panTo(points[0]); map.setZoom(14); return; }
    const bounds = new window.google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p));
    // na desktopu je vlevo panel, tak mapu odsadíme
    const wide = window.innerWidth >= 768;
    map.fitBounds(bounds, wide ? { top: 60, right: 60, bottom: 60, left: 420 } : 50);
  }, []);

  // Jakákoli úprava bodů nebo dopravy zahodí uloženou linii → trasa se přepočítá
  const editPath = useCallback((updater) => {
    setSavedTrack(null);
    setIsDirty(true);
    setPath(updater);
  }, []);

  // ---------- Načtení uložené / sdílené trasy z URL (?routeId=...) ----------
  useEffect(() => {
    if (!isLoaded || !routeIdParam || loadedRouteIdRef.current === routeIdParam) return;
    loadedRouteIdRef.current = routeIdParam;

    fetchRouteById(routeIdParam).then((route) => {
      if (!route) {
        toast.error('Trasa nebyla nalezena nebo k ní nemáte přístup.');
        return;
      }
      const points = route.points || [];
      setLoadedRoute(route);
      setIsDirty(false);
      setTravelMode(route.mode && TRAVEL_MODES[route.mode] ? route.mode : 'DRIVING');
      setDirections(null);

      if (route.polyline && window.google?.maps?.geometry) {
        // Uložená linie → žádné volání Directions API
        const track = window.google.maps.geometry.encoding.decodePath(route.polyline).map(toLatLngLiteral);
        setSavedTrack(track);
        setRouteInfo({
          distanceMeters: route.distanceMeters ?? distanceToMeters(route),
          durationSeconds: route.durationSeconds ?? null,
          durationText: route.duration,
        });
        setStatus('idle');
      } else {
        setSavedTrack(null); // starší trasa bez linie – spočítá se znovu
      }
      setPath(points);
      // počkat na vykreslení mapy, pak přiblížit na trasu
      setTimeout(() => fitToPoints(points), 50);
    });
  }, [isLoaded, routeIdParam, fetchRouteById, fitToPoints]);

  // ---------- Výpočet trasy (s prodlevou) ----------
  useEffect(() => {
    if (!isLoaded) return undefined;
    if (path.length < 2) {
      setDirections(null);
      if (!savedTrack) setRouteInfo(null);
      setStatus('idle');
      return undefined;
    }
    if (savedTrack) return undefined;

    setStatus('loading');
    const requestId = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      const g = window.google.maps;
      // MHD neumí mezizastávky – použijeme jen start a cíl
      const useWaypoints = path.length > 2 && travelMode !== 'TRANSIT';
      try {
        const result = await new g.DirectionsService().route({
          origin: path[0],
          destination: path[path.length - 1],
          waypoints: useWaypoints ? path.slice(1, -1).map((p) => ({ location: p, stopover: true })) : [],
          travelMode: g.TravelMode[travelMode],
        });
        if (requestId !== requestIdRef.current) return; // mezitím přišla novější změna
        const legs = result.routes[0].legs;
        setDirections(result);
        setRouteInfo({
          distanceMeters: legs.reduce((s, l) => s + l.distance.value, 0),
          durationSeconds: legs.reduce((s, l) => s + l.duration.value, 0),
        });
        setStatus('idle');
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setDirections(null);
        setRouteInfo(null);
        if (err?.code === 'ZERO_RESULTS') {
          if (travelMode === 'BICYCLING') {
            toast('Pro kolo tu Google trasu nezná – přepínám na chůzi.', { icon: '🚶' });
            setTravelMode('WALKING');
            return;
          }
          setStatus('notfound');
        } else if (err?.code === 'OVER_QUERY_LIMIT') {
          toast.error('Denní limit výpočtů tras je vyčerpán. Zkuste to zítra.');
          setStatus('error');
        } else {
          console.error('Directions error:', err);
          setStatus('error');
        }
      }
    }, RECALC_DELAY);

    return () => clearTimeout(timer);
  }, [path, travelMode, isLoaded, savedTrack]);

  // ---------- Úpravy bodů ----------
  const handleMapClick = (e) => {
    editPath((prev) => [...prev, toLatLngLiteral(e.latLng)]);
  };

  const movePoint = (index, latLng) => {
    editPath((prev) => prev.map((p, i) => (i === index ? toLatLngLiteral(latLng) : p)));
  };

  const removePoint = (index) => {
    editPath((prev) => prev.filter((_, i) => i !== index));
  };

  const undo = useCallback(() => {
    editPath((prev) => prev.slice(0, -1));
  }, [editPath]);

  const clearAll = () => {
    requestIdRef.current += 1;
    setPath([]);
    setSavedTrack(null);
    setDirections(null);
    setRouteInfo(null);
    setStatus('idle');
    setSearchPlace(null);
    setSearchValue('');
    setLoadedRoute(null);
    loadedRouteIdRef.current = null;
    navigate('/mapa', { replace: true });
  };

  const changeMode = (mode) => {
    if (mode === travelMode) return;
    setSavedTrack(null);
    setIsDirty(true);
    setTravelMode(mode);
  };

  // Ctrl/Cmd + Z = zpět
  useEffect(() => {
    const onKey = (e) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !typing && !showSave) {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, showSave]);

  // ---------- Vyhledávání ----------
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace?.();
    if (!place?.geometry?.location) return;
    const position = toLatLngLiteral(place.geometry.location);
    setSearchPlace({ position, address: place.formatted_address || searchValue });
    setSearchValue(place.formatted_address || searchValue);
    mapRef.current?.panTo(position);
    mapRef.current?.setZoom(14);
  };

  const addSearchPlace = () => {
    if (!searchPlace) return;
    editPath((prev) => [...prev, searchPlace.position]);
    setSearchPlace(null);
    setSearchValue('');
  };

  const locateMe = () => {
    if (!navigator.geolocation) { toast.error('Prohlížeč nepodporuje zjištění polohy.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapRef.current?.panTo(p);
        mapRef.current?.setZoom(15);
        setSearchPlace({ position: p, address: 'Moje poloha' });
      },
      () => toast.error('Polohu se nepodařilo zjistit.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // ---------- Odvozené hodnoty ----------
  const track = useMemo(() => {
    if (savedTrack) return savedTrack;
    if (directions) return directions.routes[0].overview_path.map(toLatLngLiteral);
    return null;
  }, [savedTrack, directions]);

  const polyline = directions?.routes[0]?.overview_polyline || (savedTrack ? loadedRoute?.polyline : null);
  const hasRoute = path.length >= 2 && !!routeInfo && status === 'idle';
  const distanceText = routeInfo ? formatDistance(routeInfo.distanceMeters) : '–';
  const durationText = routeInfo
    ? (routeInfo.durationSeconds != null ? formatDuration(routeInfo.durationSeconds) : routeInfo.durationText || '–')
    : '–';

  const shareId = loadedRoute && !isDirty
    ? (loadedRoute.isPublic ? loadedRoute.id : loadedRoute.publicId)
    : null;

  // ---------- Akce ----------
  const exportGpx = () => {
    const name = loadedRoute?.name || `${TRAVEL_MODES[travelMode].label} trasa`;
    downloadTextFile(`${slugify(name)}.gpx`, buildGpx({
      name,
      description: `${distanceText}, ${durationText}`,
      waypoints: path,
      track: track || [],
    }));
    toast.success('GPX staženo');
  };

  const handleSave = async ({ name, description, tags, image, makePublic }) => {
    try {
      await saveRoute({
        name,
        description,
        tags,
        image,
        points: path,
        mode: travelMode,
        distance: distanceText,
        duration: durationText,
        distanceMeters: Math.round(routeInfo.distanceMeters),
        durationSeconds: routeInfo.durationSeconds ?? null,
        polyline: polyline || null,
      }, makePublic);
      toast.success(`Trasa „${name}“ uložena`);
      setShowSave(false);
      navigate('/trasa');
      return true;
    } catch (err) {
      console.error('Uložení trasy selhalo:', err);
      toast.error('Trasu se nepodařilo uložit. Zkuste to znovu.');
      return false;
    }
  };

  const mapOptions = useMemo(() => ({
    styles: theme === 'dark' ? darkMapStyle : null,
    disableDefaultUI: true,
    // na mobilu se zoomuje prsty a tlačítka by zasahovala pod spodní panel
    zoomControl: window.innerWidth >= 768,
    clickableIcons: false,
    gestureHandling: 'greedy',
  }), [theme]);

  const markerIcon = useCallback((index, total) => {
    const isStart = index === 0;
    const isEnd = index === total - 1 && total > 1;
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: isStart || isEnd ? 13 : 11,
      fillColor: isStart ? '#1f9d6b' : isEnd ? ACCENT : '#1c2b45',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
    };
  }, []);

  if (loadError) {
    return (
      <div className="container py-5">
        <div className="empty-state">
          <h4>Mapu se nepodařilo načíst</h4>
          <p>Zkontrolujte připojení k internetu nebo klíč VITE_MAP_KEY.</p>
        </div>
      </div>
    );
  }
  if (!isLoaded) return <div className="page-loader"><span className="spinner" /></div>;

  const modeKeys = Object.keys(TRAVEL_MODES);

  return (
    <div className="map-page">
      <GoogleMap
        mapContainerClassName="map-canvas"
        center={DEFAULT_CENTER}
        zoom={12}
        onClick={handleMapClick}
        onLoad={(map) => { mapRef.current = map; }}
        options={mapOptions}
      >
        {searchPlace && (
          <Marker
            position={searchPlace.position}
            title={searchPlace.address}
            onClick={addSearchPlace}
            zIndex={1}
          />
        )}

        {track && (
          <>
            <Polyline path={track} options={{ strokeColor: '#ffffff', strokeWeight: 9, strokeOpacity: theme === 'dark' ? 0.25 : 0.9, zIndex: 1 }} />
            <Polyline path={track} options={{ strokeColor: ACCENT, strokeWeight: 5, strokeOpacity: 1, zIndex: 2 }} />
          </>
        )}

        {!track && path.length >= 2 && (
          <Polyline
            path={path}
            options={{
              strokeOpacity: 0,
              zIndex: 1,
              icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.8, strokeColor: ACCENT, scale: 3 }, offset: '0', repeat: '14px' }],
            }}
          />
        )}

        {path.map((pos, idx) => (
          <Marker
            key={`${idx}-${pos.lat}-${pos.lng}`}
            position={pos}
            draggable
            onDragEnd={(e) => movePoint(idx, e.latLng)}
            onRightClick={() => removePoint(idx)}
            icon={markerIcon(idx, path.length)}
            label={{ text: String(idx + 1), color: '#ffffff', fontWeight: '800', fontSize: '12px' }}
            title={`Bod ${idx + 1} – přetažením posunete, pravým tlačítkem smažete`}
            zIndex={10 + idx}
          />
        ))}
      </GoogleMap>

      {/* ---------- Panel ---------- */}
      <aside className={`map-panel ${panelOpen ? 'is-open' : ''}`} aria-label="Plánovač trasy">
        <button type="button" className="map-panel-handle" onClick={() => setPanelOpen((o) => !o)} aria-expanded={panelOpen}>
          <span className="handle-bar" />
          <span className="d-flex align-items-center gap-2 fw-bold">
            {hasRoute ? <>{distanceText} · {durationText}</> : path.length ? `${path.length} ${path.length === 1 ? 'bod' : path.length < 5 ? 'body' : 'bodů'}` : 'Naplánovat trasu'}
            {panelOpen ? <FaChevronDown size={12} /> : <FaChevronUp size={12} />}
          </span>
        </button>

        <div className="map-panel-body">
          {loadedRoute && (
            <div className="loaded-route">
              <div className="min-w-0">
                <span className="small text-muted d-block">{loadedRoute.isOwn ? 'Vaše trasa' : `Trasa od ${loadedRoute.userName || 'komunity'}`}</span>
                <strong className="text-truncate d-block">{loadedRoute.name}</strong>
              </div>
              <button type="button" className="icon-btn" onClick={clearAll} aria-label="Zavřít trasu" title="Zavřít a začít novou"><FaTimes /></button>
            </div>
          )}

          {/* Vyhledávání */}
          <div className="map-search">
            <FaSearch className="map-search-icon" />
            <Autocomplete
              onLoad={(ac) => { autocompleteRef.current = ac; }}
              onPlaceChanged={handlePlaceChanged}
              fields={['geometry', 'formatted_address']}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Hledat místo…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                aria-label="Hledat místo"
              />
            </Autocomplete>
          </div>
          {searchPlace && (
            <div className="search-result">
              <span className="text-truncate">{searchPlace.address}</span>
              <button type="button" className="btn btn-sm btn-accent flex-shrink-0" onClick={addSearchPlace}>
                <FaPlus size={10} className="me-1" /> Přidat bod
              </button>
            </div>
          )}

          {/* Způsob dopravy */}
          <div className="mode-picker" role="radiogroup" aria-label="Způsob dopravy">
            {modeKeys.map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={travelMode === key}
                className={travelMode === key ? 'active' : ''}
                onClick={() => changeMode(key)}
              >
                <span aria-hidden="true">{TRAVEL_MODES[key].emoji}</span>
                {TRAVEL_MODES[key].label}
              </button>
            ))}
          </div>
          {travelMode === 'TRANSIT' && path.length > 2 && (
            <p className="map-note">MHD neumí mezizastávky – počítá se jen ze startu do cíle.</p>
          )}

          {/* Body */}
          <div className="points-head">
            <span>Body trasy</span>
            <div className="d-flex gap-1">
              <button type="button" className="icon-btn sm" onClick={undo} disabled={!path.length} title="Zpět (Ctrl+Z)" aria-label="Odebrat poslední bod"><FaUndo size={12} /></button>
              <button type="button" className="icon-btn sm danger" onClick={clearAll} disabled={!path.length && !loadedRoute} title="Vymazat vše" aria-label="Vymazat vše"><FaTrashAlt size={12} /></button>
            </div>
          </div>

          {path.length === 0 ? (
            <div className="points-empty">
              <FaMousePointer />
              <span>Klikněte do mapy nebo vyhledejte místo. Body jdou přetahovat.</span>
            </div>
          ) : (
            <ol className="points-list">
              {path.map((p, i) => (
                <li key={`${i}-${p.lat}-${p.lng}`}>
                  <span className={`point-dot ${i === 0 ? 'start' : i === path.length - 1 && path.length > 1 ? 'end' : ''}`}>{i + 1}</span>
                  <span className="point-label">
                    <strong>{i === 0 ? 'Start' : i === path.length - 1 ? 'Cíl' : `Zastávka ${i}`}</strong>
                    <small>{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</small>
                  </span>
                  <button type="button" className="point-remove" onClick={() => removePoint(i)} aria-label={`Odebrat bod ${i + 1}`}><FaTimes size={11} /></button>
                </li>
              ))}
            </ol>
          )}

          {/* Výsledek */}
          {path.length >= 2 && (
            <div className={`route-summary ${status}`}>
              {status === 'loading' && <div className="d-flex align-items-center gap-2"><span className="spinner sm" /> Počítám trasu…</div>}
              {status === 'notfound' && <span>Trasu se nepodařilo najít. Zkuste jiný způsob dopravy nebo posuňte body.</span>}
              {status === 'error' && <span>Výpočet trasy selhal. Zkuste to prosím znovu.</span>}
              {hasRoute && (
                <div className="summary-stats">
                  <div><FaRulerHorizontal /><strong>{distanceText}</strong><small>vzdálenost</small></div>
                  <div><FaClock /><strong>{durationText}</strong><small>{TRAVEL_MODES[travelMode].label.toLowerCase()}</small></div>
                </div>
              )}
            </div>
          )}

          {hasRoute && (
            <div className="map-actions">
              <button type="button" className="btn btn-accent flex-grow-1" onClick={() => setShowSave(true)}>
                <FaSave className="me-2" />{loadedRoute ? 'Uložit jako novou' : 'Uložit trasu'}
              </button>
              <button type="button" className="icon-btn" onClick={exportGpx} title="Stáhnout GPX" aria-label="Stáhnout GPX"><FaFileExport /></button>
              {shareId && (
                <button type="button" className="icon-btn" onClick={() => copyRouteLink(shareId, loadedRoute.name)} title="Sdílet odkaz" aria-label="Sdílet odkaz"><FaShareAlt /></button>
              )}
            </div>
          )}
        </div>
      </aside>

      <button type="button" className="map-fab" onClick={locateMe} title="Moje poloha" aria-label="Najít moji polohu">
        <FaLocationArrow />
      </button>

      {showSave && (
        <SaveRouteModal
          defaultName={loadedRoute ? `${loadedRoute.name} (kopie)` : `${TRAVEL_MODES[travelMode].label} trasa`}
          routeInfo={{ distance: distanceText, duration: durationText }}
          onSave={handleSave}
          onClose={() => setShowSave(false)}
        />
      )}
    </div>
  );
}
