export interface BookingFormValues {
  phone: string;
  date: string;
  time: string;
  [key: string]: string;
}

export function validateBooking(values: BookingFormValues): {
  ok: boolean;
  message?: string;
} {
  const phoneRegex = /^\d{10,12}$/;

  if (!phoneRegex.test(values.phone)) {
    return { ok: false, message: "Phone must be 10–12 digits" };
  }

  const dt = new Date(`${values.date}T${values.time}`);

  if (dt.getTime() < Date.now()) {
    return { ok: false, message: "Pickup time cannot be in the past" };
  }

  return { ok: true };
}