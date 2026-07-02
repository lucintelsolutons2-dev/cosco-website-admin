import { NavLink } from "react-router-dom";
import { FiGrid, FiInbox, FiGift, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/", label: "Dashboard", icon: FiGrid, end: true },
  { to: "/enquiries", label: "Enquiries", icon: FiInbox },
  { to: "/lucky-draw", label: "Lucky Draw", icon: FiGift },
];

export default function Layout({ children }) {
  const { session, signOut } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-ink-100 bg-white p-4 md:flex">
        <div className="mb-6 px-2 pt-2">
          <div className="text-lg font-extrabold text-ink-900">COSCO<span className="text-brand-600">.</span></div>
          <div className="text-xs text-ink-400">Admin panel</div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-50"
                }`}>
              <n.icon size={18} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-100 pt-3">
          <p className="truncate px-3 pb-2 text-xs text-ink-400">{session?.user?.email}</p>
          <button onClick={signOut} className="btn-ghost w-full justify-start">
            <FiLogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:pl-60">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-ink-100 bg-white px-4 py-3 md:hidden">
          <div className="text-base font-extrabold text-ink-900">COSCO<span className="text-brand-600">.</span> Admin</div>
          <button onClick={signOut} className="btn-ghost px-3 py-1.5 text-xs"><FiLogOut size={14} /> Sign out</button>
        </header>
        <div className="flex gap-1 border-b border-ink-100 bg-white px-2 md:hidden">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold ${
                  isActive ? "border-b-2 border-brand-600 text-brand-700" : "text-ink-500"
                }`}>
              <n.icon size={16} /> {n.label}
            </NavLink>
          ))}
        </div>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
