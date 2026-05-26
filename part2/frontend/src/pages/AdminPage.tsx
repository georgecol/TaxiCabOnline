import { useEffect, useState } from "react";
import { searchBookings, assignBooking, getDrivers } from "../api/adminAPI";
import type { Booking, Driver } from "../types/booking";
import type { JSX } from "react";
import SearchBar from "../components/admin/SearchBar";
import BookingTable from "../components/Booking/BookingTable";
import AssignMessage from "../components/admin/AssignMessage";
import DriverPickerModal from "../components/admin/DriverPickerModal";

export default function AdminPage(): JSX.Element {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [message, setMessage] = useState<string>("");
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);

  async function loadBookings(ref: string = ""): Promise<void> {
    const res = await searchBookings(ref);
    setBookings(res.data ?? []);
  }

  useEffect(() => {
    void loadBookings();
    getDrivers().then((res) => setDrivers(res.data ?? []));
  }, []);

  async function handleSearch(ref: string): Promise<void> {
    await loadBookings(ref);
    setMessage(ref ? `Search results for "${ref}"` : "Showing all bookings for the next 2 hours");
  }

  function handleAssignClick(id: string): void {
    const booking = bookings.find((b) => b._id === id) ?? null;
    setAssigningBooking(booking);
  }

  async function handleDriverSelect(driverId: string): Promise<void> {
    if (!assigningBooking) return;
    setAssigningBooking(null);
    try {
      const res = await assignBooking(assigningBooking._id, driverId);
      setMessage(res.message);
    } catch (err: any) {
      setMessage(err?.message || "Assignment failed");
    }
    await loadBookings();
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <SearchBar onSearch={handleSearch} />

      <AssignMessage message={message} />

      <BookingTable bookings={bookings} onAssign={handleAssignClick} />

      {assigningBooking && (
        <DriverPickerModal
          booking={assigningBooking}
          drivers={drivers}
          onSelect={handleDriverSelect}
          onClose={() => setAssigningBooking(null)}
        />
      )}
    </div>
  );
}
