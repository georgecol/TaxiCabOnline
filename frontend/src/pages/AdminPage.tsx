import { useEffect, useState } from "react";
import { searchBookings, assignBooking, getDrivers, getAllBookings } from "../api/adminAPI";
import type { Booking, Driver } from "../types/booking";
import type { JSX } from "react";
import AssignMessage from "../components/admin/AssignMessage";
import DriverPickerModal from "../components/admin/DriverPickerModal";
import BookingDetailModal from "../components/Booking/BookingDetailModal";
import UsersTab from "../components/admin/UsersTab";

type AdminTab = "current" | "history" | "users";

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
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
      Assigned
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
      Unassigned
    </span>
  );
}

function AdminBookingCard({
  booking,
  showDriverLocation,
  onAssign,
  onView,
}: {
  booking: Booking;
  showDriverLocation: boolean;
  onAssign: (b: Booking) => void;
  onView: (b: Booking) => void;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2 text-sm bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-semibold text-gray-800 dark:text-gray-200">{booking.booking_ref}</span>
        <div className="flex items-center gap-2">
          <StatusBadge status={booking.status} />
          <button
            onClick={() => onView(booking)}
            className="px-3 py-0.5 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            View
          </button>
          {booking.status === "unassigned" && (() => {
            const isFuture = booking.pickup_date && booking.pickup_time
              ? new Date(`${booking.pickup_date}T${booking.pickup_time}`) > new Date()
              : false;
            return isFuture ? (
              <button
                onClick={() => onAssign(booking)}
                className="px-3 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                Assign
              </button>
            ) : (
              <span className="px-3 py-0.5 text-xs font-medium text-gray-400 dark:text-gray-500 rounded-full border border-gray-200 dark:border-gray-700">
                Past
              </span>
            );
          })()}
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

      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Customer</p>
        <p className="font-semibold text-gray-800 dark:text-gray-200">{booking.cname}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{booking.phone}</p>
      </div>

      {booking.driver_name && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Driver</p>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{booking.driver_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{booking.driver_phone}</p>
            </div>
            {showDriverLocation && booking.driver_location_label && (
              <div className="text-right">
                <p className="text-xs text-gray-400 dark:text-gray-500">Currently in</p>
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400">{booking.driver_location_label}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BookingSection({
  title,
  bookings,
  emptyText,
  showDriverLocation,
  onAssign,
  onView,
}: {
  title: string;
  bookings: Booking[];
  emptyText: string;
  showDriverLocation: boolean;
  onAssign: (b: Booking) => void;
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
            <AdminBookingCard
              key={b._id}
              booking={b}
              showDriverLocation={showDriverLocation}
              onAssign={onAssign}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPage(): JSX.Element {
  const [tab, setTab] = useState<AdminTab>("current");
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [futureBookings, setFutureBookings] = useState<Booking[]>([]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  async function reloadBookings(): Promise<void> {
    const [upcoming, future, history] = await Promise.all([
      searchBookings(""),
      getAllBookings("future"),
      getAllBookings("history"),
    ]);
    setUpcomingBookings(upcoming.data ?? []);
    setFutureBookings(future.data ?? []);
    setHistoryBookings(history.data ?? []);
  }

  useEffect(() => {
    Promise.all([
      searchBookings(""),
      getAllBookings("future"),
      getAllBookings("history"),
      getDrivers(),
    ])
      .then(([upcoming, future, history, driversRes]) => {
        setUpcomingBookings(upcoming.data ?? []);
        setFutureBookings(future.data ?? []);
        setHistoryBookings(history.data ?? []);
        setDrivers(driversRes.data ?? []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  async function handleDriverSelect(driverId: string): Promise<void> {
    if (!assigningBooking) return;
    setAssigningBooking(null);
    try {
      const res = await assignBooking(assigningBooking._id, driverId);
      setMessage(res.message);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Assignment failed");
    }
    await reloadBookings();
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h1>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(
          [
            ["current", "Current Bookings"],
            ["history", "History"],
            ["users", "Users"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AssignMessage message={message} />

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
      ) : (
        <>
          {tab === "current" && (
            <div className="space-y-10">
              <BookingSection
                title="Next 2 Hours"
                bookings={upcomingBookings}
                emptyText="No bookings in the next 2 hours."
                showDriverLocation={true}
                onAssign={setAssigningBooking}
                onView={setViewingBooking}
              />
              <BookingSection
                title="Further Ahead"
                bookings={futureBookings}
                emptyText="No bookings scheduled further ahead."
                showDriverLocation={false}
                onAssign={setAssigningBooking}
                onView={setViewingBooking}
              />
            </div>
          )}

          {tab === "history" && (
            <BookingSection
              title="Past Bookings"
              bookings={historyBookings}
              emptyText="No past bookings."
              showDriverLocation={false}
              onAssign={setAssigningBooking}
              onView={setViewingBooking}
            />
          )}

          {tab === "users" && <UsersTab />}
        </>
      )}

      {assigningBooking && (
        <DriverPickerModal
          booking={assigningBooking}
          drivers={drivers}
          onSelect={handleDriverSelect}
          onClose={() => setAssigningBooking(null)}
        />
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
