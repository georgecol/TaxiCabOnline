import { useState } from "react";
import { createBooking } from "../api/bookingAPI";
import BookingForm from "../components/Booking/BookingForm";
import ReferenceMessage from "../components/Booking/ReferenceMessage";
import type { BookingFormValues } from "../types/booking";
import type { JSX } from "react";
import type { Booking } from "../types/booking";
import BookingMap from "../components/map/BookingMap";


export default function BookingPage(): JSX.Element {
  const [message, setMessage] = useState<string>("");
  const [booking, setBooking] = useState<any>(null); // booking state for confirmation 
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  //Map state
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [pickupAddress, setPickupAddress] = useState("");

async function handleSubmit(values: BookingFormValues): Promise<void> {
  setLoading(true);
  setError("");
  setMessage("");

  try {
    const res = await createBooking({
      ...values,
      pickup_lat: pickupCoords?.[0],
      pickup_lng: pickupCoords?.[1],
      pickup_address: pickupAddress,
    });

    if (!res.success) {
      setError(res.message || res.error || "Booking failed");
      return;
    }

    setMessage(res.message || "Booking successful");
    setBooking(res.data || null);
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

      <ReferenceMessage
        message={message}
        booking={booking}
      />
      <BookingMap
        onSelectCoords={(lat: number, lng: number) => setPickupCoords([lat, lng])}
        onSelectAddress={(addr: string) => setPickupAddress(addr)}
      />
    </div>
  );
}