import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api, { formatApiError } from "@/lib/api";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const GOAL_TYPES = ["Startup", "University Project", "Portfolio Project", "Business"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const TIMEFRAMES = ["1 week", "2 weeks", "1 month", "3 months", "6 months"];

const LOADER_STEPS = [
  "Parsing your idea…",
  "Refining problem statement…",
  "Scoping the MVP…",
  "Picking a tech stack…",
  "Laying out the 4-week roadmap…",
  "Scoring feasibility, originality, market…",
];

export default function CreateProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    idea: "",
    target_user: "",
    problem: "",
    goal_type: "Startup",
    skill_level: "Beginner",
    timeframe: "1 month",
    preferred_tech: "",
    team_size: "1",
    constraints: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (form.idea.trim().length < 6) {
      setErr("Please describe your idea in a sentence or two.");
      return;
    }
    setLoading(true);
    setStep(0);
    const stepInterval = setInterval(() => {
      setStep((s) => Math.min(s + 1, LOADER_STEPS.length - 1));
    }, 600);
    const minDelay = new Promise((res) => setTimeout(res, 2500));
    try {
      const created = await api.post("/projects", form);
      const generated = await api.post(`/projects/${created.data.id}/generate`);
      await minDelay;
      navigate(`/projects/${generated.data.id}`, { replace: true });
    } catch (e2) {
      setErr(formatApiError(e2?.response?.data?.detail) || e2.message);
      setLoading(false);
    } finally {
      clearInterval(stepInterval);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar variant="app" />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          to="/dashboard"
          data-testid="create-back-link"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
        <div className="mt-4">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-300">
            New project
          </div>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Describe your idea
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            The more honest you are, the better the plan. Don't worry, you can refine it later.
          </p>
        </div>

        <form onSubmit={submit} className="mt-10 space-y-6">
          <Field label="Rough project idea" required>
            <textarea
              data-testid="form-idea-textarea"
              required
              rows={4}
              value={form.idea}
              onChange={update("idea")}
              className="textarea-base"
              placeholder="A small app that helps CS students keep track of internship applications and their deadlines…"
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Target user">
              <input
                data-testid="form-target-user-input"
                value={form.target_user}
                onChange={update("target_user")}
                className="input-base"
                placeholder="e.g., CS undergrads"
              />
            </Field>
            <Field label="Problem it solves">
              <input
                data-testid="form-problem-input"
                value={form.problem}
                onChange={update("problem")}
                className="input-base"
                placeholder="e.g., losing track of deadlines"
              />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <Field label="Goal type">
              <Select
                testId="form-goal-type-select"
                value={form.goal_type}
                onChange={update("goal_type")}
                options={GOAL_TYPES}
              />
            </Field>
            <Field label="Skill level">
              <Select
                testId="form-skill-level-select"
                value={form.skill_level}
                onChange={update("skill_level")}
                options={SKILL_LEVELS}
              />
            </Field>
            <Field label="Timeframe">
              <Select
                testId="form-timeframe-select"
                value={form.timeframe}
                onChange={update("timeframe")}
                options={TIMEFRAMES}
              />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Preferred technologies">
              <input
                data-testid="form-tech-input"
                value={form.preferred_tech}
                onChange={update("preferred_tech")}
                className="input-base"
                placeholder="React, Python, MongoDB…"
              />
            </Field>
            <Field label="Team size">
              <input
                data-testid="form-team-input"
                value={form.team_size}
                onChange={update("team_size")}
                className="input-base"
                placeholder="e.g., solo, 2 people"
              />
            </Field>
          </div>

          <Field label="Budget / constraints">
            <input
              data-testid="form-constraints-input"
              value={form.constraints}
              onChange={update("constraints")}
              className="input-base"
              placeholder="No budget; 4 hours per week available; must run on a free tier…"
            />
          </Field>

          <Field label="Additional notes">
            <textarea
              data-testid="form-notes-textarea"
              rows={3}
              value={form.notes}
              onChange={update("notes")}
              className="textarea-base"
              placeholder="Anything else BuildPilot should know? Vibes, references, constraints, dreams."
            />
          </Field>

          {err && (
            <div
              data-testid="create-error"
              className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {err}
            </div>
          )}

          <div className="pt-4">
            <div className="relative rounded-lg p-[1px] tracing-border">
              <button
                data-testid="generate-plan-button"
                type="submit"
                disabled={loading}
                className="relative w-full rounded-lg bg-indigo-600 px-6 py-4 text-base font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-90 disabled:cursor-progress"
              >
                <span className="inline-flex items-center gap-2">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                  {loading ? LOADER_STEPS[step] : "Generate Build Plan"}
                </span>
              </button>
            </div>
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Mock AI for now · No keys required
            </p>
          </div>
        </form>
      </main>

      <style>{`
        .input-base, .textarea-base {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid rgba(255,255,255,0.1);
          background: #18181b;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input-base:focus, .textarea-base:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 1px #6366f1;
        }
        .textarea-base { resize: vertical; min-height: 90px; }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-400">
        {label}
        {required && <span className="ml-1 text-indigo-400">*</span>}
      </span>
      {children}
    </label>
  );
}

function Select({ value, onChange, options, testId }) {
  return (
    <select
      data-testid={testId}
      value={value}
      onChange={onChange}
      className="input-base appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a1a1aa%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:14px_14px] bg-[right_10px_center] bg-no-repeat pr-9"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-zinc-900">
          {o}
        </option>
      ))}
    </select>
  );
}
