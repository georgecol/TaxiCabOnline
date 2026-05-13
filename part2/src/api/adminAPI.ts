import type { Booking } from "../types/booking";

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

export async function searchBookings(ref: string): Promise<AdminResponse> {
  const body = new URLSearchParams({
    action: "search",
    bsearch: ref,
  });

  const res = await fetch("admin.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.json();
}

export async function assignBooking(
  id: string,
  ref: string
): Promise<AssignResponse> {
  const body = new URLSearchParams({
    action: "assign",
    id,
    ref,
  });

  const res = await fetch("admin.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.json();
}   