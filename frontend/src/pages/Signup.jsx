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
    <div className="min-h-screen bg-[#050505] text-white grid lg:grid-cols-2">
      <div className="flex min-h-screen flex-col px-6 py-10 lg:px-16">
        <Logo />
        <div className="flex flex-1 items-center">
          <div className="w-full max-w-md">
            <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
              Create account
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-white">
              Start building smarter.
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Free forever for your first projects. No credit card.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Name
                </label>
                <input
                  data-testid="signup-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-base"
                  placeholder="Ada Lovelace"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Email
                </label>
                <input
                  data-testid="signup-email-input"
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
                  data-testid="signup-password-input"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base"
                  placeholder="Min 6 characters"
                />
              </div>
              {err && (
                <div
                  data-testid="signup-error"
                  className="rounded-md border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-zinc-200"
                >
                  {err}
                </div>
              )}
              <button
                data-testid="signup-submit-button"
                type="submit"
                disabled={loading}
                className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium"
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
                className="text-white underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden border-l border-white/10 bg-[#080808]">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 30% 60%, rgba(255,255,255,0.08), transparent 70%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
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
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-300" />
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
