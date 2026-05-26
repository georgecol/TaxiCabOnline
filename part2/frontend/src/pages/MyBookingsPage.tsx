import { useEffect, useState } from "react";
import { getMyBookings } from "../api/bookingAPI";
import type { Booking } from "../types/booking";
import type { JSX } from "react";
import BookingDetailModal from "../components/Booking/BookingDetailModal";

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

function DriverSection({ booking, showLocation }: { booking: Booking; showLocation: boolean }) {
  if (!booking.driver_name) return null;

  return (
    <div className="mt-2 pt-2 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
        {showLocation ? "Your Driver" : "Driver"}
      </p>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">{booking.driver_name}</p>
          <p className="text-xs text-gray-500">{booking.driver_phone}</p>
        </div>
        {showLocation && booking.driver_location_label && (
          <div className="text-right">
            <p className="text-xs text-gray-400">Currently in</p>
            <p className="text-xs font-medium text-blue-700">{booking.driver_location_label}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  return status === "assigned" ? (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Confirmed
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      Pending
    </span>
  );
}

function BookingCard({
  booking,
  isPast,
  onView,
}: {
  booking: Booking;
  isPast: boolean;
  onView: (b: Booking) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-1 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-800">{booking.booking_ref}</span>
        <div className="flex items-center gap-2">
          <StatusBadge status={booking.status} />
          <button
            onClick={() => onView(booking)}
            className="px-3 py-0.5 text-xs font-medium border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
          >
            View
          </button>
        </div>
      </div>
      <p className="text-gray-500">
        {formatDate(booking.pickup_date)} at {formatTime(booking.pickup_time)}
      </p>
      {booking.pickup_address && (
        <p className="text-gray-700">
          <span className="font-medium">From:</span> {booking.pickup_address}
        </p>
      )}
      {booking.dest_address && (
        <p className="text-gray-700">
          <span className="font-medium">To:</span> {booking.dest_address}
        </p>
      )}
      <DriverSection booking={booking} showLocation={!isPast && booking.status === "assigned"} />
    </div>
  );
}

function Section({
  title,
  bookings,
  emptyText,
  isPast,
  onView,
}: {
  title: string;
  bookings: Booking[];
  emptyText: string;
  isPast: boolean;
  onView: (b: Booking) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-3">{title}</h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <BookingCard key={b._id} booking={b} isPast={isPast} onView={onView} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyBookingsPage(): JSX.Element {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    getMyBookings().then((res) => {
      if (res.success) {
        setBookings(res.data ?? []);
      } else {
        setError("Failed to load bookings");
      }
      setLoading(false);
    });
  }, []);

  const now = new Date();

  const upcoming = bookings
    .filter((b) => {
      if (!b.pickup_date || !b.pickup_time) return false;
      return new Date(`${b.pickup_date}T${b.pickup_time}`) >= now;
    })
    .reverse();

  const past = bookings.filter((b) => {
    if (!b.pickup_date || !b.pickup_time) return true;
    return new Date(`${b.pickup_date}T${b.pickup_time}`) < now;
  });

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">My Bookings</h1>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <Section
            title="Upcoming"
            bookings={upcoming}
            emptyText="No upcoming bookings."
            isPast={false}
            onView={setViewingBooking}
          />
          <Section
            title="Past"
            bookings={past}
            emptyText="No past bookings."
            isPast={true}
            onView={setViewingBooking}
          />
        </>
      )}

      {viewingBooking && (
        <BookingDetailModal
          booking={viewingBooking}
          onClose={() => setViewingBooking(null)}
        />
      )}
    </div>
  );
}
