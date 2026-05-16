import type { Booking } from "../../types/booking";
import type { JSX } from "react";

type Props = {
  bookings: Booking[];
  onAssign: (id: string, ref: string) => void;
};

export default function BookingTable({
  bookings,
  onAssign,
}: Props): JSX.Element {
  if (bookings.length === 0) return <p>No bookings found.</p>;

  return (
    <table className="w-full border">
      <tbody>
        {bookings.map((b) => {
          const date = b.pickup_date.split("-").reverse().join("/");
          const time = b.pickup_time.split(":").slice(0, 2).join(":");

          return (
            <tr key={b.booking_id}>
              <td>{b.booking_ref}</td>
              <td>{b.cname}</td>
              <td>{b.phone}</td>
              <td>{b.sbname}</td>
              <td>{b.dsbname}</td>
              <td>{date} {time}</td>
              <td>{b.status}</td>

              <td>
                <button
                  disabled={b.status === "assigned"}
                  onClick={() => onAssign(b.booking_id, b.booking_ref)}
                  className="btn"
                >
                  Assign
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}