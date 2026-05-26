import { useEffect, useState } from "react";
import { getDriverAssignments } from "../api/bookingAPI";
import type { Booking } from "../types/booking";
import type { JSX } from "react";
import BookingDetailModal from "../components/Booking/BookingDetailModal";

type DriverTab = "upcoming" | "past";

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

function AssignmentCard({ booking, onView }: { booking: Booking; onView: (b: Booking) => void }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-2 text-sm">
      <div className="flex items-center justify-between flex-wrap gap-2">
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

      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Customer</p>
        <p className="font-semibold text-gray-800">{booking.cname}</p>
        <p className="text-xs text-gray-500">{booking.phone}</p>
      </div>
    </div>
  );
}

function TabSection({
  bookings,
  emptyText,
  onView,
}: {
  bookings: Booking[];
  emptyText: string;
  onView: (b: Booking) => void;
}) {
  if (bookings.length === 0) {
    return <p className="text-sm text-gray-400">{emptyText}</p>;
  }
  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <AssignmentCard key={b._id} booking={b} onView={onView} />
      ))}
    </div>
  );
}

export default function DriverBookingsPage(): JSX.Element {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<DriverTab>("upcoming");
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    getDriverAssignments().then((res) => {
      if (res.success) {
        setBookings(res.data ?? []);
      } else {
        setError("Failed to load assignments");
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
    .sort((a, b) =>
      new Date(`${a.pickup_date}T${a.pickup_time}`).getTime() -
      new Date(`${b.pickup_date}T${b.pickup_time}`).getTime()
    );

  const past = bookings
    .filter((b) => {
      if (!b.pickup_date || !b.pickup_time) return true;
      return new Date(`${b.pickup_date}T${b.pickup_time}`) < now;
    });

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Assignments</h1>

      <div className="flex border-b border-gray-200">
        {(
          [
            ["upcoming", "Upcoming", upcoming.length],
            ["past", "Past", past.length],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              tab === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
            <span
              className={`text-xs rounded-full px-1.5 font-medium ${
                tab === key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          {tab === "upcoming" && (
            <TabSection
              bookings={upcoming}
              emptyText="No upcoming assignments."
              onView={setViewingBooking}
            />
          )}
          {tab === "past" && (
            <TabSection
              bookings={past}
              emptyText="No past assignments."
              onView={setViewingBooking}
            />
          )}
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
