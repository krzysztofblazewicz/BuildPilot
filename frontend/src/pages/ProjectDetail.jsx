import { useEffect, useState, useRef } from "react";
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
  ChevronDown,
  Wand2,
  Hammer,
  Server,
  AlertTriangle,
  Rocket,
  Megaphone,
  CheckCircle2,
  Circle,
} from "lucide-react";

const DIFF_COLORS = {
  Easy: "border-emerald-400/40 text-emerald-200 bg-emerald-500/10",
  Medium: "border-amber-400/40 text-amber-200 bg-amber-500/10",
  Hard: "border-red-400/40 text-red-200 bg-red-500/10",
};

const STAGES = [
  "Idea",
  "Validating",
  "Planning",
  "Building MVP",
  "Testing",
  "Ready to Launch",
  "Launched",
];

const AI_MODES = [
  { key: "refine-idea", label: "Refine Idea", icon: Wand2 },
  { key: "build-mvp", label: "MVP Builder", icon: Hammer },
  { key: "tech-stack", label: "Tech Stack Advisor", icon: Server },
  { key: "check-risks", label: "Risk Checker", icon: AlertTriangle },
  { key: "launch-plan", label: "Launch Plan", icon: Rocket },
  { key: "generate-pitch", label: "Pitch Generator", icon: Megaphone },
];

