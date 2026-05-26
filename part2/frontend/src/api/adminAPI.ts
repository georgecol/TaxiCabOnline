import type { Booking, Driver, AppUser } from "../types/booking";

const BASE_URL = import.meta.env.VITE_API_URL;

function authHeader(): Record<string, string> {
  const token = localStorage.getItem("taxi_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
  const url = new URL(`${BASE_URL}/bookings`);
  if (ref) url.searchParams.append("ref", ref);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: authHeader(),
  });

  const json = await res.json().catch(() => ({
    success: false,
    message: "Invalid JSON response",
  }));

  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);

  return json;
}

export async function assignBooking(id: string, driverId: string): Promise<AssignResponse> {
  const res = await fetch(`${BASE_URL}/bookings/${id}/assign`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ driverId }),
  });

  const json = await res.json().catch(() => ({ success: false, message: "Invalid JSON response" }));
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json;
}

export async function getAllBookings(scope: "history" | "future"): Promise<AdminResponse> {
  const url = new URL(`${BASE_URL}/bookings`);
  url.searchParams.append("scope", scope);
  const res = await fetch(url.toString(), { headers: authHeader() });
  const json = await res.json().catch(() => ({ success: false, message: "Invalid JSON response" }));
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json;
}

export async function getDrivers(): Promise<{ success: boolean; data?: Driver[] }> {
  const res = await fetch(`${BASE_URL}/drivers`, { headers: authHeader() });
  return res.json().catch(() => ({ success: false }));
}

export async function getUsers(): Promise<{ success: boolean; data?: AppUser[] }> {
  const res = await fetch(`${BASE_URL}/users`, { headers: authHeader() });
  return res.json().catch(() => ({ success: false }));
}

export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  const json = await res.json().catch(() => ({ success: false, message: "Invalid JSON response" }));
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json;
}
