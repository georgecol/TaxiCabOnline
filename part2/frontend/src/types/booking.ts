export interface Booking {
  _id: string;
  booking_ref: string;
  cname: string;
  phone: string;
  pickup_address?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dest_address?: string;
  dest_lat?: number;
  dest_lng?: number;
  pickup_date: string;  // YYYY-MM-DD
  pickup_time: string;  // HH:MM:SS
  status: "unassigned" | "assigned";
  username?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_username?: string;
  driver_lat?: number;
  driver_lng?: number;
  driver_location_label?: string;
}

export interface AppUser {
  _id: string;
  username: string;
  name: string;
  phone: string;
  email?: string;
  role: "testuser" | "driver" | "admin";
  created_at?: string;
  lat?: number;
  lng?: number;
  location_label?: string;
}

export interface Driver {
  _id: string;
  username: string;
  name: string;
  phone: string;
  role: "driver";
  lat: number;
  lng: number;
  location_label: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  data?: Booking;
  error?: string;
}

export interface BookingFormValues {
  cname: string;
  phone: string;
  pickup_address: string;
  dest_address: string;
  pickup_date: string;
  pickup_time: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dest_lat?: number;
  dest_lng?: number;
}
