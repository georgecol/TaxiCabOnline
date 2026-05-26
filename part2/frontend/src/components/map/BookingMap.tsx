import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";

type BookingMapProps = {
  pickupPosition: [number, number] | null;
  destPosition: [number, number] | null;
  onSelectDest: (lat: number, lng: number, address: string) => void;
};

const center: LatLngExpression = [-36.8485, 174.7633];

function makePin(color: string) {
  return L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>`,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

const pickupIcon = makePin("#22c55e");
const destIcon = makePin("#ef4444");

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return "Unknown address";
    const data = await res.json();
    return data.display_name || "Unknown address";
  } catch {
    return "Unknown address";
  }
}

function LocationPicker({
  onSelectDest,
}: {
  onSelectDest: (lat: number, lng: number, address: string) => void;
}) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const address = await reverseGeocode(lat, lng);
      onSelectDest(lat, lng, address);
    },
  });
  return null;
}

export default function BookingMap({ pickupPosition, destPosition, onSelectDest }: BookingMapProps) {
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

      <LocationPicker onSelectDest={onSelectDest} />

      {pickupPosition && destPosition && (
        <Polyline
          positions={[pickupPosition, destPosition]}
          color="#3b82f6"
          weight={3}
          opacity={0.75}
          dashArray="8 5"
        />
      )}

      {pickupPosition && (
        <Marker position={pickupPosition} icon={pickupIcon}>
          <Popup>Pickup</Popup>
        </Marker>
      )}

      {destPosition && (
        <Marker position={destPosition} icon={destIcon}>
          <Popup>Destination</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
