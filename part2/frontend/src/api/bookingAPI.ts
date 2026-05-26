import type { Booking, BookingFormValues, BookingResponse } from "../types/booking";

const BASE_URL = import.meta.env.VITE_API_URL;

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

export async function getMyBookings(): Promise<{ success: boolean; data?: Booking[] }> {
  const res = await fetch(`${BASE_URL}/bookings/my`, {
    headers: authHeader(),
  });
  return res.json().catch(() => ({ success: false }));
}

export async function getDriverAssignments(): Promise<{ success: boolean; data?: Booking[] }> {
  const res = await fetch(`${BASE_URL}/bookings/driver`, {
    headers: authHeader(),
  });
  return res.json().catch(() => ({ success: false }));
}

export async function updateBooking(
  id: string,
  values: BookingFormValues
): Promise<BookingResponse> {
  const res = await fetch(`${BASE_URL}/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(values),
  });

  const json = await res.json().catch(() => ({ success: false, message: "Invalid JSON response" }));

  if (!res.ok) {
    return { success: false, message: json?.message || `HTTP ${res.status}`, error: json?.error || String(json) };
  }

  return json as BookingResponse;
}
