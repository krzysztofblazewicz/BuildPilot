import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Navbar";
import { Loader2, ArrowRight } from "lucide-react";
import { formatApiError } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const from = location.state?.from || "/dashboard";

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (e2) {
      setErr(formatApiError(e2?.response?.data?.detail) || e2.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white grid lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex min-h-screen flex-col px-6 py-10 lg:px-16">
        <Logo />
        <div className="flex flex-1 items-center">
          <div className="w-full max-w-md">
            <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-indigo-300">
              Welcome back
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight">
              Sign in to BuildPilot
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Continue planning your next project.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-400">
                  Email
                </label>
                <input
                  data-testid="login-email-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="you@buildpilot.app"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-400">
                  Password
                </label>
                <input
                  data-testid="login-password-input"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>
              {err && (
                <div
                  data-testid="login-error"
                  className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                >
                  {err}
                </div>
              )}
              <button
                data-testid="login-submit-button"
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.7)] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Sign in
              </button>
            </form>

            <p className="mt-6 text-sm text-zinc-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                data-testid="login-to-signup-link"
                className="text-indigo-400 hover:text-indigo-300"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right: visual */}
      <div className="relative hidden lg:block overflow-hidden border-l border-white/10">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-black" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-300">
              Pilot's log // entry 03
            </div>
            <p className="mt-4 font-heading text-2xl leading-tight tracking-tight">
              "I had three half-baked ideas. BuildPilot helped me pick the one
              that actually shipped — and gave me the week-by-week roadmap to
              do it."
            </p>
            <div className="mt-6 font-mono text-xs uppercase tracking-widest text-zinc-500">
              — Lina, CS senior, shipped MVP in 18 days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
