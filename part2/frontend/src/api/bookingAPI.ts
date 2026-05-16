import type { BookingFormValues, BookingResponse } from "../types/booking";

const BASE_URL = "http://localhost:5000/api";

export async function createBooking(
  values: BookingFormValues
): Promise<BookingResponse> {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const json = await res.json().catch(() => ({
    success: false,
    message: "Invalid JSON response",
  }));

  if (!res.ok) {
    return {
      success: false,
      message: json?.message || `HTTP ${res.status}`,
      error: json?.error || String(json),
    };
  }

  return json as BookingResponse;
}