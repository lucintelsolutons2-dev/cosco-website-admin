import { useState } from "react";
import { FiLock, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  // Optional convenience prefill for the single-admin tool (values come from
  // env, not committed source). NOTE: on a public deployment this exposes the
  // password in the client bundle — keep it low-value / rotatable.
  const [email, setEmail] = useState(import.meta.env.VITE_ADMIN_EMAIL || "");
  const [password, setPassword] = useState(import.meta.env.VITE_ADMIN_PW || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) setError(error.message || "Sign in failed.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 p-6">
      <form onSubmit={onSubmit} className="card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <FiLock size={22} />
          </div>
          <h1 className="mt-4 text-lg font-bold text-ink-900">Cosco Admin</h1>
          <p className="text-sm text-ink-400">Sign in to view website submissions</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
            <FiAlertCircle className="shrink-0" /> {error}
          </div>
        )}

        <label className="mb-1 block text-xs font-semibold text-ink-500">Email</label>
        <input className="input mb-3" type="email" autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="admin@coscoedu.com" required />

        <label className="mb-1 block text-xs font-semibold text-ink-500">Password</label>
        <input className="input mb-5" type="password" autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
