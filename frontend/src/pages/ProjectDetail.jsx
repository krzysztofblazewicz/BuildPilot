import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import {
  ArrowLeft,
  Download,
  Edit3,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  ListChecks,
  Wrench,
  Map as MapIcon,
  ShieldAlert,
  ScrollText,
  Gauge,
  Lightbulb,
  Save,
  X,
} from "lucide-react";

const DIFF_COLORS = {
  Easy: "border-emerald-400/40 text-emerald-200 bg-emerald-500/10",
  Medium: "border-amber-400/40 text-amber-200 bg-amber-500/10",
  Hard: "border-red-400/40 text-red-200 bg-red-500/10",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/projects/${id}`);
        if (!cancelled) {
          setProject(data);
          setDraft({
            title: data.title || "",
            idea: data.idea || "",
            target_user: data.target_user || "",
            problem: data.problem || "",
            notes: data.notes || "",
          });
        }
      } catch (e) {
        setError(e?.response?.status === 404 ? "Project not found." : "Could not load project.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const regenerate = async () => {
    setRegenLoading(true);
    try {
      const { data } = await api.post(`/projects/${id}/generate`);
      setProject(data);
    } finally {
      setRegenLoading(false);
    }
  };

  const exportPlan = () => {
    if (!project) return;
    const lines = buildMarkdown(project);
    const blob = new Blob([lines], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(project.title || "buildpilot-plan").replace(/[^a-z0-9-_]+/gi, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveEdits = async () => {
    const { data } = await api.put(`/projects/${id}`, {
      ...draft,
      status: project?.generated_plan ? "Refined" : "Draft",
    });
    setProject(data);
    setEditing(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Navbar variant="app" />
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="font-heading text-2xl">{error}</h1>
          <Link
            to="/dashboard"
            data-testid="detail-back-error"
            className="mt-4 inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
          >
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Navbar variant="app" />
        <main className="flex h-[60vh] items-center justify-center text-zinc-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading project…
        </main>
      </div>
    );
  }

  const plan = project.generated_plan;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar variant="app" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between gap-3">
          <button
            data-testid="detail-back-button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <button
              data-testid="detail-edit-toggle"
              onClick={() => setEditing((e) => !e)}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:border-white/30"
            >
              {editing ? <X className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
              {editing ? "Cancel" : "Edit Project"}
            </button>
            <button
              data-testid="detail-export-button"
              onClick={exportPlan}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:border-white/30"
            >
              <Download className="h-3.5 w-3.5" />
              Export Plan
            </button>
            <button
              data-testid="detail-regenerate-button"
              onClick={regenerate}
              disabled={regenLoading}
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_18px_-4px_rgba(99,102,241,0.7)] disabled:opacity-60"
            >
              {regenLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Regenerate Plan
            </button>
          </div>
        </div>

        {/* Header */}
        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-indigo-300">
              {project.goal_type}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-zinc-300">
              {project.status}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-zinc-300">
              {project.skill_level}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-zinc-300">
              {project.timeframe}
            </span>
          </div>
          {editing ? (
            <input
              data-testid="edit-title-input"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="mt-3 w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-2xl font-heading font-bold tracking-tight outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          ) : (
            <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {project.title}
            </h1>
          )}
          {plan?.pitch && !editing && (
            <p className="mt-3 max-w-3xl text-base text-zinc-300">{plan.pitch}</p>
          )}
        </header>

        {editing && (
          <div className="mt-6 rounded-lg border border-white/10 bg-zinc-950 p-6 space-y-4">
            <EditField label="Rough idea">
              <textarea
                data-testid="edit-idea-textarea"
                rows={3}
                value={draft.idea}
                onChange={(e) => setDraft({ ...draft, idea: e.target.value })}
                className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </EditField>
            <div className="grid gap-4 sm:grid-cols-2">
              <EditField label="Target user">
                <input
                  data-testid="edit-target-input"
                  value={draft.target_user}
                  onChange={(e) => setDraft({ ...draft, target_user: e.target.value })}
                  className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </EditField>
              <EditField label="Problem">
                <input
                  data-testid="edit-problem-input"
                  value={draft.problem}
                  onChange={(e) => setDraft({ ...draft, problem: e.target.value })}
                  className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </EditField>
            </div>
            <EditField label="Notes">
              <textarea
                data-testid="edit-notes-textarea"
                rows={2}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </EditField>
            <button
              data-testid="edit-save-button"
              onClick={saveEdits}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              <Save className="h-4 w-4" /> Save changes
            </button>
          </div>
        )}

        {!plan ? (
          <NoPlan onGenerate={regenerate} loading={regenLoading} />
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-12">
            <Score score={plan.score} className="md:col-span-12" />
            <Card title="Problem Statement" icon={Target} className="md:col-span-7">
              <p className="text-sm text-zinc-300">{plan.problem_statement}</p>
              <div className="mt-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
                Target: {plan.target_users}
              </div>
            </Card>
            <Card title="One-line pitch" icon={Sparkles} className="md:col-span-5">
              <p className="text-sm text-indigo-200">{plan.pitch}</p>
            </Card>

            <Card title="MVP Features" icon={ListChecks} className="md:col-span-7">
              <List items={plan.mvp_features} accent="indigo" />
            </Card>
            <Card title="Nice-to-haves" icon={Lightbulb} className="md:col-span-5">
              <List items={plan.nice_to_have_features} accent="zinc" />
            </Card>

            <Card title="Suggested Tech Stack" icon={Wrench} className="md:col-span-7">
              <div className="grid gap-2.5 sm:grid-cols-2">
                {Object.entries(plan.tech_stack || {}).map(([k, v]) => (
                  <div key={k} className="rounded-md border border-white/10 bg-zinc-900/50 p-3">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-indigo-300">
                      {k.replace(/_/g, " ")}
                    </div>
                    <div className="mt-1 text-sm text-zinc-200">{v}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Risks & Challenges" icon={ShieldAlert} className="md:col-span-5">
              <List items={plan.risks} accent="red" />
            </Card>

            <Card title="4-Week Build Roadmap" icon={MapIcon} className="md:col-span-12">
              <div className="grid gap-3 md:grid-cols-4">
                {(plan.roadmap || []).map((wk) => (
                  <div key={wk.week} className="rounded-md border border-white/10 bg-zinc-900/40 p-4">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-indigo-300">
                      Week {wk.week}
                    </div>
                    <div className="mt-1 font-heading text-sm font-semibold tracking-tight text-white">
                      {wk.title}
                    </div>
                    <ul className="mt-3 space-y-2 text-xs text-zinc-300">
                      {(wk.tasks || []).map((t, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-indigo-400" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Ethics & Privacy" icon={ScrollText} className="md:col-span-6">
              <List items={plan.ethics} accent="zinc" />
            </Card>
            <Card title="Your Next 3 Actions" icon={Gauge} className="md:col-span-6">
              <ol className="space-y-2 text-sm text-zinc-200">
                {(plan.next_actions || []).map((t, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-md border border-indigo-500/20 bg-indigo-500/5 p-3"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

function EditField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function Card({ title, icon: Icon, children, className = "" }) {
  return (
    <section
      data-testid={`section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
      className={`rounded-lg border border-white/10 bg-zinc-950 p-6 ${className}`}
    >
      <header className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600/15 ring-1 ring-indigo-500/30">
          <Icon className="h-3.5 w-3.5 text-indigo-300" />
        </span>
        <h3 className="font-heading text-base font-semibold tracking-tight">{title}</h3>
      </header>
      {children}
    </section>
  );
}

