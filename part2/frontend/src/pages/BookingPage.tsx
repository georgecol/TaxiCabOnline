import { useState } from "react";
import { createBooking, updateBooking } from "../api/bookingAPI";
import BookingForm from "../components/Booking/BookingForm";
import ReferenceMessage from "../components/Booking/ReferenceMessage";
import type { BookingFormValues } from "../types/booking";
import type { JSX } from "react";
import type { Booking } from "../types/booking";
import { useAuth } from "../context/AuthContext";

type Props = {
  onViewBookings?: () => void;
  initialEditBooking?: Booking | null;
};

export default function BookingPage({ onViewBookings, initialEditBooking }: Props): JSX.Element {
  const { user } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [formKey, setFormKey] = useState(0);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(
    initialEditBooking?._id ?? null
  );

  const [pickupAddress, setPickupAddress] = useState(initialEditBooking?.pickup_address ?? "");
  const [pickupPosition, setPickupPosition] = useState<[number, number] | null>(
    initialEditBooking?.pickup_lat != null && initialEditBooking?.pickup_lng != null
      ? [initialEditBooking.pickup_lat, initialEditBooking.pickup_lng]
      : null
  );

  const [destAddress, setDestAddress] = useState(initialEditBooking?.dest_address ?? "");
  const [destPosition, setDestPosition] = useState<[number, number] | null>(
    initialEditBooking?.dest_lat != null && initialEditBooking?.dest_lng != null
      ? [initialEditBooking.dest_lat, initialEditBooking.dest_lng]
      : null
  );

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

  function handleEdit() {
    if (booking?._id) setEditingBookingId(booking._id);
    setMessage("");
    setBooking(null);
    setError("");
  }

  function handleNew() {
    setMessage("");
    setBooking(null);
    setError("");
    setEditingBookingId(null);
    setPickupAddress("");
    setPickupPosition(null);
    setDestAddress("");
    setDestPosition(null);
    setFormKey((k) => k + 1);
  }

  async function handleSubmit(values: BookingFormValues): Promise<void> {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...values,
        pickup_lat: pickupPosition?.[0],
        pickup_lng: pickupPosition?.[1],
        dest_lat: destPosition?.[0],
        dest_lng: destPosition?.[1],
      };
      const res = editingBookingId
        ? await updateBooking(editingBookingId, payload)
        : await createBooking(payload);
      if (!res.success) { setError(res.message || res.error || "Booking failed"); return; }
      setMessage(res.message || (editingBookingId ? "Booking updated" : "Booking successful"));
      setBooking(res.data || null);
      setEditingBookingId(null);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const confirmed = !!message;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Book a Taxi</h1>

      {error && <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{error}</div>}

      {!confirmed ? (
        <>
          <BookingForm
            key={formKey}
            onSubmit={handleSubmit}
            disabled={loading}
            pickupAddress={pickupAddress}
            onPickupAddressChange={handlePickupAddressChange}
            destAddress={destAddress}
            onDestAddressChange={handleDestAddressChange}
            pickupPosition={pickupPosition}
            destPosition={destPosition}
            onSelectDest={handleMapDest}
            defaultName={initialEditBooking?.cname ?? user?.name}
            defaultPhone={initialEditBooking?.phone ?? user?.phone}
            defaultPickupDate={initialEditBooking?.pickup_date}
            defaultPickupTime={initialEditBooking?.pickup_time?.slice(0, 5)}
            mode={editingBookingId ? "edit" : "create"}
          />
          {loading && <div className="mt-2 text-sm text-gray-600">Submitting…</div>}
        </>
      ) : (
        <>
          <ReferenceMessage message={message} booking={booking} />
          <div className="mt-4 flex flex-col gap-2">
            {onViewBookings && (
              <button
                onClick={onViewBookings}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow transition-colors"
              >
                View My Bookings
              </button>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Edit Booking
              </button>
              <button
                onClick={handleNew}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                New Booking
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
