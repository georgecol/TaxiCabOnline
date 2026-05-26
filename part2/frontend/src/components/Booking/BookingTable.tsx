import type { Booking } from "../../types/booking";
import type { JSX } from "react";

type Props = {
  bookings: Booking[];
  onAssign: (id: string) => void;
};

export default function BookingTable({ bookings, onAssign }: Props): JSX.Element {
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
          <th>Date &amp; Time</th>
          <th>Status</th>
          <th>Driver</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {bookings.map((b) => {
          const date = b.pickup_date?.split("-")?.reverse()?.join("/") ?? "N/A";
          const time = b.pickup_time?.split(":")?.slice(0, 2)?.join(":") ?? "";

          return (
            <tr key={b._id}>
              <td>{b.booking_ref}</td>
              <td>{b.cname}</td>
              <td>{b.phone}</td>
              <td>{b.pickup_address ?? "—"}</td>
              <td>{b.dest_address ?? "—"}</td>
              <td>{date} {time}</td>
              <td>
                {b.status === "assigned" ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Assigned</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Unassigned</span>
                )}
              </td>
              <td className="text-sm text-gray-600">
                {b.driver_name ? (
                  <span>{b.driver_name}</span>
                ) : "—"}
              </td>
              <td>
                <button
                  disabled={b.status === "assigned"}
                  onClick={() => onAssign(b._id)}
                  className="btn"
                >
                  {b.status === "assigned" ? "Assigned" : "Assign"}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
