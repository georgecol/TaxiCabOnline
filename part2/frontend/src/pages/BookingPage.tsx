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
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupPosition, setPickupPosition] = useState<[number, number] | null>(null);

  const [destAddress, setDestAddress] = useState("");
  const [destPosition, setDestPosition] = useState<[number, number] | null>(null);

  function handlePickupAddressChange(addr: string, lat?: number, lng?: number) {
    setPickupAddress(addr);
    if (lat !== undefined && lng !== undefined) setPickupPosition([lat, lng]);
  }

  function handleDestAddressChange(addr: string, lat?: number, lng?: number) {
    setDestAddress(addr);
    if (lat !== undefined && lng !== undefined) setDestPosition([lat, lng]);
  }

  function handleMapDest(lat: number, lng: number, address: string) {
    setDestPosition([lat, lng]);
    setDestAddress(address);
  }

  async function handleSubmit(values: BookingFormValues): Promise<void> {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await createBooking({
        ...values,
        pickup_lat: pickupPosition?.[0],
        pickup_lng: pickupPosition?.[1],
        dest_lat: destPosition?.[0],
        dest_lng: destPosition?.[1],
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

      <BookingForm
        onSubmit={handleSubmit}
        disabled={loading}
        pickupAddress={pickupAddress}
        onPickupAddressChange={handlePickupAddressChange}
        destAddress={destAddress}
        onDestAddressChange={handleDestAddressChange}
      />

      {loading && <div className="mt-2 text-sm text-gray-600">Submitting…</div>}

      <ReferenceMessage message={message} booking={booking} />

      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-1">Click the map to set your destination:</p>
        <BookingMap
          destPosition={destPosition}
          onSelectDest={handleMapDest}
        />
      </div>
    </div>
  );
}
