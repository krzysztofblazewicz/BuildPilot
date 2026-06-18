import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Compass, LogOut, Plus, Settings as SettingsIcon, LayoutDashboard } from "lucide-react";

export function Logo({ className = "" }) {
  return (
    <Link
      to="/"
      data-testid="brand-logo"
      className={`flex items-center gap-2 text-white ${className}`}
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600/15 ring-1 ring-indigo-500/30">
        <Compass className="h-4 w-4 text-indigo-300" />
      </span>
      <span className="font-heading text-lg font-bold tracking-tight">
        Build<span className="text-indigo-400">Pilot</span>
      </span>
    </Link>
  );
}

export default function Navbar({ variant = "marketing" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />
        {variant === "marketing" ? (
          <nav className="flex items-center gap-2">
            <a
              href="#features"
              data-testid="nav-features-link"
              className="hidden text-sm text-zinc-400 hover:text-white sm:inline-block px-3 py-2"
            >
              Features
            </a>
            <a
              href="#how"
              data-testid="nav-how-link"
              className="hidden text-sm text-zinc-400 hover:text-white sm:inline-block px-3 py-2"
            >
              How it works
            </a>
            {user ? (
              <Link
                to="/dashboard"
                data-testid="nav-dashboard-link"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  data-testid="nav-login-link"
                  className="rounded-md border border-white/10 px-4 py-2 text-sm text-white hover:border-white/30 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  data-testid="nav-signup-link"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.7)]"
                >
                  Start building
                </Link>
              </>
            )}
          </nav>
        ) : (
          <nav className="flex items-center gap-1">
            <NavLink
              to="/dashboard"
              data-testid="nav-app-dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-white/5 text-white" : "text-zinc-400 hover:text-white"
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </NavLink>
            <NavLink
              to="/projects/new"
              data-testid="nav-app-new-project"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-white/5 text-white" : "text-zinc-400 hover:text-white"
                }`
              }
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New project</span>
            </NavLink>
            <NavLink
              to="/settings"
              data-testid="nav-app-settings"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-white/5 text-white" : "text-zinc-400 hover:text-white"
                }`
              }
            >
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </NavLink>
            <button
              data-testid="nav-app-logout"
              onClick={handleLogout}
              className="ml-2 flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-white/30 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
