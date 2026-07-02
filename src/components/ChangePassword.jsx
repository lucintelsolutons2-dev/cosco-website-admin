import { useEffect, useRef, useState } from "react";
import { FiX, FiCheckCircle, FiAlertCircle, FiKey } from "react-icons/fi";
import { supabase } from "../lib/supabase";

export default function ChangePassword({ onClose }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | done
  const [error, setError] = useState("");
  const firstRef = useRef(null);

  useEffect(() => { firstRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (pw.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (pw !== pw2) { setError("The two passwords don't match."); return; }
    setStatus("saving");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { setError(error.message || "Couldn't update password."); setStatus("idle"); return; }
    setStatus("done");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4"
      role="dialog" aria-modal="true" aria-label="Change password"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card w-full max-w-sm p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900"><FiKey /> Change password</h2>
          <button onClick={onClose} aria-label="Close" className="text-ink-400 hover:text-ink-700"><FiX size={20} /></button>
        </div>

        {status === "done" ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <FiCheckCircle className="h-10 w-10 text-green-600" />
            <p className="text-sm text-ink-600">Password updated. Use your new password the next time you sign in.</p>
            <button onClick={onClose} className="btn-primary w-full">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
                <FiAlertCircle className="shrink-0" /> {error}
              </div>
            )}
            <div>
              <label htmlFor="cp-pw" className="mb-1 block text-xs font-semibold text-ink-500">New password</label>
              <input id="cp-pw" ref={firstRef} className="input" type="password" autoComplete="new-password"
                value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
            </div>
            <div>
              <label htmlFor="cp-pw2" className="mb-1 block text-xs font-semibold text-ink-500">Confirm new password</label>
              <input id="cp-pw2" className="input" type="password" autoComplete="new-password"
                value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Re-enter new password" />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={status === "saving"}>
              {status === "saving" ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
