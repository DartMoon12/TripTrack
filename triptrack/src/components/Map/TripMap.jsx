// src/components/Map/TripMap.jsx

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
// Importujeme vše potřebné pro Google Mapy
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
// 💥 DŮLEŽITÉ: Import hooku pro téma
import { useTheme } from '../Theme/ThemeContext'; 
import "./TripMap.css";
import toast from 'react-hot-toast';
import { FaCamera, FaTags } from 'react-icons/fa';

// --- DEFINICE TMAVÉHO STYLU PRO MAPU ---
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

// Klíče a nastavení mapy
const mapKey = import.meta.env.VITE_MAP_KEY;
const libraries = ["places"];

// Výchozí střed mapy (Praha)
const center = { lat: 50.0755, lng: 14.4378 };

const TRAVEL_MODES = {
  DRIVING: '🚗 Auto',
  WALKING: '🚶 Chůze',
  BICYCLING: '🚲 Kolo',
  TRANSIT: '🚌 MHD',
};

// Seznam štítků
const AVAILABLE_TAGS = [
    "Příroda", "Město", "Pro rodiny", "Náročná", 
    "Vyhlídka", "Asfalt", "Dobrodružství", "Pro kočárek", 
    "Kolo", "Běh", "Pro Vozíčkáře"
];

export default function TripMap() {
  const [path, setPath] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [marker, setMarker] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [isCalculated, setIsCalculated] = useState(false);

  // Stavy pro uložení
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [routeName, setRouteName] = useState("");
  const [routeDescription, setRouteDescription] = useState("");
  const [makePublic, setMakePublic] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  // VYTÁHNEME SI AKTUÁLNÍ TÉMA
  const { theme } = useTheme();

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
        } else { toast.error("Požadovaná trasa nebyla nalezena."); }
      }
    }
  }, [searchParams, getRouteById, isLoaded]);

  const handleClick = (e) => {
    const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setPath((prev) => [...prev, newPoint]);
    setDirections(null); setRouteInfo(null); setIsCalculated(false);
  };
  
  const handlePlaceChanged = () => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;
    const place = autocomplete.getPlace?.();
    if (!place || !place.geometry?.location) return;
    const location = place.geometry.location;
    const newCenter = { lat: location.lat(), lng: location.lng() };
    setMarker(newCenter); setSearchValue(place.formatted_address || searchValue);
    if (mapRef.current) { mapRef.current.panTo(newCenter); mapRef.current.setZoom(14); }
  };

  const directionsCallback = useCallback((result, status) => {
    setIsCalculated(true);
    if (status === 'OK' && result) {
      setDirections(result);
      
      // 💥 OPRAVA: Sečteme všechny úseky trasy (legs)
      let totalDistanceValue = 0;
      let totalDurationValue = 0;

      result.routes[0].legs.forEach(leg => {
          totalDistanceValue += leg.distance.value; // metry
          totalDurationValue += leg.duration.value; // sekundy
      });

      // Převedení celkové vzdálenosti na text (např. 84,0 km)
      const distanceInKm = (totalDistanceValue / 1000).toFixed(1).replace('.', ',');
      const distanceText = totalDistanceValue >= 1000 ? `${distanceInKm} km` : `${totalDistanceValue} m`;

      // Převedení celkového času na text (např. 2 h 15 min)
      const hours = Math.floor(totalDurationValue / 3600);
      const minutes = Math.floor((totalDurationValue % 3600) / 60);
      const durationText = hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;

      setRouteInfo({ distance: distanceText, duration: durationText, mode: travelMode });
      
    } else if (status === 'ZERO_RESULTS') {
        // Automatický fallback pro kola na chůzi
        if (travelMode === 'BICYCLING') {
            toast.error("Google tu nezná cyklotrasu. Přepínám automaticky na 'Chůzi'...", { duration: 4000 });
            setTravelMode('WALKING'); 
            setIsCalculated(false); 
            return; 
        }
        
        setRouteInfo({ distance: 'Trasa nenalezena', duration: 'N/A', mode: travelMode }); 
        setDirections(null);
    } else { 
        setRouteInfo({ distance: 'Chyba API', duration: 'N/A', mode: travelMode }); 
        setDirections(null); 
    }
  }, [travelMode]);

  const calculateRoute = () => {
    if (path.length < 2) { toast.error("Pro výpočet trasy potřebuješ alespoň 2 body."); return; }
    setDirections(null); setRouteInfo(null); setIsCalculated(false); setMarker(null);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const clearMap = () => {
    setPath([]); setMarker(null); setSearchValue(""); setDirections(null); setRouteInfo(null);
    setTravelMode('DRIVING'); setIsCalculated(false); setShowSaveModal(false);
    setSelectedImage(null); setSelectedTags([]);
    navigate('/mapa', { replace: true });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 800 * 1024) {
            toast.error("Obrázek je příliš velký! Maximální velikost je cca 800KB.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => { setSelectedImage(reader.result); };
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
    setSelectedImage(null);
    setSelectedTags([]);
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
        image: selectedImage,
        tags: selectedTags 
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

      <GoogleMap 
        mapContainerClassName="map-container" 
        center={center} 
        zoom={12} 
        onClick={handleClick} 
        onLoad={(map) => (mapRef.current = map)}
        // POUŽITÍ TMAVÉHO STYLU PODLE TÉMATU
        options={{
            styles: theme === 'dark' ? darkMapStyle : null,
            disableDefaultUI: false,
            zoomControl: true,
        }}
      >
         {marker && <Marker position={marker} />}
         
         {/* OPRAVA VOLÁNÍ API (Zabránění prázdným bodům a ochrana TravelMode) */}
         {hasStartAndEnd && !directions && !isCalculated && (
             <DirectionsService 
                options={{ 
                    destination: path[path.length - 1], 
                    origin: path[0], 
                    // Přidáme waypoints JEN KDYŽ máme víc jak 2 body a nejedná se o MHD
                    ...(path.length > 2 && travelMode !== 'TRANSIT' ? { 
                        waypoints: path.slice(1, -1).map(p => ({ location: p, stopover: true })) 
                    } : {}),
                    // Pojistka: natáhneme přesný formát z načtené Google Maps knihovny
                    travelMode: window.google.maps?.TravelMode?.[travelMode] || travelMode 
                }} 
                callback={directionsCallback} 
             />
         )}

         {directions && (<DirectionsRenderer directions={directions} options={{ polylineOptions: { strokeColor: '#e77e23', strokeWeight: 4 }, suppressMarkers: true }} />)}
         {path.map((pos, idx) => (<Marker key={idx} position={pos} />))}
         
         {/* Polyline přijímá [] (prázdné pole) pokud nemá být vidět, čímž donutíme mapu čáru smazat */}
         <Polyline 
            path={(!directions && hasStartAndEnd) ? path : []} 
            options={{ strokeColor: "#e77e23", strokeWeight: 2, strokeOpacity: 0.5 }} 
         />
      </GoogleMap>

      {/* Modál pro uložení trasy */}
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

                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <FaTags className="text-warning" /> Štítky
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className={`btn btn-sm ${selectedTags.includes(tag) ? 'btn-warning text-white' : 'btn-outline-secondary'}`}
                        onClick={() => toggleTag(tag)}
                        style={{ borderRadius: '20px', fontSize: '0.8rem' }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                    <label className="form-label"><FaCamera className="me-1" /> Přidat fotku</label>
                    <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
                    {selectedImage && (
                        <div className="mt-2 text-center border p-1 rounded">
                            <img src={selectedImage} alt="Náhled" style={{ maxHeight: '80px', borderRadius: '4px' }} />
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