import BookingPage from "./pages/BookingPage";
import AdminPage from "./pages/AdminPage";
import { useState, type ReactElement } from "react";

export default function App(): ReactElement {
  const [page, setPage] = useState<"booking" | "admin">("booking");

  return (
    <div>
      {/* Simple navigation */}
      <div className="flex gap-2 p-4 border-b">
        <button
          className="btn"
          onClick={() => setPage("booking")}
        >
          Booking
        </button>

        <button
          className="btn"
          onClick={() => setPage("admin")}
        >
          Admin
        </button>
      </div>

      {/* Page render */}
      {page === "booking" ? <BookingPage /> : <AdminPage />}
    </div>
  );
}