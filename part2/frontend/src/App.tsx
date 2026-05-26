import { useState, type ReactElement } from "react";
import { useAuth } from "./context/AuthContext";
import BookingPage from "./pages/BookingPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import MyBookingsPage from "./pages/MyBookingsPage";
import DriverBookingsPage from "./pages/DriverBookingsPage";
import LoginPage from "./pages/LoginPage";

type Page = "booking" | "admin" | "mybookings" | "assignments" | "profile";

function defaultPage(role: string): Page {
  if (role === "driver") return "assignments";
  return "booking";
}

export default function App(): ReactElement {
  const { user, logout } = useAuth();
  const [page, setPage] = useState<Page>(() => defaultPage(user?.role ?? ""));

  if (!user) return <LoginPage />;

  const isDriver = user.role === "driver";
  const isAdmin = user.role === "admin";

  function navBtn(to: Page, label: string) {
    return (
      <button
        key={to}
        className={`btn ${page === to ? "bg-blue-600 text-white" : ""}`}
        onClick={() => setPage(to)}
      >
        {label}
      </button>
    );
  }

  return (
    <div>
      <div className="flex gap-2 p-4 border-b items-center">
        {!isDriver && navBtn("booking", "Home")}
        {isAdmin && navBtn("admin", "Admin Dashboard")}
        {isDriver && navBtn("assignments", "My Assignments")}
        {!isDriver && navBtn("mybookings", "My Bookings")}
        {navBtn("profile", "Profile")}

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
      {page === "assignments" && <DriverBookingsPage />}
      {page === "profile" && <ProfilePage />}
    </div>
  );
}
