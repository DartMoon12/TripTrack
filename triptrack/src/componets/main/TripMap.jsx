import { GoogleMap, LoadScript, Polyline, Marker, Autocomplete } from "@react-google-maps/api";
import { useRef, useState } from "react";

const containerStyle = {
  width: "100%",
  height: "100%"
};

const center = {
  lat: 50.0755, // Prague
  lng: 14.4378
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

  function handlePlaceChanged() {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place || !place.geometry || !place.geometry.location) return;
    const location = place.geometry.location;
    const newCenter = { lat: location.lat(), lng: location.lng() };
    setMarker(newCenter);
    if (mapRef.current) {
      mapRef.current.panTo(newCenter);
      mapRef.current.setZoom(14);
    }
  }

  return (
    <LoadScript googleMapsApiKey="AIzaSyCGxjjqWPkfWmchWi_NS88qHSTUDqb5okY" libraries={["places"]}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {/* Search Overlay */}
        <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 5, width: "min(720px, 92%)" }}>
          <div className="input-group shadow">
            <Autocomplete
              onLoad={(ac) => (autocompleteRef.current = ac)}
              onPlaceChanged={handlePlaceChanged}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Hledat místo nebo adresu..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </Autocomplete>
            <button
              className="btn btn-primary"
              type="button"
              onClick={handlePlaceChanged}
            >
              Hledat
            </button>
          </div>
        </div>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onClick={handleClick}
          onLoad={(map) => (mapRef.current = map)}
        >
          {marker && <Marker position={marker} />}
          {path.map((pos, idx) => (
            <Marker key={idx} position={pos} />
          ))}
          <Polyline path={path} options={{ strokeColor: "#0000FF" }} />
        </GoogleMap>
      </div>
    </LoadScript>
  );
}


