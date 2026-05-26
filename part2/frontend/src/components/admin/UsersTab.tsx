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
    testuser: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    driver: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    admin: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
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

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-sm text-gray-400">
        No users found.
      </td>
    </tr>
  );
}

function CustomerTable({ users }: { users: AppUser[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left">
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Name</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Username</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Phone</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Email</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Joined</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {users.length === 0 ? (
          <EmptyRow cols={5} />
        ) : (
          users.map((u) => (
            <tr key={u._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
              <td className="px-4 py-3 text-gray-500">@{u.username}</td>
              <td className="px-4 py-3 text-gray-600">{u.phone}</td>
              <td className="px-4 py-3 text-gray-500">{u.email || <span className="text-gray-300">—</span>}</td>
              <td className="px-4 py-3 text-gray-400">{formatJoined(u.created_at, u._id)}</td>
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
        <tr className="border-b border-gray-200 text-left">
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Name</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Username</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Phone</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Email</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Current Location</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Joined</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {users.length === 0 ? (
          <EmptyRow cols={6} />
        ) : (
          users.map((u) => (
            <tr key={u._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
              <td className="px-4 py-3 text-gray-500">@{u.username}</td>
              <td className="px-4 py-3 text-gray-600">{u.phone}</td>
              <td className="px-4 py-3 text-gray-500">{u.email || <span className="text-gray-300">—</span>}</td>
              <td className="px-4 py-3">
                {u.location_label ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    {u.location_label}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-400">{formatJoined(u.created_at, u._id)}</td>
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
        <tr className="border-b border-gray-200 text-left">
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Name</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Username</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Phone</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Email</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Role</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Joined</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {users.length === 0 ? (
          <EmptyRow cols={6} />
        ) : (
          users.map((u) => (
            <tr key={u._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
              <td className="px-4 py-3 text-gray-500">@{u.username}</td>
              <td className="px-4 py-3 text-gray-600">{u.phone}</td>
              <td className="px-4 py-3 text-gray-500">{u.email || <span className="text-gray-300">—</span>}</td>
              <td className="px-4 py-3">
                <RoleBadge role={u.role} />
              </td>
              <td className="px-4 py-3 text-gray-400">{formatJoined(u.created_at, u._id)}</td>
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
        <tr className="border-b border-gray-200 text-left">
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Name</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Username</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Phone</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Email</th>
          <th className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">Joined</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {users.length === 0 ? (
          <EmptyRow cols={5} />
        ) : (
          users.map((u) => (
            <tr key={u._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
              <td className="px-4 py-3 text-gray-500">@{u.username}</td>
              <td className="px-4 py-3 text-gray-600">{u.phone}</td>
              <td className="px-4 py-3 text-gray-500">{u.email || <span className="text-gray-300">—</span>}</td>
              <td className="px-4 py-3 text-gray-400">{formatJoined(u.created_at, u._id)}</td>
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
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {GROUP_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setGroup(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              group === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
            <span
              className={`text-xs rounded-full px-1.5 py-0 font-medium ${
                group === key ? "bg-gray-100 text-gray-600" : "bg-gray-200 text-gray-500"
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <p className="px-4 py-10 text-center text-sm text-gray-400">Loading…</p>
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
