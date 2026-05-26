import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

export default function ProfilePage(): JSX.Element {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const err = await updateProfile(name, phone);
    if (err) {
      setError(err);
    } else {
      setSuccess("Profile updated");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 space-y-1">
        <p><span className="font-medium">Username:</span> {user?.username}</p>
        <p><span className="font-medium">Role:</span> {user?.role}</p>
      </div>

      {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded text-sm">{error}</div>}
      {success && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input w-full"
            placeholder="10–12 digits"
          />
        </div>
        <button className="btn" disabled={loading}>
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
