import type { BookingFormValues, BookingResponse } from "../types/booking";

const BASE_URL = "http://localhost:5000/api";

function authHeader(): Record<string, string> {
  const token = localStorage.getItem("taxi_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createBooking(
  values: BookingFormValues
): Promise<BookingResponse> {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
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
