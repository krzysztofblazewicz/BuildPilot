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
    <div className="min-h-screen bg-[#050505] text-white grid lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex min-h-screen flex-col px-6 py-10 lg:px-16">
        <Logo />
        <div className="flex flex-1 items-center">
          <div className="w-full max-w-md">
            <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
              Welcome back
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-white">
              Sign in to BuildPilot
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Continue planning your next project.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Email
                </label>
                <input
                  data-testid="login-email-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base"
                  placeholder="you@buildpilot.app"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Password
                </label>
                <input
                  data-testid="login-password-input"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base"
                  placeholder="••••••••"
                />
              </div>
              {err && (
                <div
                  data-testid="login-error"
                  className="rounded-md border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-zinc-200"
                >
                  {err}
                </div>
              )}
              <button
                data-testid="login-submit-button"
                type="submit"
                disabled={loading}
                className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium"
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
                className="text-white underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right: visual */}
      <div className="relative hidden lg:block overflow-hidden border-l border-white/10 bg-[#080808]">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 70% 40%, rgba(255,255,255,0.08), transparent 70%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
              Pilot's log // entry 03
            </div>
            <p className="mt-4 font-heading text-2xl leading-tight tracking-tight text-zinc-100">
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
