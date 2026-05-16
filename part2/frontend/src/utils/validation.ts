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

  const phoneRegex = /^\d{10,12}$/;
  if (!values.phone || !phoneRegex.test(values.phone)) {
    errors.phone = "Phone must be 10–12 digits";
  }

  if (!values.date) {
    errors.date = "Date is required";
  }

  if (!values.time) {
    errors.time = "Time is required";
  }

  if (values.date && values.time) {
    const dt = new Date(`${values.date}T${values.time}`);
    if (isNaN(dt.getTime())) {
      errors.date = errors.date || "Invalid date/time";
    } else if (dt.getTime() < Date.now()) {
      errors.time = "Pickup time cannot be in the past";
    }
  }

  const ok = Object.keys(errors).length === 0;
  return ok ? { ok: true } : { ok: false, errors, message: "Validation failed" };
}