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
