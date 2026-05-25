import { useEffect, useState } from "react";
import { searchBookings, assignBooking } from "../api/adminAPI";
import type { Booking } from "../types/booking";
import type { JSX } from "react";
import SearchBar from "../components/admin/SearchBar";
import BookingTable from "../components/Booking/BookingTable";
import AssignMessage from "../components/admin/AssignMessage";

export default function AdminPage(): JSX.Element {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string>("");

  async function loadBookings(ref: string = ""): Promise<void> {
    const res = await searchBookings(ref);
    setBookings(res.data ?? []);
  }

  useEffect(() => {
    void loadBookings();
  }, []);

  async function handleSearch(ref: string): Promise<void> {
    await loadBookings(ref);
    setMessage(ref ? `Search results for "${ref}"` : "Showing all bookings for the next 2 hours");
  }

  async function handleAssign(id: string, ref: string): Promise<void> {
    const res = await assignBooking(id, ref);

    setMessage(res.message);

    // reload current view (not always reset to all)
    await loadBookings();
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <SearchBar onSearch={handleSearch} />

      {/* Confirmation box */}
      <AssignMessage message={message} />

      <BookingTable bookings={bookings} onAssign={handleAssign} />
    </div>
  );
}