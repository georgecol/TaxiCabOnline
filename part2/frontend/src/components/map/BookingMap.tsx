import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";

type BookingMapProps = {
  pickupPosition: [number, number] | null;
  destPosition: [number, number] | null;
  onSelectPickup: (lat: number, lng: number, address: string) => void;
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
  activePin,
  onSelectPickup,
  onSelectDest,
}: {
  activePin: "pickup" | "dest";
  onSelectPickup: (lat: number, lng: number, address: string) => void;
  onSelectDest: (lat: number, lng: number, address: string) => void;
}) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const address = await reverseGeocode(lat, lng);
      if (activePin === "pickup") {
        onSelectPickup(lat, lng, address);
      } else {
        onSelectDest(lat, lng, address);
      }
    },
  });
  return null;
}

export default function BookingMap({
  pickupPosition,
  destPosition,
  onSelectPickup,
  onSelectDest,
}: BookingMapProps) {
  const [activePin, setActivePin] = useState<"pickup" | "dest">("pickup");

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-sm">
        <button
          type="button"
          onClick={() => setActivePin("pickup")}
          className={`px-3 py-1 rounded border font-medium ${
            activePin === "pickup"
              ? "bg-green-500 text-white border-green-500"
              : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
          }`}
        >
          Set Pickup
        </button>
        <button
          type="button"
          onClick={() => setActivePin("dest")}
          className={`px-3 py-1 rounded border font-medium ${
            activePin === "dest"
              ? "bg-red-500 text-white border-red-500"
              : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
          }`}
        >
          Set Destination
        </button>
        <span className="text-gray-400">
          — click map to place {activePin === "pickup" ? "pickup" : "destination"} pin
        </span>
      </div>

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

        <LocationPicker
          activePin={activePin}
          onSelectPickup={onSelectPickup}
          onSelectDest={onSelectDest}
        />

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
    </div>
  );
}
