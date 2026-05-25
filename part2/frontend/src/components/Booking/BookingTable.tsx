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
      <thead>
        <tr>
          <th>Booking Ref</th>
          <th>Customer</th>
          <th>Phone</th>
          <th>Pickup Address</th>
          <th>Destination Address</th>
          <th>Date & Time</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {bookings.map((b) => {
          const date =
            b.pickup_date?.split("-")?.reverse()?.join("/") ?? "N/A";
          const time =
            b.pickup_time?.split(":")?.slice(0, 2)?.join(":") ?? "";

          return (
            <tr key={b._id}>
              <td>{b.booking_ref}</td>
              <td>{b.cname}</td>
              <td>{b.phone}</td>
              <td>{b.pickup_address ?? "—"}</td>
              <td>{b.dest_address ?? "—"}</td>
              <td>
                {date} {time}
              </td>
              <td>{b.status}</td>

              <td>
                <button
                  disabled={b.status === "assigned"}
                  onClick={() => onAssign(b._id, b.booking_ref)}
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