import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

const center: LatLngExpression = [-36.8485, 174.7633];

// 👇 THIS MUST BE INSIDE MAP TREE
function LocationPicker({ onSelectCoords, onSelectAddress }: any) {
  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      // 1. coords
      onSelectCoords(lat, lng);

      // 2. reverse geocode
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );

      const data = await res.json();

      // 3. address
      onSelectAddress(data.display_name);
    },
  });

  return null;
}

export default function BookingMap({
  onSelectCoords,
  onSelectAddress,
  position,
}: any) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
      className="rounded-lg"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 👇 THIS ACTIVATES CLICK LISTENER */}
      <LocationPicker
        onSelectCoords={onSelectCoords}
        onSelectAddress={onSelectAddress}
      />

      {position && (
        <Marker position={position}>
          <Popup>Selected Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}