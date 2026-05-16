import type { Booking } from "../types/booking";

const BASE_URL = "http://localhost:5000/api";

export interface AdminResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: Booking[];
}

export interface AssignResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * SEARCH BOOKINGS
 * GET /api/bookings?ref=BRN001
 */
export async function searchBookings(ref: string): Promise<AdminResponse> {
  const url = new URL(`${BASE_URL}/bookings`);
  if (ref) {
    url.searchParams.append("ref", ref);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
  });

  const json = await res.json().catch(() => ({
    success: false,
    message: "Invalid JSON response",
  }));

  if (!res.ok) {
    throw new Error(json?.message || `HTTP ${res.status}`);
  }

  return json;
}

/**
 * ASSIGN BOOKING
 * PATCH /api/bookings/:id/assign
 */
export async function assignBooking(
  id: string,
  ref: string
): Promise<AssignResponse> {
  const res = await fetch(`${BASE_URL}/bookings/${id}/assign`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref }),
  });

  const json = await res.json().catch(() => ({
    success: false,
    message: "Invalid JSON response",
  }));

  if (!res.ok) {
    throw new Error(json?.message || `HTTP ${res.status}`);
  }

  return json;
}