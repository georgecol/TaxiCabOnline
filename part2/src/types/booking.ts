export interface Booking {
  booking_id: string;
  booking_ref: string;
  cname: string;
  phone: string;
  sbname: string;
  dsbname: string;
  pickup_date: string;  // YYYY-MM-DD
  pickup_time: string;  // HH:MM:SS
  status: "unassigned" | "assigned";
}

export interface BookingResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: Booking[];
}