import { useEffect, useState } from "react";
import { getMyBookings } from "../api/bookingAPI";
import type { Booking } from "../types/booking";
import type { JSX } from "react";

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

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-1 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-800">{booking.booking_ref}</span>
        <StatusBadge status={booking.status} />
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
    </div>
  );
}

function Section({ title, bookings, emptyText }: { title: string; bookings: Booking[]; emptyText: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-3">{title}</h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => <BookingCard key={b._id} booking={b} />)}
        </div>
      )}
    </div>
  );
}

export default function MyBookingsPage(): JSX.Element {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const upcoming = bookings.filter((b) => {
    if (!b.pickup_date || !b.pickup_time) return false;
    return new Date(`${b.pickup_date}T${b.pickup_time}`) >= now;
  }).reverse();

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
          <Section title="Upcoming" bookings={upcoming} emptyText="No upcoming bookings." />
          <Section title="Past" bookings={past} emptyText="No past bookings." />
        </>
      )}
    </div>
  );
}
