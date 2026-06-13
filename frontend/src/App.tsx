import { useState, type ReactElement } from "react";
import type { Booking } from "./types/booking";
import { useAuth } from "./context/AuthContext";
import { useDarkMode } from "./hooks/useDarkMode";
import BookingPage from "./pages/BookingPage";
import AdminPage from "./pages/AdminPage";
import AdminHomePage from "./pages/AdminHomePage";
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
  const { dark, toggle } = useDarkMode();
  const [page, setPage] = useState<Page>(() => defaultPage(user?.role ?? ""));
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [testBooking, setTestBooking] = useState(false);

  function handleEditBooking(b: Booking) {
    setEditBooking(b);
    setTestBooking(true);
    setPage("booking");
  }

  if (!user) return <LoginPage />;

  const isDriver = user.role === "driver";
  const isAdmin = user.role === "admin";

  function navBtn(to: Page, label: string, onClick?: () => void) {
    const active = page === to;
    return (
      <button
        key={to}
        onClick={() => { setPage(to); onClick?.(); }}
        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
          active
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-2">

          {/* Brand */}
          <span className="text-base font-bold text-blue-600 tracking-tight mr-4 whitespace-nowrap">
            TaxiCab
          </span>

          {/* Nav links — centred */}
          <div className="flex items-center gap-1 flex-1 justify-center">
            {!isDriver && navBtn("booking", "Home", () => { setTestBooking(false); setEditBooking(null); })}
            {isAdmin && navBtn("admin", "Admin Dashboard")}
            {isDriver && navBtn("assignments", "My Assignments")}
            {!isDriver && navBtn("mybookings", "My Bookings")}
          </div>

          {/* Right — dark toggle + user + logout */}
          <div className="flex items-center gap-1 ml-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {dark ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* User / profile */}
            <button
              onClick={() => setPage("profile")}
              className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-lg text-sm transition-all duration-150 ${
                page === "profile"
                  ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-700"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {(user.name || user.username).charAt(0).toUpperCase()}
              </div>
              <span className="font-medium leading-none">{user.name || user.username}</span>
              <span className={`text-xs leading-none ${page === "profile" ? "text-blue-400 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
                {user.role}
              </span>
            </button>

            <button
              onClick={logout}
              className="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors px-2 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {page === "booking" && (
        isAdmin && !testBooking
          ? <AdminHomePage
              name={user.name || user.username}
              onGoAdmin={() => setPage("admin")}
              onGoTestBooking={() => setTestBooking(true)}
              onGoMyBookings={() => setPage("mybookings")}
            />
          : <BookingPage
              key={editBooking?._id ?? "new"}
              onViewBookings={() => { setEditBooking(null); setTestBooking(false); setPage("mybookings"); }}
              initialEditBooking={editBooking}
            />
      )}
      {page === "admin" && <AdminPage />}
      {page === "mybookings" && <MyBookingsPage onEditBooking={handleEditBooking} />}
      {page === "assignments" && <DriverBookingsPage />}
      {page === "profile" && <ProfilePage />}
    </div>
  );
}
