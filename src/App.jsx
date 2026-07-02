import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Enquiries from "./pages/Enquiries";
import LuckyDraw from "./pages/LuckyDraw";

function NotConfigured() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="card max-w-md p-8 text-center">
        <h1 className="text-xl font-bold text-ink-900">Setup needed</h1>
        <p className="mt-3 text-sm text-ink-500">
          Supabase isn't configured yet. Copy <code className="rounded bg-ink-100 px-1">.env.example</code> to{" "}
          <code className="rounded bg-ink-100 px-1">.env.local</code>, fill in your project URL and publishable key,
          then restart the dev server.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const { session, loading, isConfigured } = useAuth();

  if (!isConfigured) return <NotConfigured />;
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink-400">Loading…</div>;
  }
  if (!session) return <Login />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/enquiries" element={<Enquiries />} />
        <Route path="/lucky-draw" element={<LuckyDraw />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
