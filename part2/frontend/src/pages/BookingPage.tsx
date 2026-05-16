import { useState } from "react";
import { createBooking } from "../api/bookingAPI";
import BookingForm from "../components/Booking/BookingForm";
import ReferenceMessage from "../components/Booking/ReferenceMessage";
import type { BookingFormValues } from "../types/booking";
import type { JSX } from "react";

export default function BookingPage(): JSX.Element {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(values: BookingFormValues): Promise<void> {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await createBooking(values);
      if (!res.success) {
        setError(res.message || res.error || "Booking failed");
        return;
      }
      setMessage(res.message || "Booking successful");
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Book a Taxi</h1>

      {error && <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{error}</div>}

      <BookingForm onSubmit={handleSubmit} disabled={loading} />

      {loading && <div className="mt-2 text-sm text-gray-600">Submitting…</div>}

      <ReferenceMessage message={message} />
    </div>
  );
}