import { useEffect, useState } from "react";
import { getMyBookings, cancelBooking } from "../api/bookingAPI";
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
    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
        {showLocation ? "Your Driver" : "Driver"}
      </p>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{booking.driver_name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{booking.driver_phone}</p>
        </div>
        {showLocation && booking.driver_location_label && (
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500">Currently in</p>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">{booking.driver_location_label}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  return status === "assigned" ? (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
      Confirmed
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
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
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-1 text-sm bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-800 dark:text-gray-200">{booking.booking_ref}</span>
        <div className="flex items-center gap-2">
          <StatusBadge status={booking.status} />
          <button
            onClick={() => onView(booking)}
            className="px-3 py-0.5 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            View
          </button>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-xs font-medium">
        Pickup: {formatDate(booking.pickup_date)} at {formatTime(booking.pickup_time)}
      </p>
      {booking.created_at && (
        <p className="text-gray-400 dark:text-gray-500 text-xs">
          Placed: {new Date(booking.created_at).toLocaleString("en-NZ", {
            day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true,
          })}
        </p>
      )}
      {booking.pickup_address && (
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">From:</span> {booking.pickup_address}
        </p>
      )}
      {booking.dest_address && (
        <p className="text-gray-700 dark:text-gray-300">
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
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">{emptyText}</p>
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

export default function MyBookingsPage({ onEditBooking }: { onEditBooking?: (b: Booking) => void }): JSX.Element {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  function loadBookings() {
    getMyBookings().then((res) => {
      if (res.success) {
        setBookings(res.data ?? []);
      } else {
        setError("Failed to load bookings");
      }
      setLoading(false);
    });
  }

  useEffect(() => { loadBookings(); }, []);

  async function handleCancel(b: Booking) {
    await cancelBooking(b._id);
    setViewingBooking(null);
    loadBookings();
  }

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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Bookings</h1>

      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

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
          onEdit={onEditBooking}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
