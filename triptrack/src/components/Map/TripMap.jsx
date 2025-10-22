// src/components/Map/TripMap.jsx

import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { 
    GoogleMap, 
    LoadScript, 
    Marker, 
    Polyline, 
    Autocomplete, 
    DirectionsService, 
    DirectionsRenderer 
} from "@react-google-maps/api";
import { useRoutesStorage } from '../../Hooks/RouteStorageContext'; // 💥 Import pro ukládání
import "./TripMap.css"; 

const mapKey = import.meta.env.VITE_MAP_KEY;
const libraries = ["places", "directions"];

const center = {
  lat: 50.0755, // Praha
  lng: 14.4378,
};

export default function TripMap() {
  const [path, setPath] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [marker, setMarker] = useState(null);
  
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null); 
  
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Využití hooků
  const { saveRoute } = useRoutesStorage();
  const navigate = useNavigate();
  
  const hasStartAndEnd = path.length >= 2;

  const handleClick = (e) => {
    const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setPath((prev) => [...prev, newPoint]);
    setDirections(null);
    setRouteInfo(null);
  };

  const handlePlaceChanged = () => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;

    const place = autocomplete.getPlace?.();
    if (!place || !place.geometry?.location) return;

    const location = place.geometry.location;
    const newCenter = { lat: location.lat(), lng: location.lng() };
    setMarker(newCenter);
    setSearchValue(place.formatted_address || '');
    
    if (mapRef.current) {
      mapRef.current.panTo(newCenter);
      mapRef.current.setZoom(14);
    }
  };

  const directionsCallback = useCallback((result, status) => {
    if (status === 'OK' && result) {
      setDirections(result);
      
      const leg = result.routes[0].legs[0];
      setRouteInfo({
        distance: leg.distance.text,
        duration: leg.duration.text,
      });
    } else if (status !== 'ZERO_RESULTS') {
      console.error('Directions request failed due to ' + status);
      setRouteInfo({ distance: 'Chyba', duration: 'Chyba' });
    }
  }, []);


  const calculateRoute = () => {
    if (path.length < 2) {
      alert("Pro výpočet trasy potřebuješ alespoň 2 body.");
      return;
    }
    setMarker(null);
  };


  const clearMap = () => {
    setPath([]);
    setMarker(null);
    setSearchValue("");
    setDirections(null);
    setRouteInfo(null);
  };

  const savePath = () => {
    if (!routeInfo) {
        alert("Nejdříve musíte vypočítat trasu!");
        return;
    }
    
    // Získání názvu trasy od uživatele
    const routeName = prompt("Zadejte název pro tuto trasu:", "Moje nová trasa");
    if (!routeName) return;

    const newRouteData = {
        name: routeName, 
        points: path,
        distance: routeInfo.distance,
        duration: routeInfo.duration,
    };
    
    // Uložení trasy přes Context
    saveRoute(newRouteData);
    
    alert(`Trasa "${routeName}" uložena!`);
    
    // Přesměrování na seznam tras
    navigate('/trasa');
  };

  return (
    <LoadScript
      googleMapsApiKey={mapKey}
      libraries={libraries}
    >
      <div className="map-wrapper"> 
        
        {/* --- SEARCH BAR --- */}
        <div className="map-search-panel shadow-lg d-flex align-items-center">
          
          <div className="flex-grow-1">
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
          
          {/* Tlačítka pro akce: VÝPOČET, INFO, ULOŽIT, VYMAZAT */}
          <div className="d-flex gap-2">
            
            {/* TLAČÍTKO VÝPOČET TRASY */}
            {hasStartAndEnd && !directions && (
                <button
                    onClick={calculateRoute}
                    className="btn btn-info"
                >
                    Vypočítat (km)
                </button>
            )}

            {/* ZOBRAZENÍ VZDÁLENOSTI */}
            {routeInfo && (
              <div className="alert alert-success py-2 px-3 m-0 d-flex align-items-center fw-bold">
                {routeInfo.distance} | {routeInfo.duration}
              </div>
            )}
            
            {/* TLAČÍTKO ULOŽIT */}
            {routeInfo && (
                <button
                    onClick={savePath}
                    className="btn btn-dark" 
                >
                    Uložit trasu
                </button>
            )}

            {/* TLAČÍTKO VYMAZAT */}
            <button
              onClick={clearMap}
              className="btn btn-danger"
            >
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
          
          {/* DirectionsService: Spustí se pro výpočet trasy */}
          {hasStartAndEnd && !directions && (
            <DirectionsService
              options={{
                destination: path[path.length - 1],
                origin: path[0],
                waypoints: path.slice(1, -1).map(p => ({ location: p, stopover: false })),
                travelMode: 'DRIVING', 
              }}
              callback={directionsCallback}
            />
          )}

          {/* DirectionsRenderer: Vykreslí oficiální trasu po výpočtu */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                    strokeColor: '#e77e23', 
                    strokeWeight: 4,
                },
                suppressMarkers: true, 
              }}
            />
          )}

          {/* Vykreslení vlastních Markerů, pokud trasa ještě nebyla vypočtena */}
          {!directions && path.map((pos, idx) => (
            <Marker key={idx} position={pos} />
          ))}

          {/* Provizorní Polyline */}
          {!directions && <Polyline path={path} options={{ strokeColor: "#e77e23", strokeWeight: 2, strokeOpacity: 0.5 }} />}
        </GoogleMap>
      </div>
    </LoadScript>
  );
}