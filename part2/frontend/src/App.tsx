import { useState, type ReactElement } from "react";
import { useAuth } from "./context/AuthContext";
import BookingPage from "./pages/BookingPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";

export default function App(): ReactElement {
  const { user, logout } = useAuth();
  const [page, setPage] = useState<"booking" | "admin">("booking");

  if (!user) return <LoginPage />;

  return (
    <div>
      <div className="flex gap-2 p-4 border-b items-center">
        <button className="btn" onClick={() => setPage("booking")}>
          Booking
        </button>

        {user.role === "admin" && (
          <button className="btn" onClick={() => setPage("admin")}>
            Admin
          </button>
        )}

        <div className="ml-auto flex items-center gap-3 text-sm text-gray-600">
          <span className="font-medium">{user.username}</span>
          <span className="text-gray-400">({user.role})</span>
          <button
            onClick={logout}
            className="text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      {page === "booking" ? <BookingPage /> : <AdminPage />}
    </div>
  );
}
