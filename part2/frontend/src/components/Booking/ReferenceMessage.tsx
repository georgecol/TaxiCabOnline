import type { JSX } from "react";
import type { Booking } from "../../types/booking";

interface Props {
  message: string;
  booking?: Booking | null;
}

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

function formatPlaced(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-NZ", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-gray-400 font-medium">{label}</dt>
      <dd className="text-gray-800">{value}</dd>
    </>
  );
}

export default function ReferenceMessage({ message, booking }: Props): JSX.Element | null {
  if (!message) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Success header */}
      <div className="bg-green-50 px-6 py-5 flex items-center gap-4 border-b border-green-100">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-green-800">{message}</p>
          <p className="text-xs text-green-600 mt-0.5">Your booking has been received</p>
        </div>
      </div>

      {booking && (
        <div className="px-6 py-5 space-y-4">
          {/* Booking ref pill */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Reference</span>
            <span className="font-mono text-sm font-bold tracking-wider bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
              {booking.booking_ref}
            </span>
          </div>

          <div className="border-t border-gray-100" />

          {/* Details grid */}
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <Row label="Name" value={booking.cname} />
            <Row label="Phone" value={booking.phone} />
            <Row label="Pickup Date" value={formatDate(booking.pickup_date)} />
            <Row label="Pickup Time" value={formatTime(booking.pickup_time)} />
            <Row label="Booking Placed" value={formatPlaced(booking.created_at)} />
            {booking.pickup_address && <Row label="Pickup" value={booking.pickup_address} />}
            {booking.dest_address && <Row label="Destination" value={booking.dest_address} />}
          </dl>

          {/* Status chip */}
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
              Awaiting driver assignment
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
