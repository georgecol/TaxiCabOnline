import { useState } from "react";
import type { BookingFormValues } from "../../types/booking";
import { validateBooking } from "../../utils/validation";
import type { JSX } from "react";

type Props = {
  onSubmit: (values: BookingFormValues) => void | Promise<void>;
  disabled?: boolean;
};

export default function BookingForm({ onSubmit, disabled }: Props): JSX.Element {
  const [values, setValues] = useState<BookingFormValues>({
    cname: "",
    phone: "",
    unumber: "",
    snumber: "",
    stname: "",
    sbname: "",
    dsbname: "",
    date: "",
    time: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormValues, string>>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const check = validateBooking(values);
    if (!check.ok) {
      setErrors(check.errors || {});
      return;
    }
    setErrors({});
    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input name="cname" value={values.cname} onChange={handleChange} className="input" placeholder="Name" />
        {errors.cname && <div className="text-sm text-red-600">{errors.cname}</div>}
      </div>

      <div>
        <input name="phone" value={values.phone} onChange={handleChange} className="input" placeholder="Phone" />
        {errors.phone && <div className="text-sm text-red-600">{errors.phone}</div>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <input name="unumber" value={values.unumber} onChange={handleChange} className="input" placeholder="Unit" />
        <input name="snumber" value={values.snumber} onChange={handleChange} className="input" placeholder="Street #" />
        <input name="stname" value={values.stname} onChange={handleChange} className="input" placeholder="Street" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input name="sbname" value={values.sbname} onChange={handleChange} className="input" placeholder="Suburb" />
        <input name="dsbname" value={values.dsbname} onChange={handleChange} className="input" placeholder="Destination" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <input type="date" name="date" value={values.date} onChange={handleChange} className="input" />
          {errors.date && <div className="text-sm text-red-600">{errors.date}</div>}
        </div>
        <div>
          <input type="time" name="time" value={values.time} onChange={handleChange} className="input" />
          {errors.time && <div className="text-sm text-red-600">{errors.time}</div>}
        </div>
      </div>

      <button className="btn" disabled={disabled}>
        Book
      </button>
    </form>
  );
}
