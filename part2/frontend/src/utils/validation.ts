import type { BookingFormValues } from "../types/booking";

export function validateBooking(values: BookingFormValues): {
  ok: boolean;
  errors?: Partial<Record<keyof BookingFormValues, string>>;
  message?: string;
} {
  const errors: Partial<Record<keyof BookingFormValues, string>> = {};

  if (!values.cname || values.cname.trim() === "") {
    errors.cname = "Name is required";
  }

  const phoneDigits = (values.phone || "").replace(/\s/g, "");
  if (!/^\d{10,12}$/.test(phoneDigits)) {
    errors.phone = "Phone must be 10–12 digits";
  }

  if (!values.pickup_address || values.pickup_address.trim() === "") {
    errors.pickup_address = "Pickup address is required";
  }

  if (!values.dest_address || values.dest_address.trim() === "") {
    errors.dest_address = "Destination address is required";
  }

  if (!values.pickup_date) {
    errors.pickup_date = "Date is required";
  }

  if (!values.pickup_time) {
    errors.pickup_time = "Time is required";
  }

  if (values.pickup_date && values.pickup_time) {
    const dt = new Date(`${values.pickup_date}T${values.pickup_time}`);
    if (isNaN(dt.getTime())) {
      errors.pickup_date = errors.pickup_date || "Invalid date/time";
    } else if (dt.getTime() < Date.now()) {
      errors.pickup_time = "Pickup time cannot be in the past";
    }
  }

  const ok = Object.keys(errors).length === 0;
  return ok ? { ok: true } : { ok: false, errors, message: "Validation failed" };
}
