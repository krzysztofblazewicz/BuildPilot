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
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
        <Compass className="h-4 w-4 text-zinc-200" />
      </span>
      <span className="font-heading text-lg font-bold tracking-tight">
        Build<span className="text-zinc-400">Pilot</span>
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />
        {variant === "marketing" ? (
          <nav className="flex items-center gap-1">
            <a
              href="#features"
              data-testid="nav-features-link"
              className="hidden sm:inline-block px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how"
              data-testid="nav-how-link"
              className="hidden sm:inline-block px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              How it works
            </a>
            {user ? (
              <Link
                to="/dashboard"
                data-testid="nav-dashboard-link"
                className="btn-primary rounded-md px-4 py-2 text-sm font-medium"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  data-testid="nav-login-link"
                  className="btn-secondary rounded-md px-4 py-2 text-sm"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  data-testid="nav-signup-link"
                  className="btn-primary rounded-md px-4 py-2 text-sm font-medium"
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
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
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
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
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
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                }`
              }
            >
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </NavLink>
            <button
              data-testid="nav-app-logout"
              onClick={handleLogout}
              className="btn-secondary ml-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm"
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
