export interface Booking {
  _id: string;
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
  message: string;
  data?: Booking;
  error?: string;
}

export interface BookingFormValues {
  cname: string;
  phone: string;
  unumber?: string;
  snumber?: string;
  stname?: string;
  sbname?: string;
  dsbname?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  [key: string]: string | undefined;
}