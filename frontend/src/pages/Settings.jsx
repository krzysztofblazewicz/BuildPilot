import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Mail, User, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar variant="app" />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-300">
          Settings
        </div>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Your profile
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Account information for this BuildPilot workspace.
        </p>

        <section className="mt-8 rounded-lg border border-white/10 bg-zinc-950 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/15 ring-1 ring-indigo-500/40 font-heading text-xl font-bold text-indigo-200">
              {(user.name || user.email)?.[0]?.toUpperCase()}
            </div>
            <div>
              <div data-testid="settings-name" className="font-heading text-lg font-semibold">
                {user.name}
              </div>
              <div data-testid="settings-email" className="text-sm text-zinc-400">
                {user.email}
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Row icon={User} label="Name" value={user.name} />
            <Row icon={Mail} label="Email" value={user.email} />
            <Row icon={ShieldCheck} label="Status" value="Verified workspace" />
            <Row
              icon={ShieldCheck}
              label="Member since"
              value={new Date(user.created_at).toLocaleDateString()}
            />
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-zinc-950 p-6">
          <div className="font-heading text-base font-semibold">Session</div>
          <p className="mt-2 text-sm text-zinc-400">
            Sign out of this device. You can sign back in anytime.
          </p>
          <button
            data-testid="settings-logout-button"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm text-white hover:border-white/30"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </section>
      </main>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-white/10 bg-zinc-900/40 p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.04] ring-1 ring-white/10">
        <Icon className="h-4 w-4 text-indigo-300" />
      </span>
      <div className="min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          {label}
        </div>
        <div className="truncate text-sm text-zinc-200">{value || "—"}</div>
      </div>
    </div>
  );
}
