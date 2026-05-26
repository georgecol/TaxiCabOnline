import type { JSX } from "react";
import type { Booking } from "../../types/booking";

interface Props {
  message: string;
  booking?: Booking | null;
}

export default function ReferenceMessage({ message, booking }: Props): JSX.Element | null {
  if (!message) return null;

  return (
    <div className="mt-4 p-5 bg-green-50 border border-green-300 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-green-800 mb-4">{message}</h2>

      {booking && (
        <div className="space-y-2 text-sm text-gray-800">
          <div className="grid grid-cols-2 gap-2">
            <p><span className="font-semibold">Booking Reference:</span></p>
            <p>{booking.booking_ref}</p>

            <p><span className="font-semibold">Customer Name:</span></p>
            <p>{booking.cname}</p>

            <p><span className="font-semibold">Phone Number:</span></p>
            <p>{booking.phone}</p>

            {booking.pickup_address && (
              <>
                <p><span className="font-semibold">Pickup Address:</span></p>
                <p>{booking.pickup_address}</p>
              </>
            )}

            {booking.dest_address && (
              <>
                <p><span className="font-semibold">Destination:</span></p>
                <p>{booking.dest_address}</p>
              </>
            )}

            <p><span className="font-semibold">Pickup Date:</span></p>
            <p>{booking.pickup_date?.split("-").reverse().join("/")}</p>

            <p><span className="font-semibold">Pickup Time:</span></p>
            <p>{booking.pickup_time}</p>
          </div>
        </div>
      )}
    </div>
  );
}
