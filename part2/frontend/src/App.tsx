import { useState, type ReactElement } from "react";
import { useAuth } from "./context/AuthContext";
import BookingPage from "./pages/BookingPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import MyBookingsPage from "./pages/MyBookingsPage";
import LoginPage from "./pages/LoginPage";

type Page = "booking" | "admin" | "mybookings" | "profile";

export default function App(): ReactElement {
  const { user, logout } = useAuth();
  const [page, setPage] = useState<Page>("booking");

  if (!user) return <LoginPage />;

  return (
    <div>
      <div className="flex gap-2 p-4 border-b items-center">
        <button
          className={`btn ${page === "booking" ? "bg-blue-600 text-white" : ""}`}
          onClick={() => setPage("booking")}
        >
          Home
        </button>

        {user.role === "admin" && (
          <button
            className={`btn ${page === "admin" ? "bg-blue-600 text-white" : ""}`}
            onClick={() => setPage("admin")}
          >
            Admin
          </button>
        )}

        <button
          className={`btn ${page === "mybookings" ? "bg-blue-600 text-white" : ""}`}
          onClick={() => setPage("mybookings")}
        >
          My Bookings
        </button>

        <button
          className={`btn ${page === "profile" ? "bg-blue-600 text-white" : ""}`}
          onClick={() => setPage("profile")}
        >
          Profile
        </button>

        <div className="ml-auto flex items-center gap-3 text-sm text-gray-600">
          <span className="font-medium">{user.name || user.username}</span>
          <span className="text-gray-400">({user.role})</span>
          <button onClick={logout} className="text-red-600 hover:underline">
            Logout
          </button>
        </div>
      </div>

      {page === "booking" && <BookingPage />}
      {page === "admin" && <AdminPage />}
      {page === "mybookings" && <MyBookingsPage />}
      {page === "profile" && <ProfilePage />}
    </div>
  );
}