const EXPORT_VARIANTS = [
  { key: "markdown", label: "Full Markdown Plan" },
  { key: "founder-brief", label: "Founder One-Page Brief" },
  { key: "tech-plan", label: "Technical Build Plan" },
  { key: "launch-checklist", label: "Launch Checklist" },
  { key: "pitch-summary", label: "Pitch Summary" },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [aiResults, setAiResults] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [exportOpen, setExportOpen] = useState(false);
  const [stageSaving, setStageSaving] = useState(false);
  const exportRef = useRef(null);

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

  // Close export dropdown on outside click
  useEffect(() => {
    if (!exportOpen) return;
    const onDocClick = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [exportOpen]);

  const regenerate = async () => {
    setRegenLoading(true);
    try {
      const { data } = await api.post(`/projects/${id}/generate`);
      setProject(data);
    } finally {
      setRegenLoading(false);
    }
  };

  const handleExport = (variant) => {
    if (!project) return;
    setExportOpen(false);
    const text = buildExport(variant, project);
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(project.title || "buildpilot-plan").replace(/[^a-z0-9-_]+/gi, "-")}-${variant}.md`;
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

  const updateStage = async (stage) => {
    if (!project || stage === project.stage) return;
    setStageSaving(true);
    try {
      const { data } = await api.put(`/projects/${id}/stage`, { stage });
      setProject(data);
    } finally {
      setStageSaving(false);
    }
  };

  const toggleChecklistItem = async (itemId) => {
    if (!project) return;
    const next = (project.checklist || []).map((it) =>
      it.id === itemId ? { ...it, done: !it.done } : it
    );
    setProject({ ...project, checklist: next }); // optimistic
    try {
      const { data } = await api.put(`/projects/${id}/checklist`, { items: next });
      setProject(data);
    } catch {
      // rollback on failure
      setProject({ ...project, checklist: project.checklist });
    }
  };

  const runAiMode = async (modeKey) => {
    setAiLoading((s) => ({ ...s, [modeKey]: true }));
    try {
      const { data } = await api.post(`/ai/${modeKey}`, { project_id: id });
      setAiResults((s) => ({ ...s, [modeKey]: data }));
    } catch (e) {
      setAiResults((s) => ({
        ...s,
        [modeKey]: { error: e?.response?.data?.detail || "Could not run this mode." },
      }));
    } finally {
      setAiLoading((s) => ({ ...s, [modeKey]: false }));
    }
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
  const checklist = project.checklist || [];
  const checklistDone = checklist.filter((c) => c.done).length;
  const checklistPct = checklist.length ? Math.round((checklistDone / checklist.length) * 100) : 0;

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

            {/* Export: button + dropdown */}
            <div ref={exportRef} className="relative">
              <button
                data-testid="detail-export-button"
                onClick={() => {
                  // Backwards-compatible: clicking the export button
                  // toggles the dropdown of variants. If no plan exists,
                  // still exports the basic project (so prior behavior
                  // of "always downloads" is preserved when there is
                  // no menu to show).
                  if (!plan) {
                    handleExport("markdown");
                    return;
                  }
                  setExportOpen((v) => !v);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:border-white/30"
              >
                <Download className="h-3.5 w-3.5" />
                Export Plan
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>
              {exportOpen && (
                <div
                  data-testid="export-dropdown"
                  className="absolute right-0 z-30 mt-1 w-60 overflow-hidden rounded-md border border-white/10 bg-zinc-950 shadow-xl"
                >
                  {EXPORT_VARIANTS.map((v) => (
                    <button
                      key={v.key}
                      data-testid={`export-${v.key}`}
                      onClick={() => handleExport(v.key)}
                      className="block w-full px-3 py-2 text-left text-xs text-zinc-200 hover:bg-white/5"
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
            {/* Stage selector */}
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-indigo-200">
              Stage
              <select
                data-testid="stage-selector"
                value={project.stage || "Idea"}
                disabled={stageSaving}
                onChange={(e) => updateStage(e.target.value)}
                className="bg-transparent text-indigo-100 outline-none disabled:opacity-60"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s} className="bg-zinc-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
              {stageSaving && <Loader2 className="h-3 w-3 animate-spin" />}
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

        {/* Validation Checklist Panel */}
        <section
          data-testid="checklist-panel"
          className="mt-8 rounded-lg border border-white/10 bg-zinc-950 p-6"
        >
          <header className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600/15 ring-1 ring-indigo-500/30">
                <ListChecks className="h-3.5 w-3.5 text-indigo-300" />
              </span>
              <h3 className="font-heading text-base font-semibold tracking-tight">
                Validation Checklist
              </h3>
            </div>
            <span
              data-testid="checklist-progress"
              className="font-mono text-xs text-zinc-400"
            >
              {checklistDone}/{checklist.length} · {checklistPct}%
            </span>
          </header>
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${checklistPct}%` }}
            />
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {checklist.map((it) => (
              <li key={it.id}>
                <button
                  data-testid={`checklist-item-${it.id}`}
                  onClick={() => toggleChecklistItem(it.id)}
                  className={`group flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    it.done
                      ? "border-emerald-400/30 bg-emerald-500/5 text-emerald-100"
                      : "border-white/10 bg-zinc-900/40 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  {it.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-zinc-500 group-hover:text-zinc-300" />
                  )}
                  <span className={it.done ? "line-through opacity-80" : ""}>{it.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* AI mode bar */}
        <section
          data-testid="ai-modes-bar"
          className="mt-8 rounded-lg border border-indigo-500/20 bg-zinc-950 p-6"
        >
          <header className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600/15 ring-1 ring-indigo-500/30">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            </span>
            <h3 className="font-heading text-base font-semibold tracking-tight">
              AI planning modes
            </h3>
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              optional · mock outputs for now
            </span>
          </header>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {AI_MODES.map(({ key, label, icon: Icon }) => {
              const loading = !!aiLoading[key];
              const done = !!aiResults[key];
              return (
                <button
                  key={key}
                  data-testid={`ai-mode-${key}`}
                  onClick={() => runAiMode(key)}
                  disabled={loading}
                  className={`group flex flex-col items-start gap-2 rounded-md border px-3 py-3 text-left text-xs transition-all disabled:opacity-70 ${
                    done
                      ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-100"
                      : "border-white/10 bg-zinc-900/40 text-zinc-200 hover:border-indigo-400/40 hover:bg-indigo-500/5"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
                    <span className="font-medium">{label}</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {done ? "Refresh" : "Run"}
                  </span>
                </button>
              );
            })}
          </div>
          {/* AI panels */}
          <div className="mt-4 space-y-3">
            {AI_MODES.map(({ key, label, icon: Icon }) =>
              aiResults[key] ? (
                <AIResultPanel
                  key={key}
                  modeKey={key}
                  label={label}
                  icon={Icon}
                  result={aiResults[key]}
                  onClose={() => setAiResults((s) => ({ ...s, [key]: undefined }))}
                />
              ) : null
            )}
          </div>
        </section>

        {!plan ? (
          <NoPlan onGenerate={regenerate} loading={regenLoading} />
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-12">
            <Score score={plan.score} className="md:col-span-12" />
            <ExtendedScore score={plan.score} className="md:col-span-12" />
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

function AIResultPanel({ modeKey, label, icon: Icon, result, onClose }) {
  return (
    <div
      data-testid={`ai-mode-${modeKey}-panel`}
      className="rounded-md border border-indigo-500/20 bg-indigo-500/5 p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-indigo-300" />
          <div className="font-heading text-sm font-semibold tracking-tight">{label}</div>
          {result.headline && (
            <span className="text-xs text-indigo-200/80">— {result.headline}</span>
          )}
        </div>
        <button
          data-testid={`ai-mode-${modeKey}-close`}
          onClick={onClose}
          className="rounded-md p-1 text-zinc-400 hover:bg-white/5 hover:text-white"
          aria-label="Close panel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {result.error ? (
        <p className="text-sm text-red-300">{String(result.error)}</p>
      ) : (
        <RenderModeBody mode={modeKey} result={result} />
      )}
    </div>
  );
}

function RenderModeBody({ mode, result }) {
  if (mode === "refine-idea") {
    return (
      <div className="space-y-3 text-sm text-zinc-200">
        <p>{result.summary}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Bullets title="Improvements" items={result.improvements} accent="indigo" />
          <Bullets title="Ask yourself" items={result.ask_yourself} accent="zinc" />
        </div>
        {typeof result.confidence === "number" && (
          <div className="font-mono text-xs text-zinc-400">Confidence: {result.confidence}%</div>
        )}
      </div>
    );
  }
  if (mode === "build-mvp") {
    return (
      <div className="grid gap-3 text-sm text-zinc-200 md:grid-cols-3">
        <Bullets title="Must have" items={result.must_have} accent="indigo" />
        <Bullets title="Explicitly cut" items={result.explicitly_cut} accent="red" />
        <Bullets title="Definition of done" items={result.definition_of_done} accent="emerald" />
        {typeof result.estimated_build_hours === "number" && (
          <div className="md:col-span-3 font-mono text-xs text-zinc-400">
            Estimated build hours: ~{result.estimated_build_hours}h
          </div>
        )}
      </div>
    );
  }
  if (mode === "tech-stack") {
    return (
      <div className="space-y-3 text-sm text-zinc-200">
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(result.recommended || {}).map(([k, v]) => (
            <div key={k} className="rounded-md border border-white/10 bg-zinc-900/50 p-2.5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-indigo-300">
                {k}
              </div>
              <div className="mt-1 text-sm text-zinc-200">{v}</div>
            </div>
          ))}
        </div>
        <Bullets title="Tradeoffs" items={result.tradeoffs} accent="zinc" />
      </div>
    );
  }
  if (mode === "check-risks") {
    return (
      <div className="space-y-2 text-sm text-zinc-200">
        {(result.risks || []).map((r, i) => (
          <div key={i} className="rounded-md border border-white/10 bg-zinc-900/40 p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-white">{r.title}</div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${
                  r.severity === "High"
                    ? "border-red-400/40 text-red-200 bg-red-500/10"
                    : r.severity === "Medium"
                    ? "border-amber-400/40 text-amber-200 bg-amber-500/10"
                    : "border-zinc-500/40 text-zinc-300 bg-zinc-500/5"
                }`}
              >
                {r.severity}
              </span>
            </div>
            <p className="mt-1.5 text-zinc-300">{r.detail}</p>
          </div>
        ))}
      </div>
    );
  }
  if (mode === "launch-plan") {
    return (
      <div className="grid gap-3 text-sm text-zinc-200 md:grid-cols-3">
        <Bullets title="Pre-launch" items={result.pre_launch} accent="indigo" />
        <Bullets title="Launch day" items={result.launch_day} accent="emerald" />
        <Bullets title="Post-launch" items={result.post_launch} accent="zinc" />
        {result.channels_ranked && (
          <div className="md:col-span-3 font-mono text-xs text-zinc-400">
            Channels ranked: {result.channels_ranked.join(" → ")}
          </div>
        )}
      </div>
    );
  }
  if (mode === "generate-pitch") {
    return (
      <div className="space-y-3 text-sm text-zinc-200">
        <PitchBlock label="One-liner" text={result.one_liner} />
        <PitchBlock label="Tweet" text={result.tweet} />
        <PitchBlock label="Elevator pitch" text={result.elevator} />
        <Bullets title="60-second demo script" items={result.demo_script} accent="indigo" />
      </div>
    );
  }
  return <pre className="text-xs text-zinc-400">{JSON.stringify(result, null, 2)}</pre>;
}

function PitchBlock({ label, text }) {
  return (
    <div className="rounded-md border border-white/10 bg-zinc-900/40 p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-indigo-300">{label}</div>
      <p className="mt-1 text-sm text-zinc-200">{text}</p>
    </div>
  );
}

function Bullets({ title, items, accent = "indigo" }) {
  const dotColor =
    accent === "red"
      ? "bg-red-400"
      : accent === "emerald"
      ? "bg-emerald-400"
      : accent === "zinc"
      ? "bg-zinc-400"
      : "bg-indigo-400";
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
        {title}
      </div>
      <ul className="space-y-1.5 text-sm text-zinc-300">
        {(items || []).map((t, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${dotColor}`} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
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

function ExtendedScore({ score, className = "" }) {
  if (!score) return null;
  const extras = [
    { key: "technical_complexity", label: "Technical complexity", val: score.technical_complexity, hint: "Lower is simpler" },
    { key: "speed_to_mvp", label: "Speed to MVP", val: score.speed_to_mvp, hint: "Higher ships faster" },
    { key: "monetisation_potential", label: "Monetisation potential", val: score.monetisation_potential, hint: "Higher = easier to charge" },
  ];
  if (extras.every((e) => e.val == null)) return null;
  return (
    <section
      data-testid="extended-score-card"
      className={`rounded-lg border border-white/10 bg-zinc-950 p-6 ${className}`}
    >
      <header className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600/15 ring-1 ring-indigo-500/30">
          <Gauge className="h-3.5 w-3.5 text-indigo-300" />
        </span>
        <h3 className="font-heading text-base font-semibold tracking-tight">
          Build score · extended
        </h3>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {extras.map((e) => (
          <div
            key={e.key}
            data-testid={`extended-score-${e.key}`}
            className="rounded-md border border-white/10 bg-zinc-900/40 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-300">
                {e.label}
              </span>
              <span className="font-heading text-base font-bold">{e.val ?? "—"}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${Math.max(0, Math.min(100, e.val ?? 0))}%` }}
              />
            </div>
            <div className="mt-2 text-[10px] text-zinc-500">{e.hint}</div>
          </div>
        ))}
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

// ---------- Export builders ----------
function buildExport(variant, project) {
  if (variant === "markdown") return buildMarkdown(project);
  if (variant === "founder-brief") return buildFounderBrief(project);
  if (variant === "tech-plan") return buildTechPlan(project);
  if (variant === "launch-checklist") return buildLaunchChecklist(project);
  if (variant === "pitch-summary") return buildPitchSummary(project);
  return buildMarkdown(project);
}

function buildMarkdown(project) {
  const p = project.generated_plan;
  const lines = [];
  lines.push(`# ${project.title}`);
  lines.push("");
  if (p?.pitch) lines.push(`> ${p.pitch}`);
  lines.push("");
  lines.push(`- **Goal**: ${project.goal_type}`);
  lines.push(`- **Stage**: ${project.stage || "Idea"}`);
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
  const s = p.score || {};
  lines.push(
    `## Idea score\n- Feasibility: ${s.feasibility}%\n- Originality: ${s.originality}%\n- Market potential: ${s.market_potential}%\n- Technical complexity: ${s.technical_complexity ?? "—"}%\n- Speed to MVP: ${s.speed_to_mvp ?? "—"}%\n- Monetisation potential: ${s.monetisation_potential ?? "—"}%\n- Difficulty: ${s.difficulty}\n`
  );
  return lines.join("\n");
}

function buildFounderBrief(project) {
  const p = project.generated_plan || {};
  const s = p.score || {};
  return [
    `# ${project.title} — Founder One-Pager`,
    "",
    `**Pitch**: ${p.pitch || project.idea}`,
    "",
    `**Stage**: ${project.stage || "Idea"} · **Goal**: ${project.goal_type} · **Timeframe**: ${project.timeframe}`,
    "",
    `## Problem`,
    p.problem_statement || project.problem || "(not yet defined)",
    "",
    `## Target user`,
    p.target_users || project.target_user || "(not yet defined)",
    "",
    `## MVP in one paragraph`,
    (p.mvp_features || []).slice(0, 3).join(" · "),
    "",
    `## Why now / why us`,
    `Feasibility ${s.feasibility ?? "—"}% · Originality ${s.originality ?? "—"}% · Market ${s.market_potential ?? "—"}% · Monetisation ${s.monetisation_potential ?? "—"}%`,
    "",
    `## Next 3 actions`,
    ...((p.next_actions || []).map((t, i) => `${i + 1}. ${t}`)),
  ].join("\n");
}

function buildTechPlan(project) {
  const p = project.generated_plan || {};
  const lines = [`# ${project.title} — Technical Build Plan`, ""];
  lines.push(`## Stack`);
  Object.entries(p.tech_stack || {}).forEach(([k, v]) => lines.push(`- **${k}**: ${v}`));
  lines.push("");
  lines.push(`## MVP feature list (implementation order)`);
  (p.mvp_features || []).forEach((f, i) => lines.push(`${i + 1}. ${f}`));
  lines.push("");
  lines.push(`## 4-week build roadmap`);
  (p.roadmap || []).forEach((wk) => {
    lines.push(`\n### Week ${wk.week} — ${wk.title}`);
    (wk.tasks || []).forEach((t) => lines.push(`- [ ] ${t}`));
  });
  lines.push("");
  lines.push(`## Engineering risks`);
  (p.risks || []).forEach((r) => lines.push(`- ${r}`));
  return lines.join("\n");
}

function buildLaunchChecklist(project) {
  const checklist = project.checklist || [];
  const lines = [`# ${project.title} — Launch Checklist`, ""];
  lines.push(`Stage: ${project.stage || "Idea"}`);
  lines.push("");
  lines.push(`## Validation checklist`);
  checklist.forEach((it) => lines.push(`- [${it.done ? "x" : " "}] ${it.label}`));
  lines.push("");
  const p = project.generated_plan;
  if (p) {
    lines.push(`## Pre-launch (from plan)`);
    (p.next_actions || []).forEach((t, i) => lines.push(`- [ ] ${t}`));
    lines.push("");
    lines.push(`## Launch week`);
    [
      "Post on Show HN / niche communities at 8am ET",
      "Record 60s demo video and pin it everywhere",
      "Reach out to 10 friendly testers for honest feedback",
      "Send thank-you email to everyone who signed up",
    ].forEach((t) => lines.push(`- [ ] ${t}`));
  }
  return lines.join("\n");
}

function buildPitchSummary(project) {
  const p = project.generated_plan || {};
  const target = p.target_users || project.target_user || "your users";
  const problem = project.problem || "the core problem";
  return [
    `# ${project.title} — Pitch Summary`,
    "",
    `## One-liner`,
    `${project.title} is the fastest way for ${String(target).toLowerCase()} to solve ${String(problem).toLowerCase()}.`,
    "",
    `## Tweet (≤280 chars)`,
    `I'm building ${project.title}. It's a focused tool for ${String(target).toLowerCase()} who keep hitting the wall on ${String(problem).toLowerCase()}. Free to try — link below.`,
    "",
    `## Elevator pitch`,
    p.pitch ||
      `${target} lose hours every week to ${String(problem).toLowerCase()}. Existing tools are too generic or too heavy. ${project.title} is the smallest tool that solves just that, in under a minute.`,
    "",
    `## Demo script (60s)`,
    "1. Open with the painful current workflow (10s)",
    `2. Show the ${project.title} alternative end-to-end (40s)`,
    "3. Close with the CTA and your contact (10s)",
  ].join("\n");
}
