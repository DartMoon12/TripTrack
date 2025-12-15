// src/components/Map/TripMap.jsx

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    GoogleMap,
    useLoadScript,
    Marker,
    Polyline,
    Autocomplete,
    DirectionsService,
    DirectionsRenderer
} from "@react-google-maps/api";
import { useRoutesStorage } from '../../Hooks/RouteStorageContext';
import "./TripMap.css";
import toast from 'react-hot-toast';

const mapKey = import.meta.env.VITE_MAP_KEY;

// 💥 OPRAVA: Odstraněno "directions" (je to core součást, nenačítá se jako library)
const libraries = ["places"];

const center = {
  lat: 50.0755, // Praha
  lng: 14.4378,
};

const TRAVEL_MODES = {
  DRIVING: '🚗 Auto',
  WALKING: '🚶 Chůze',
  BICYCLING: '🚲 Kolo',
  TRANSIT: '🚌 MHD',
};

export default function TripMap() {
  const [path, setPath] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [marker, setMarker] = useState(null);

  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [isCalculated, setIsCalculated] = useState(false);

  // Stavy pro modální okno
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [routeName, setRouteName] = useState("");
  const [routeDescription, setRouteDescription] = useState("");
  const [makePublic, setMakePublic] = useState(false);

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  const { saveRoute, getRouteById } = useRoutesStorage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: mapKey,
    libraries: libraries,
  });

  const hasStartAndEnd = path.length >= 2;

  // Efekt pro načtení trasy z URL
  useEffect(() => {
    if (isLoaded) {
      const routeId = searchParams.get('routeId');
      if (routeId) {
        const routeToLoad = getRouteById(routeId);
        if (routeToLoad) {
          setPath(routeToLoad.points);
          setTravelMode(routeToLoad.mode || 'DRIVING');
          setRouteInfo({
            distance: routeToLoad.distance,
            duration: routeToLoad.duration,
            mode: routeToLoad.mode,
          });
          setIsCalculated(false);
        } else {
          toast.error("Požadovaná trasa nebyla nalezena.");
        }
      }
    }
  }, [searchParams, getRouteById, isLoaded]);

  // Handler pro kliknutí na mapu
  const handleClick = (e) => {
    const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setPath((prev) => [...prev, newPoint]);
    setDirections(null);
    setRouteInfo(null);
    setIsCalculated(false);
  };

  // Handler pro Autocomplete
   const handlePlaceChanged = () => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;
    const place = autocomplete.getPlace?.();
    if (!place || !place.geometry?.location) {
      console.warn("No place selected or geometry unavailable");
      return;
    }
    const location = place.geometry.location;
    const newCenter = { lat: location.lat(), lng: location.lng() };
    setMarker(newCenter);
    setSearchValue(place.formatted_address || searchValue);
    if (mapRef.current) {
      mapRef.current.panTo(newCenter);
      mapRef.current.setZoom(14);
    }
  };

  // Callback pro Directions API
  const directionsCallback = useCallback((result, status) => {
    setIsCalculated(true);
    
    if (status === 'OK' && result) {
      setDirections(result);
      const leg = result.routes[0].legs[0];
      setRouteInfo({
        distance: leg.distance.text,
        duration: leg.duration.text,
        mode: travelMode,
      });
    } else if (status === 'ZERO_RESULTS') {
        // 💥 VYLEPŠENÍ: Jasná hláška pro uživatele
        const modeName = TRAVEL_MODES[travelMode];
        toast.error(`Google nenašel trasu pro "${modeName}". Zkuste posunout body blíže k silnici/stezce.`);
        
        setRouteInfo({ distance: 'Trasa nenalezena', duration: 'N/A', mode: travelMode });
        setDirections(null);
    } else {
      console.error('Directions request failed due to ' + status);
      setRouteInfo({ distance: 'Chyba API', duration: 'N/A', mode: travelMode });
      setDirections(null);
    }
  }, [travelMode]);

  // Funkce pro spuštění výpočtu
  const calculateRoute = () => {
    if (path.length < 2) {
      toast.error("Pro výpočet trasy potřebuješ alespoň 2 body.");
      return;
    }
    setDirections(null);
    setRouteInfo(null);
    setIsCalculated(false);
    setMarker(null);
  };

  // Funkce pro vymazání mapy
  const clearMap = () => {
    setPath([]);
    setMarker(null);
    setSearchValue("");
    setDirections(null);
    setRouteInfo(null);
    setTravelMode('DRIVING');
    setIsCalculated(false);
    setShowSaveModal(false);
    navigate('/mapa', { replace: true });
  };

  // Funkce pro otevření modálu
  const openSaveModal = () => {
    if (!routeInfo || routeInfo.distance.includes('Chyba') || routeInfo.distance.includes('nenalezena')) {
        toast.error("Nelze uložit trasu, která nebyla úspěšně nalezena.");
        return;
    }
    setRouteName(`${TRAVEL_MODES[travelMode]} trasa`);
    setRouteDescription("");
    setMakePublic(false);
    setShowSaveModal(true);
  };

  // Funkce pro potvrzení uložení z modálu
  const handleConfirmSave = (e) => {
    e.preventDefault();
    if (!routeName) {
      toast.error("Prosím, zadejte název trasy.");
      return;
    }
    const newRouteData = {
        name: routeName,
        description: routeDescription,
        points: path,
        distance: routeInfo.distance,
        duration: routeInfo.duration,
        mode: routeInfo.mode,
    };
    saveRoute(newRouteData, makePublic);
    toast.success(`Trasa "${routeName}" uložena ${makePublic ? '(i veřejně)' : ''}!`);
    setShowSaveModal(false);
    navigate('/trasa');
  };

  // Funkce pro zrušení uložení z modálu
  const handleCancelSave = () => {
    setShowSaveModal(false);
  };

  if (loadError) {
    console.error("Google Maps Load Error:", loadError);
    return <div>Chyba při načítání mapy. Zkontrolujte API klíč a konzoli.</div>;
  }
  if (!isLoaded) {
    return <div className="map-loading-spinner">Načítám mapu...</div>;
  }

  return (
    <div className="map-wrapper">
      {/* --- SEARCH BAR --- */}
      <div className="map-search-panel shadow-lg d-flex align-items-center gap-3">
        <div style={{ flex: '2' }}>
          <Autocomplete
            onLoad={(ac) => (autocompleteRef.current = ac)}
            onPlaceChanged={handlePlaceChanged}
          >
            <input
              type="text"
              placeholder="🔍 Hledat místo nebo adresu..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="form-control map-search-input"
            />
          </Autocomplete>
        </div>
        <div style={{ flex: '1' }}>
          <select
              className="form-select map-search-input"
              value={travelMode}
              onChange={(e) => {
                  setTravelMode(e.target.value);
                  setDirections(null);
                  setRouteInfo(null);
                  setIsCalculated(false);
              }}
          >
              {Object.entries(TRAVEL_MODES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
              ))}
          </select>
        </div>
        <div className="d-flex gap-2">
          {hasStartAndEnd && !isCalculated && (
              <button onClick={calculateRoute} className="btn btn-info">
                  Vypočítat (km)
              </button>
          )}
          {routeInfo && (
            <div
              className={`alert py-2 px-3 m-0 d-flex align-items-center fw-bold ${routeInfo.distance.includes('Chyba') || routeInfo.distance.includes('nenalezena') ? 'alert-warning' : 'alert-success'}`}
            >
              {routeInfo.distance} | {routeInfo.duration}
            </div>
          )}
          {routeInfo && !routeInfo.distance.includes('Chyba') && !routeInfo.distance.includes('nenalezena') && (
              <button onClick={openSaveModal} className="btn btn-dark">
                  Uložit trasu
              </button>
          )}
          <button onClick={clearMap} className="btn btn-danger">
            Vymazat
          </button>
        </div>
      </div>

      {/* --- MAPA --- */}
      <GoogleMap
        mapContainerClassName="map-container"
        center={center}
        zoom={12}
        onClick={handleClick}
        onLoad={(map) => (mapRef.current = map)}
      >
        {marker && <Marker position={marker} />}
        {hasStartAndEnd && !directions && !isCalculated && (
          <DirectionsService
            options={{
              destination: path[path.length - 1],
              origin: path[0],
              waypoints: path.slice(1, -1).map(p => ({ location: p, stopover: true })),
              travelMode: travelMode,
            }}
            callback={directionsCallback}
          />
        )}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: { strokeColor: '#e77e23', strokeWeight: 4 },
              suppressMarkers: true,
            }}
          />
        )}
        {path.map((pos, idx) => (
          <Marker key={idx} position={pos} />
        ))}
        {!directions && hasStartAndEnd && <Polyline path={path} options={{ strokeColor: "#e77e23", strokeWeight: 2, strokeOpacity: 0.5 }} />}
      </GoogleMap>

      {/* --- MODÁL PRO ULOŽENÍ --- */}
      {showSaveModal && (
        <div className="save-modal-overlay">
          <div className="save-modal-card card shadow-lg">
            <div className="card-body p-4">
              <h4 className="text-primary-dark fw-bold mb-3">Uložit trasu</h4>
              <p className="text-muted mb-4">Zadejte podrobnosti o vaší nové trase.</p>
              <form onSubmit={handleConfirmSave}>
                <div className="mb-3">
                  <label htmlFor="routeName" className="form-label">Název trasy</label>
                  <input
                    type="text"
                    className="form-control"
                    id="routeName"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="routeDesc" className="form-label">Popis (volitelný)</label>
                  <textarea
                    className="form-control"
                    id="routeDesc"
                    rows="3"
                    placeholder="Např. 'Pěkná víkendová projížďka kolem řeky...'"
                    value={routeDescription}
                    onChange={(e) => setRouteDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="form-check mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="makePublicCheckbox"
                    checked={makePublic}
                    onChange={(e) => setMakePublic(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="makePublicCheckbox">
                    Zveřejnit tuto trasu pro ostatní?
                  </label>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-outline-secondary" onClick={handleCancelSave}>
                    Zrušit
                  </button>
                  <button type="submit" className="btn btn-dark">
                    Uložit trasu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}