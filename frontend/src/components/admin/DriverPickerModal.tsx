import type { Driver, Booking } from "../../types/booking";
import type { JSX } from "react";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type Props = {
  booking: Booking;
  drivers: Driver[];
  onSelect: (driverId: string) => void;
  onClose: () => void;
};

export default function DriverPickerModal({ booking, drivers, onSelect, onClose }: Props): JSX.Element {
  const hasPickup = booking.pickup_lat != null && booking.pickup_lng != null;

  const driversWithDist = drivers.map((d) => ({
    ...d,
    distKm: hasPickup
      ? haversineKm(booking.pickup_lat!, booking.pickup_lng!, d.lat, d.lng)
      : null,
  }));

  if (hasPickup) driversWithDist.sort((a, b) => (a.distKm ?? 0) - (b.distKm ?? 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">Assign Driver</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Booking <span className="font-medium text-gray-700 dark:text-gray-300">{booking.booking_ref}</span>
              {" — "}{booking.pickup_address ?? "unknown pickup"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">&times;</button>
        </div>

        <ul className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto">
          {driversWithDist.map((d) => (
            <li key={d._id}>
              <button
                className="w-full text-left px-5 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between gap-4"
                onClick={() => onSelect(d._id)}
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{d.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{d.phone} &middot; {d.location_label}</p>
                </div>
                {d.distKm != null && (
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {d.distKm < 1
                      ? `${Math.round(d.distKm * 1000)} m`
                      : `${d.distKm.toFixed(1)} km`}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
