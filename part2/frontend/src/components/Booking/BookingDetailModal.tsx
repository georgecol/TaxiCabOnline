import type { Booking } from "../../types/booking";
import type { JSX } from "react";
import BookingMap from "../map/BookingMap";

function formatDate(date: string): string {
  return date?.split("-").reverse().join("/") ?? "";
}

function formatTime(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit", hour12: true });
}

type Props = {
  booking: Booking;
  onClose: () => void;
};

export default function BookingDetailModal({ booking, onClose }: Props): JSX.Element {
  const pickupPosition: [number, number] | null =
    booking.pickup_lat != null && booking.pickup_lng != null
      ? [booking.pickup_lat, booking.pickup_lng]
      : null;

  const destPosition: [number, number] | null =
    booking.dest_lat != null && booking.dest_lng != null
      ? [booking.dest_lat, booking.dest_lng]
      : null;

  const driverPosition: [number, number] | null =
    booking.driver_lat != null && booking.driver_lng != null
      ? [booking.driver_lat, booking.driver_lng]
      : null;

  const hasMap = pickupPosition || destPosition || driverPosition;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900 text-lg">{booking.booking_ref}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {booking.status === "assigned" ? "Confirmed" : "Pending"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Booking details */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <span className="font-medium text-gray-500">Customer</span>
            <span className="text-gray-800">{booking.cname}</span>

            <span className="font-medium text-gray-500">Phone</span>
            <span className="text-gray-800">{booking.phone}</span>

            <span className="font-medium text-gray-500">Pickup</span>
            <span className="text-gray-800">{formatDate(booking.pickup_date)} at {formatTime(booking.pickup_time)}</span>

            {booking.pickup_address && (
              <>
                <span className="font-medium text-gray-500">From</span>
                <span className="text-gray-800">{booking.pickup_address}</span>
              </>
            )}

            {booking.dest_address && (
              <>
                <span className="font-medium text-gray-500">To</span>
                <span className="text-gray-800">{booking.dest_address}</span>
              </>
            )}
          </div>

          {/* Driver section */}
          {booking.driver_name && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <p className="text-xs font-medium text-blue-400 uppercase tracking-wide mb-2">Your Driver</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900">{booking.driver_name}</p>
                  <p className="text-sm text-blue-700">{booking.driver_phone}</p>
                </div>
                {booking.driver_location_label && (
                  <div className="text-right">
                    <p className="text-xs text-blue-400">Currently in</p>
                    <p className="text-sm font-medium text-blue-800">{booking.driver_location_label}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Map */}
          {hasMap && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                {driverPosition ? "Route & Driver Location" : "Route"}
              </p>
              <BookingMap
                pickupPosition={pickupPosition}
                destPosition={destPosition}
                driverPosition={driverPosition}
                driverLabel={booking.driver_name ?? "Driver"}
                readOnly
                autoFit
              />
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                {pickupPosition && (
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500"></span> Pickup
                  </span>
                )}
                {destPosition && (
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500"></span> Destination
                  </span>
                )}
                {driverPosition && (
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500"></span> Driver
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
