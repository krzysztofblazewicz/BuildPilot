import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Navbar";
import { Loader2, ArrowRight } from "lucide-react";
import { formatApiError } from "@/lib/api";

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (e2) {
      setErr(formatApiError(e2?.response?.data?.detail) || e2.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white grid lg:grid-cols-2">
      <div className="flex min-h-screen flex-col px-6 py-10 lg:px-16">
        <Logo />
        <div className="flex flex-1 items-center">
          <div className="w-full max-w-md">
            <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-indigo-300">
              Create account
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight">
              Start building smarter.
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Free forever for your first projects. No credit card.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-400">
                  Name
                </label>
                <input
                  data-testid="signup-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Ada Lovelace"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-400">
                  Email
                </label>
                <input
                  data-testid="signup-email-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="you@buildpilot.app"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-400">
                  Password
                </label>
                <input
                  data-testid="signup-password-input"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Min 6 characters"
                />
              </div>
              {err && (
                <div
                  data-testid="signup-error"
                  className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                >
                  {err}
                </div>
              )}
              <button
                data-testid="signup-submit-button"
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.7)] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Create my account
              </button>
            </form>

            <p className="mt-6 text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                to="/login"
                data-testid="signup-to-login-link"
                className="text-indigo-400 hover:text-indigo-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden border-l border-white/10">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-bl from-indigo-600/20 via-transparent to-black" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-300">
              What you get
            </div>
            <ul className="mt-6 space-y-4 text-sm text-zinc-300">
              {[
                "Plans for unlimited projects",
                "MVP scope + tech stack tailored to you",
                "Week-by-week 4-week roadmap",
                "Risk & ethics flags before you build",
                "Exportable plan ready to share",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
