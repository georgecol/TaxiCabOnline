import { useEffect, useState } from "react";
import { getUsers } from "../../api/adminAPI";
import type { AppUser } from "../../types/booking";
import type { JSX } from "react";

type UserGroup = "all" | "testuser" | "driver" | "admin";

const GROUP_TABS: { key: UserGroup; label: string }[] = [
  { key: "all", label: "All" },
  { key: "testuser", label: "Customers" },
  { key: "driver", label: "Drivers" },
  { key: "admin", label: "Admins" },
];

function roleLabel(role: AppUser["role"]): string {
  if (role === "testuser") return "Customer";
  if (role === "driver") return "Driver";
  return "Admin";
}

function RoleBadge({ role }: { role: AppUser["role"] }) {
  const styles: Record<AppUser["role"], string> = {
    testuser: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-700/50",
    driver: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-700/50",
    admin: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-700/50",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}>
      {roleLabel(role)}
    </span>
  );
}

function formatJoined(dateStr?: string, id?: string): string {
  if (dateStr) {
    return new Date(dateStr).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
  }
  if (id?.length === 24) {
    const ts = parseInt(id.slice(0, 8), 16) * 1000;
    return new Date(ts).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
  }
  return "—";
}

const thClass = "px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap text-left";
const tdBase = "px-4 py-3";

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
        No users found.
      </td>
    </tr>
  );
}

function CustomerTable({ users }: { users: AppUser[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <th className={thClass}>Name</th>
          <th className={thClass}>Username</th>
          <th className={thClass}>Phone</th>
          <th className={thClass}>Email</th>
          <th className={thClass}>Joined</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {users.length === 0 ? (
          <EmptyRow cols={5} />
        ) : (
          users.map((u) => (
            <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className={`${tdBase} font-medium text-gray-900 dark:text-gray-100`}>{u.name}</td>
              <td className={`${tdBase} text-gray-500 dark:text-gray-400`}>@{u.username}</td>
              <td className={`${tdBase} text-gray-600 dark:text-gray-300`}>{u.phone}</td>
              <td className={`${tdBase} text-gray-500 dark:text-gray-400`}>{u.email || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
              <td className={`${tdBase} text-gray-400 dark:text-gray-500`}>{formatJoined(u.created_at, u._id)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function DriverTable({ users }: { users: AppUser[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <th className={thClass}>Name</th>
          <th className={thClass}>Username</th>
          <th className={thClass}>Phone</th>
          <th className={thClass}>Email</th>
          <th className={thClass}>Current Location</th>
          <th className={thClass}>Joined</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {users.length === 0 ? (
          <EmptyRow cols={6} />
        ) : (
          users.map((u) => (
            <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className={`${tdBase} font-medium text-gray-900 dark:text-gray-100`}>{u.name}</td>
              <td className={`${tdBase} text-gray-500 dark:text-gray-400`}>@{u.username}</td>
              <td className={`${tdBase} text-gray-600 dark:text-gray-300`}>{u.phone}</td>
              <td className={`${tdBase} text-gray-500 dark:text-gray-400`}>{u.email || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
              <td className={tdBase}>
                {u.location_label ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-700/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    {u.location_label}
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">—</span>
                )}
              </td>
              <td className={`${tdBase} text-gray-400 dark:text-gray-500`}>{formatJoined(u.created_at, u._id)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function AllTable({ users }: { users: AppUser[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <th className={thClass}>Name</th>
          <th className={thClass}>Username</th>
          <th className={thClass}>Phone</th>
          <th className={thClass}>Email</th>
          <th className={thClass}>Role</th>
          <th className={thClass}>Joined</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {users.length === 0 ? (
          <EmptyRow cols={6} />
        ) : (
          users.map((u) => (
            <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className={`${tdBase} font-medium text-gray-900 dark:text-gray-100`}>{u.name}</td>
              <td className={`${tdBase} text-gray-500 dark:text-gray-400`}>@{u.username}</td>
              <td className={`${tdBase} text-gray-600 dark:text-gray-300`}>{u.phone}</td>
              <td className={`${tdBase} text-gray-500 dark:text-gray-400`}>{u.email || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
              <td className={tdBase}>
                <RoleBadge role={u.role} />
              </td>
              <td className={`${tdBase} text-gray-400 dark:text-gray-500`}>{formatJoined(u.created_at, u._id)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function AdminUserTable({ users }: { users: AppUser[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <th className={thClass}>Name</th>
          <th className={thClass}>Username</th>
          <th className={thClass}>Phone</th>
          <th className={thClass}>Email</th>
          <th className={thClass}>Joined</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {users.length === 0 ? (
          <EmptyRow cols={5} />
        ) : (
          users.map((u) => (
            <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className={`${tdBase} font-medium text-gray-900 dark:text-gray-100`}>{u.name}</td>
              <td className={`${tdBase} text-gray-500 dark:text-gray-400`}>@{u.username}</td>
              <td className={`${tdBase} text-gray-600 dark:text-gray-300`}>{u.phone}</td>
              <td className={`${tdBase} text-gray-500 dark:text-gray-400`}>{u.email || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
              <td className={`${tdBase} text-gray-400 dark:text-gray-500`}>{formatJoined(u.created_at, u._id)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default function UsersTab(): JSX.Element {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [group, setGroup] = useState<UserGroup>("all");

  useEffect(() => {
    getUsers().then((res) => {
      if (res.success) {
        setUsers(res.data ?? []);
      } else {
        setError("Failed to load users");
      }
      setLoading(false);
    });
  }, []);

  const filtered =
    group === "all" ? users : users.filter((u) => u.role === group);

  const counts: Record<UserGroup, number> = {
    all: users.length,
    testuser: users.filter((u) => u.role === "testuser").length,
    driver: users.filter((u) => u.role === "driver").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {GROUP_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setGroup(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              group === key
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {label}
            <span
              className={`text-xs rounded-full px-1.5 py-0 font-medium ${
                group === key
                  ? "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {loading ? (
          <p className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">Loading…</p>
        ) : error ? (
          <p className="px-4 py-10 text-center text-sm text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            {group === "all" && <AllTable users={filtered} />}
            {group === "testuser" && <CustomerTable users={filtered} />}
            {group === "driver" && <DriverTable users={filtered} />}
            {group === "admin" && <AdminUserTable users={filtered} />}
          </div>
        )}
      </div>
    </div>
  );
}
