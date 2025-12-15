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
import { FaCamera } from 'react-icons/fa'; // 💥 Import ikonky pro obrázek

const mapKey = import.meta.env.VITE_MAP_KEY;
const libraries = ["places"];

const center = { lat: 50.0755, lng: 14.4378 };

const TRAVEL_MODES = {
  DRIVING: '🚗 Auto',
  WALKING: '🚶 Chůze',
  BICYCLING: '🚲 Kolo',
  TRANSIT: '🚌 MHD',
};

export default function TripMap() {
  // ... (stavy path, searchValue, marker, directions, routeInfo, travelMode, isCalculated zůstávají)
  const [path, setPath] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [marker, setMarker] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [isCalculated, setIsCalculated] = useState(false);

  // Stavy pro modál
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [routeName, setRouteName] = useState("");
  const [routeDescription, setRouteDescription] = useState("");
  const [makePublic, setMakePublic] = useState(false);
  
  // 💥 NOVÝ STAV: Pro obrázek
  const [selectedImage, setSelectedImage] = useState(null);

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

  // ... (useEffect a handlery handleClick, handlePlaceChanged, directionsCallback, calculateRoute, clearMap zůstávají stejné)
  
  // Zkráceno pro přehlednost - sem vlož všechny funkce z minula (useEffect, handleClick, atd...)
  // Použij kód z předchozí odpovědi pro tyto funkce
  useEffect(() => {
    if (isLoaded) {
      const routeId = searchParams.get('routeId');
      if (routeId) {
        const routeToLoad = getRouteById(routeId);
        if (routeToLoad) {
          setPath(routeToLoad.points);
          setTravelMode(routeToLoad.mode || 'DRIVING');
          setRouteInfo({ distance: routeToLoad.distance, duration: routeToLoad.duration, mode: routeToLoad.mode });
          setIsCalculated(false);
          // Pokud bys chtěl načítat i obrázek pro editaci, musel bys ho tu nastavit
        } else { toast.error("Požadovaná trasa nebyla nalezena."); }
      }
    }
  }, [searchParams, getRouteById, isLoaded]);

  const handleClick = (e) => {
    const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setPath((prev) => [...prev, newPoint]);
    setDirections(null); setRouteInfo(null); setIsCalculated(false);
  };
  
  const handlePlaceChanged = () => { /* ... kód z minula ... */ 
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;
    const place = autocomplete.getPlace?.();
    if (!place || !place.geometry?.location) return;
    const location = place.geometry.location;
    const newCenter = { lat: location.lat(), lng: location.lng() };
    setMarker(newCenter); setSearchValue(place.formatted_address || searchValue);
    if (mapRef.current) { mapRef.current.panTo(newCenter); mapRef.current.setZoom(14); }
  };

  const directionsCallback = useCallback((result, status) => { /* ... kód z minula ... */ 
    setIsCalculated(true);
    if (status === 'OK' && result) {
      setDirections(result);
      const leg = result.routes[0].legs[0];
      setRouteInfo({ distance: leg.distance.text, duration: leg.duration.text, mode: travelMode });
    } else if (status === 'ZERO_RESULTS') {
        setRouteInfo({ distance: 'Trasa nenalezena', duration: 'N/A', mode: travelMode }); setDirections(null);
    } else { setRouteInfo({ distance: 'Chyba API', duration: 'N/A', mode: travelMode }); setDirections(null); }
  }, [travelMode]);

  const calculateRoute = () => { /* ... */ 
    if (path.length < 2) { toast.error("Pro výpočet trasy potřebuješ alespoň 2 body."); return; }
    setDirections(null); setRouteInfo(null); setIsCalculated(false); setMarker(null);
  };

  const clearMap = () => {
    setPath([]); setMarker(null); setSearchValue(""); setDirections(null); setRouteInfo(null);
    setTravelMode('DRIVING'); setIsCalculated(false); setShowSaveModal(false);
    setSelectedImage(null); // Vyčistit obrázek
    navigate('/mapa', { replace: true });
  };

  // 💥 NOVÁ FUNKCE: Zpracování nahrání obrázku
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        // Kontrola velikosti (např. max 800KB)
        if (file.size > 800 * 1024) {
            toast.error("Obrázek je příliš velký! Maximální velikost je cca 800KB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result); // Uložíme Base64 string
        };
        reader.readAsDataURL(file);
    }
  };

  const openSaveModal = () => {
    if (!routeInfo || routeInfo.distance.includes('Chyba') || routeInfo.distance.includes('nenalezena')) {
        toast.error("Nelze uložit trasu, která nebyla úspěšně nalezena.");
        return;
    }
    setRouteName(`${TRAVEL_MODES[travelMode]} trasa`);
    setRouteDescription("");
    setMakePublic(false);
    setSelectedImage(null); // Reset obrázku při otevření
    setShowSaveModal(true);
  };

  const handleConfirmSave = (e) => {
    e.preventDefault();
    if (!routeName) { toast.error("Prosím, zadejte název trasy."); return; }
    
    const newRouteData = {
        name: routeName,
        description: routeDescription,
        points: path,
        distance: routeInfo.distance,
        duration: routeInfo.duration,
        mode: routeInfo.mode,
        // 💥 Přidáme obrázek do dat
        image: selectedImage 
    };
    
    saveRoute(newRouteData, makePublic);
    toast.success(`Trasa "${routeName}" uložena!`);
    setShowSaveModal(false);
    navigate('/trasa');
  };

  const handleCancelSave = () => { setShowSaveModal(false); };

  if (loadError) return <div>Chyba mapy.</div>;
  if (!isLoaded) return <div className="map-loading-spinner">Načítám mapu...</div>;

  return (
    <div className="map-wrapper">
      {/* ... (Search bar a Mapa zůstávají stejné) ... */}
      <div className="map-search-panel shadow-lg d-flex align-items-center gap-3">
        <div style={{ flex: '2' }}>
            <Autocomplete onLoad={(ac) => (autocompleteRef.current = ac)} onPlaceChanged={handlePlaceChanged}>
                <input type="text" placeholder="🔍 Hledat..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="form-control map-search-input" />
            </Autocomplete>
        </div>
        <div style={{ flex: '1' }}>
             <select className="form-select map-search-input" value={travelMode} onChange={(e) => { setTravelMode(e.target.value); setDirections(null); setRouteInfo(null); setIsCalculated(false); }}>
                {Object.entries(TRAVEL_MODES).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
             </select>
        </div>
        <div className="d-flex gap-2">
           {hasStartAndEnd && !isCalculated && (<button onClick={calculateRoute} className="btn btn-info">Vypočítat</button>)}
           {routeInfo && (<div className={`alert py-2 px-3 m-0 ${routeInfo.distance.includes('Chyba') ? 'alert-warning' : 'alert-success'}`}>{routeInfo.distance}</div>)}
           {routeInfo && !routeInfo.distance.includes('Chyba') && !routeInfo.distance.includes('nenalezena') && (<button onClick={openSaveModal} className="btn btn-dark">Uložit</button>)}
           <button onClick={clearMap} className="btn btn-danger">Vymazat</button>
        </div>
      </div>

      <GoogleMap mapContainerClassName="map-container" center={center} zoom={12} onClick={handleClick} onLoad={(map) => (mapRef.current = map)}>
         {marker && <Marker position={marker} />}
         {hasStartAndEnd && !directions && !isCalculated && (<DirectionsService options={{ destination: path[path.length - 1], origin: path[0], waypoints: path.slice(1, -1).map(p => ({ location: p, stopover: true })), travelMode: travelMode }} callback={directionsCallback} />)}
         {directions && (<DirectionsRenderer directions={directions} options={{ polylineOptions: { strokeColor: '#e77e23', strokeWeight: 4 }, suppressMarkers: true }} />)}
         {path.map((pos, idx) => (<Marker key={idx} position={pos} />))}
         {!directions && hasStartAndEnd && <Polyline path={path} options={{ strokeColor: "#e77e23", strokeWeight: 2, strokeOpacity: 0.5 }} />}
      </GoogleMap>

      {/* --- MODÁL PRO ULOŽENÍ --- */}
      {showSaveModal && (
        <div className="save-modal-overlay">
          <div className="save-modal-card card shadow-lg">
            <div className="card-body p-4">
              <h4 className="text-primary-dark fw-bold mb-3">Uložit trasu</h4>
              <form onSubmit={handleConfirmSave}>
                <div className="mb-3">
                  <label className="form-label">Název trasy</label>
                  <input type="text" className="form-control" value={routeName} onChange={(e) => setRouteName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Popis (volitelný)</label>
                  <textarea className="form-control" rows="2" value={routeDescription} onChange={(e) => setRouteDescription(e.target.value)}></textarea>
                </div>

                {/* 💥 VÝBĚR OBRÁZKU */}
                <div className="mb-3">
                    <label className="form-label">Přidat fotku (volitelné)</label>
                    <input 
                        type="file" 
                        className="form-control" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                    />
                    {selectedImage && (
                        <div className="mt-2 text-center">
                            <img src={selectedImage} alt="Náhled" style={{ maxHeight: '100px', borderRadius: '8px' }} />
                        </div>
                    )}
                </div>

                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" id="makePublicCheckbox" checked={makePublic} onChange={(e) => setMakePublic(e.target.checked)} />
                  <label className="form-check-label" htmlFor="makePublicCheckbox">Zveřejnit tuto trasu?</label>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-outline-secondary" onClick={handleCancelSave}>Zrušit</button>
                  <button type="submit" className="btn btn-dark">Uložit trasu</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}