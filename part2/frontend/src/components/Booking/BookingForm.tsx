import { useState, useEffect, useRef } from "react";
import type { BookingFormValues } from "../../types/booking";
import { validateBooking } from "../../utils/validation";
import type { JSX } from "react";
import BookingMap from "../map/BookingMap";

type Props = {
  onSubmit: (values: BookingFormValues) => void | Promise<void>;
  disabled?: boolean;
  pickupAddress: string;
  onPickupAddressChange: (address: string, lat?: number, lng?: number) => void;
  destAddress: string;
  onDestAddressChange: (address: string, lat?: number, lng?: number) => void;
  pickupPosition: [number, number] | null;
  destPosition: [number, number] | null;
  onSelectDest: (lat: number, lng: number, address: string) => void;
  defaultName?: string;
  defaultPhone?: string;
  defaultPickupDate?: string;
  defaultPickupTime?: string;
  mode?: "create" | "edit";
};

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return "Unknown address";
    const data = await res.json();
    return data.display_name || "Unknown address";
  } catch {
    return "Unknown address";
  }
}

function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  error,
  showGeolocation = false,
}: {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  placeholder: string;
  error?: string;
  showGeolocation?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
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
    if (text.trim().length < 3) { setSuggestions([]); setOpen(false); return; }
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
      } catch { /* ignore */ }
    }, 400);
  }

  function handleSelect(item: NominatimResult) {
    onChange(item.display_name, parseFloat(item.lat), parseFloat(item.lon));
    setSuggestions([]);
    setOpen(false);
  }

  function handleGeolocate() {
    if (!navigator.geolocation) { setGeoError("Geolocation not supported"); return; }
    setGeoLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        onChange(await reverseGeocode(lat, lng), lat, lng);
        setGeoLoading(false);
      },
      () => { setGeoError("Location access denied"); setGeoLoading(false); }
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          className="input flex-1"
          placeholder={placeholder}
          autoComplete="off"
        />
        {showGeolocation && (
          <button
            type="button"
            onClick={handleGeolocate}
            disabled={geoLoading}
            className="px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 whitespace-nowrap disabled:opacity-50 transition-colors"
          >
            {geoLoading ? "Locating…" : "Use my location"}
          </button>
        )}
      </div>
      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
      {geoError && <div className="text-sm text-orange-600 dark:text-orange-400">{geoError}</div>}
      {open && (
        <ul className="absolute z-[9999] w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto text-sm">
          {suggestions.map((item, i) => (
            <li
              key={i}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer"
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

function getNowDateTime() {
  const d = new Date(Date.now() + 15 * 60 * 1000);
  const date = d.toLocaleDateString("en-CA");
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

function formatPickupDisplay(date: string, time: string): string {
  if (!date || !time) return "";
  const dt = new Date(`${date}T${time}`);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  let dateLabel: string;
  if (dt.toDateString() === today.toDateString()) dateLabel = "Today";
  else if (dt.toDateString() === tomorrow.toDateString()) dateLabel = "Tomorrow";
  else dateLabel = dt.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" });
  const timeLabel = dt.toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${dateLabel} at ${timeLabel}`;
}

export default function BookingForm({
  onSubmit,
  disabled,
  pickupAddress,
  onPickupAddressChange,
  destAddress,
  onDestAddressChange,
  pickupPosition,
  destPosition,
  onSelectDest,
  defaultName = "",
  defaultPhone = "",
  defaultPickupDate,
  defaultPickupTime,
  mode = "create",
}: Props): JSX.Element {
  const [values, setValues] = useState(() => {
    const { date, time } = getNowDateTime();
    return {
      cname: defaultName,
      phone: defaultPhone,
      pickup_date: defaultPickupDate ?? date,
      pickup_time: defaultPickupTime ?? time,
    };
  });
  const [advanced, setAdvanced] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormValues, string>>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((s) => ({ ...s, [name]: value }));
  }

  function resetToNow() {
    const { date, time } = getNowDateTime();
    setValues((s) => ({ ...s, pickup_date: date, pickup_time: time }));
    setAdvanced(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formValues: BookingFormValues = { ...values, pickup_address: pickupAddress, dest_address: destAddress };
    const check = validateBooking(formValues);
    if (!check.ok) { setErrors(check.errors || {}); return; }
    setErrors({});
    await onSubmit(formValues);
  }

  const showMap = pickupAddress.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Top row: name/phone left | date-time right */}
      <div className="grid grid-cols-2 gap-4">
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-3 space-y-2">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Details</p>
          <div>
            <input name="cname" value={values.cname} onChange={handleChange} className="input w-full" placeholder="Name" />
            {errors.cname && <div className="text-sm text-red-600 dark:text-red-400">{errors.cname}</div>}
          </div>
          <div>
            <input name="phone" value={values.phone} onChange={handleChange} className="input w-full" placeholder="Phone" />
            {errors.phone && <div className="text-sm text-red-600 dark:text-red-400">{errors.phone}</div>}
          </div>
        </div>

        <div>
          {!advanced ? (
            <div className="h-full flex flex-col justify-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-3">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Pickup time</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">
                {formatPickupDisplay(values.pickup_date, values.pickup_time)}
              </p>
              <button
                type="button"
                onClick={() => setAdvanced(true)}
                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline self-start"
              >
                Book in advance
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <input type="date" name="pickup_date" value={values.pickup_date} onChange={handleChange} className="input w-full" />
                {errors.pickup_date && <div className="text-sm text-red-600 dark:text-red-400">{errors.pickup_date}</div>}
              </div>
              <div>
                <input type="time" name="pickup_time" value={values.pickup_time} onChange={handleChange} className="input w-full" />
                {errors.pickup_time && <div className="text-sm text-red-600 dark:text-red-400">{errors.pickup_time}</div>}
              </div>
              <button type="button" onClick={resetToNow} className="text-xs text-gray-500 dark:text-gray-400 hover:underline">
                Use current time
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pickup address */}
      <AddressAutocomplete
        value={pickupAddress}
        onChange={onPickupAddressChange}
        placeholder="Pickup address"
        error={errors.pickup_address}
        showGeolocation
      />

      {/* Destination address */}
      <AddressAutocomplete
        value={destAddress}
        onChange={onDestAddressChange}
        placeholder="Destination address — type to search or click the map"
        error={errors.dest_address}
      />

      {/* Map — revealed once pickup is set */}
      {showMap && (
        <BookingMap
          pickupPosition={pickupPosition}
          destPosition={destPosition}
          onSelectDest={onSelectDest}
        />
      )}

      {/* Book button */}
      <button
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base font-semibold rounded-lg shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={disabled}
      >
        {disabled ? (mode === "edit" ? "Updating…" : "Booking…") : (mode === "edit" ? "Update Booking" : "Book Taxi")}
      </button>
    </form>
  );
}