function List({ items, accent = "indigo" }) {
  const dot =
    accent === "red"
      ? "bg-red-400"
      : accent === "zinc"
      ? "bg-zinc-400"
      : "bg-indigo-400";
  return (
    <ul className="space-y-2.5 text-sm text-zinc-300">
      {(items || []).map((t, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function Score({ score, className = "" }) {
  if (!score) return null;
  const ring = [
    { key: "feasibility", label: "Feasibility", val: score.feasibility },
    { key: "originality", label: "Originality", val: score.originality },
    { key: "market_potential", label: "Market potential", val: score.market_potential },
  ];
  return (
    <section
      data-testid="idea-score-card"
      className={`relative overflow-hidden rounded-lg border border-indigo-500/30 bg-zinc-950 p-6 ${className}`}
    >
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="relative grid items-center gap-6 md:grid-cols-4">
        {ring.map((r) => (
          <div key={r.key} className="flex items-center gap-4">
            <RingMetric value={r.val} />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-indigo-300">
                {r.label}
              </div>
              <div className="font-heading text-2xl font-bold tracking-tight">{r.val}%</div>
            </div>
          </div>
        ))}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-indigo-300">
            Build difficulty
          </div>
          <div
            data-testid="difficulty-badge"
            className={`mt-1 inline-flex items-center rounded-full border px-3 py-1 text-sm font-mono uppercase tracking-widest ${
              DIFF_COLORS[score.difficulty] || DIFF_COLORS.Medium
            }`}
          >
            {score.difficulty}
          </div>
        </div>
      </div>
    </section>
  );
}

function RingMetric({ value }) {
  const v = Math.max(0, Math.min(100, value || 0));
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none" />
      <circle
        cx="28"
        cy="28"
        r={r}
        stroke="#6366f1"
        strokeWidth="5"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: "stroke-dashoffset 600ms ease-out" }}
      />
    </svg>
  );
}

function NoPlan({ onGenerate, loading }) {
  return (
    <div className="mt-10 rounded-xl border border-dashed border-white/10 bg-zinc-950 p-12 text-center">
      <Sparkles className="mx-auto h-6 w-6 text-indigo-300" />
      <h3 className="mt-3 font-heading text-xl font-semibold">No plan generated yet</h3>
      <p className="mt-2 text-sm text-zinc-400">
        Generate a build plan from the project details on file.
      </p>
      <button
        data-testid="empty-generate-plan-button"
        onClick={onGenerate}
        disabled={loading}
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Generate plan
      </button>
    </div>
  );
}

function buildMarkdown(project) {
  const p = project.generated_plan;
  const lines = [];
  lines.push(`# ${project.title}`);
  lines.push("");
  if (p?.pitch) lines.push(`> ${p.pitch}`);
  lines.push("");
  lines.push(`- **Goal**: ${project.goal_type}`);
  lines.push(`- **Skill level**: ${project.skill_level}`);
  lines.push(`- **Timeframe**: ${project.timeframe}`);
  lines.push(`- **Status**: ${project.status}`);
  lines.push("");
  if (!p) return lines.join("\n");
  lines.push(`## Problem statement\n${p.problem_statement}\n`);
  lines.push(`## Target users\n${p.target_users}\n`);
  lines.push(`## MVP features\n${p.mvp_features.map((x) => `- ${x}`).join("\n")}\n`);
  lines.push(`## Nice-to-haves\n${p.nice_to_have_features.map((x) => `- ${x}`).join("\n")}\n`);
  lines.push(`## Tech stack`);
  Object.entries(p.tech_stack || {}).forEach(([k, v]) => lines.push(`- **${k}**: ${v}`));
  lines.push("");
  lines.push(`## 4-week roadmap`);
  (p.roadmap || []).forEach((wk) => {
    lines.push(`\n### Week ${wk.week} — ${wk.title}`);
    (wk.tasks || []).forEach((t) => lines.push(`- ${t}`));
  });
  lines.push("");
  lines.push(`## Risks\n${p.risks.map((x) => `- ${x}`).join("\n")}\n`);
  lines.push(`## Ethics & privacy\n${p.ethics.map((x) => `- ${x}`).join("\n")}\n`);
  lines.push(`## Next 3 actions\n${p.next_actions.map((x, i) => `${i + 1}. ${x}`).join("\n")}\n`);
  lines.push(
    `## Idea score\n- Feasibility: ${p.score.feasibility}%\n- Originality: ${p.score.originality}%\n- Market potential: ${p.score.market_potential}%\n- Difficulty: ${p.score.difficulty}\n`
  );
  return lines.join("\n");
}
