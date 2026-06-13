import type { JSX } from "react";

type Props = {
  name: string;
  onGoAdmin: () => void;
  onGoTestBooking: () => void;
  onGoMyBookings: () => void;
};

export default function AdminHomePage({ name, onGoAdmin, onGoTestBooking, onGoMyBookings }: Props): JSX.Element {
  return (
    <div className="max-w-lg mx-auto p-10 space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome, {name}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">What would you like to do?</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onGoAdmin}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors text-left group shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">Admin Dashboard</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage bookings, assign drivers, view users</p>
          </div>
        </button>

        <button
          onClick={onGoTestBooking}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-colors text-left group shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">Test Booking Creation</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Create a booking like a customer using your own account</p>
          </div>
        </button>

        <button
          onClick={onGoMyBookings}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-colors text-left group shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">My Bookings</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View and manage your own bookings</p>
          </div>
        </button>
      </div>
    </div>
  );
}
