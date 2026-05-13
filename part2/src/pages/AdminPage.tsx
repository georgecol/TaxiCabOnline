import { useEffect, useState } from "react";
import { searchBookings, assignBooking } from "../api/adminAPI";
import type { Booking } from "../types/booking";

import SearchBar from "../components/Booking/SearchBar";
import BookingTable from "../components/Booking/BookingTable";
import AssignMessage from "../components/admin/AssignMessage";

export default function AdminPage(): JSX.Element {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string>("");

  async function loadDefault(): Promise<void> {
    const res = await searchBookings("");
    setBookings(res.data ?? []);
    setMessage(res.message ?? "");
  }

  useEffect(() => {
    void loadDefault();
  }, []);

  async function handleSearch(ref: string): Promise<void> {
    const res = await searchBookings(ref);
    setBookings(res.data ?? []);
    setMessage(res.message ?? "");
  }

  async function handleAssign(id: string, ref: string): Promise<void> {
    const res = await assignBooking(id, ref);
    setMessage(res.message);

    await handleSearch("");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <SearchBar onSearch={handleSearch} />

      <AssignMessage message={message} />

      <BookingTable bookings={bookings} onAssign={handleAssign} />
    </div>
  );
}