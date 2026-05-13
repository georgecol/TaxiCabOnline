import { useState } from "react";
import { createBooking } from "../api/bookingAPI";
import { validateBooking } from "../utils/validation";

import BookingForm from "../components/Booking/BookingForm";
import ReferenceMessage from "../components/Booking/ReferenceMessage";

export default function BookingPage(): JSX.Element {
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(formData: FormData): Promise<void> {
    const values = Object.fromEntries(
      formData.entries()
    ) as Record<string, string>;

    const check = validateBooking(values);

    if (!check.ok) {
      alert(check.message);
      return;
    }

    const res = await createBooking(formData);
    setMessage(res.message);
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Book a Taxi</h1>

      <BookingForm onSubmit={handleSubmit} />

      <ReferenceMessage message={message} />
    </div>
  );
}