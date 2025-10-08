import React, { useState, useRef } from "react";
import { GoogleMap, LoadScript, Marker, Polyline, Autocomplete } from "@react-google-maps/api";

const mapKey = import.meta.env.VITE_MAP_KEY;
const libraries = ["places"];

const containerStyle = {
  width: "100vw",
  height: "calc(100vh - 64px)", // výška mapy minus navbar
  marginTop: "64px", // posun dolů o výšku navbaru
};

const center = {
  lat: 50.0755, // Praha
  lng: 14.4378,
};

export default function TripMap() {
  const [path, setPath] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  const handleClick = (e) => {
    const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setPath((prev) => [...prev, newPoint]);
  };

  const handlePlaceChanged = () => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;

    const place = autocomplete.getPlace?.();
    if (!place || !place.geometry?.location) return;

    const location = place.geometry.location;
    const newCenter = { lat: location.lat(), lng: location.lng() };
    setMarker(newCenter);

    if (mapRef.current) {
      mapRef.current.panTo(newCenter);
      mapRef.current.setZoom(14);
    }
  };

  const clearMap = () => {
    setPath([]);
    setMarker(null);
  };

  return (
    <LoadScript
      googleMapsApiKey={mapKey}
      libraries={libraries}
    >
      <div style={{ position: "relative", width: "100vw", height: "calc(100vh - 64px)", marginTop: "64px" }}>
        {/* --- SEARCH BAR --- */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            backdropFilter: "blur(12px)",
            background: "rgba(255, 255, 255, 0.65)",
            borderRadius: "16px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
            padding: "12px 16px",
            display: "flex",
            gap: "10px",
            width: "min(700px, 90%)",
            alignItems: "center",
          }}
        >
          <div style={{ flexGrow: 1 }}>
            <Autocomplete
              onLoad={(ac) => (autocompleteRef.current = ac)}
              onPlaceChanged={handlePlaceChanged}
            >
              <input
                type="text"
                placeholder="🔍 Hledat místo nebo adresu..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "15px",
                  outline: "none",
                  background: "rgba(255, 255, 255, 0.9)",
                  boxShadow: "inset 0 1px 4px rgba(0, 0, 0, 0.1)",
                }}
              />
            </Autocomplete>
          </div>

          <button
            onClick={handlePlaceChanged}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              padding: "10px 14px",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#0066d1")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#007bff")}
          >
            Hledat
          </button>

          <button
            onClick={clearMap}
            style={{
              background: "#dc3545",
              color: "white",
              border: "none",
              padding: "10px 14px",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#b02a37")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#dc3545")}
          >
            Vymazat
          </button>
        </div>

        {/* --- MAPA --- */}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onClick={handleClick}
          onLoad={(map) => (mapRef.current = map)}
        >
          {marker && <Marker position={marker} />}
          {path.map((pos, idx) => (
            <Marker key={idx} position={pos} />
          ))}
          <Polyline path={path} options={{ strokeColor: "#007bff", strokeWeight: 3 }} />
        </GoogleMap>
      </div>
    </LoadScript>
  );
}
