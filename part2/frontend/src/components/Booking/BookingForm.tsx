import { useState, useEffect, useRef } from "react";
import type { BookingFormValues } from "../../types/booking";
import { validateBooking } from "../../utils/validation";
import type { JSX } from "react";

type Props = {
  onSubmit: (values: BookingFormValues) => void | Promise<void>;
  disabled?: boolean;
  pickupAddress: string;
  onPickupAddressChange: (address: string, lat?: number, lng?: number) => void;
  destAddress: string;
  onDestAddressChange: (address: string, lat?: number, lng?: number) => void;
};

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  placeholder: string;
  error?: string;
}) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    onChange(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5&countrycodes=nz`,
          { headers: { Accept: "application/json" } }
        );
        if (res.ok) {
          const data: NominatimResult[] = await res.json();
          setSuggestions(data);
          setOpen(data.length > 0);
        }
      } catch {
        // ignore
      }
    }, 400);
  }

  function handleSelect(item: NominatimResult) {
    onChange(item.display_name, parseFloat(item.lat), parseFloat(item.lon));
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className="input w-full"
        placeholder={placeholder}
        autoComplete="off"
      />
      {error && <div className="text-sm text-red-600">{error}</div>}
      {open && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto text-sm">
          {suggestions.map((item, i) => (
            <li
              key={i}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => handleSelect(item)}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function BookingForm({
  onSubmit,
  disabled,
  pickupAddress,
  onPickupAddressChange,
  destAddress,
  onDestAddressChange,
}: Props): JSX.Element {
  const [values, setValues] = useState({
    cname: "",
    phone: "",
    pickup_date: "",
    pickup_time: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormValues, string>>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formValues: BookingFormValues = {
      ...values,
      pickup_address: pickupAddress,
      dest_address: destAddress,
    };
    const check = validateBooking(formValues);
    if (!check.ok) {
      setErrors(check.errors || {});
      return;
    }
    setErrors({});
    await onSubmit(formValues);
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

      <AddressAutocomplete
        value={pickupAddress}
        onChange={onPickupAddressChange}
        placeholder="Pickup address — type to search or click the map"
        error={errors.pickup_address}
      />

      <AddressAutocomplete
        value={destAddress}
        onChange={onDestAddressChange}
        placeholder="Destination address — type to search or click the map"
        error={errors.dest_address}
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <input type="date" name="pickup_date" value={values.pickup_date} onChange={handleChange} className="input" />
          {errors.pickup_date && <div className="text-sm text-red-600">{errors.pickup_date}</div>}
        </div>
        <div>
          <input type="time" name="pickup_time" value={values.pickup_time} onChange={handleChange} className="input" />
          {errors.pickup_time && <div className="text-sm text-red-600">{errors.pickup_time}</div>}
        </div>
      </div>

      <button className="btn" disabled={disabled}>
        Book
      </button>
    </form>
  );
}
