import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  Plus,
  FolderOpen,
  Sparkles,
  Trash2,
  Loader2,
  Layers,
  Rocket,
  Gauge,
  ListChecks,
} from "lucide-react";

const STATUS_STYLES = {
  Draft: "border-white/10 bg-white/[0.02] text-zinc-400",
  Generated: "border-white/20 bg-white/[0.04] text-zinc-200",
  Refined: "border-zinc-200 bg-zinc-200 text-black",
};

const STAGE_STYLES = {
  Idea: "border-white/10 text-zinc-400 bg-transparent",
  Validating: "border-white/25 text-zinc-200 bg-transparent",
  Planning: "border-white/15 text-zinc-200 bg-white/[0.06]",
  "Building MVP": "border-white/25 text-white bg-white/[0.12]",
  Testing: "border-white/10 text-zinc-300 bg-white/[0.03]",
  "Ready to Launch": "border-zinc-300 text-black bg-zinc-300",
  Launched: "border-white text-black bg-white",
};

function avgScore(plan) {
  if (!plan?.score) return null;
  const keys = [
    "feasibility",
    "originality",
    "market_potential",
    "technical_complexity",
    "speed_to_mvp",
    "monetisation_potential",
  ];
  const vals = keys
    .map((k) => plan.score[k])
    .filter((v) => typeof v === "number");
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function relative(date) {
  if (!date) return "—";
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState(null);
  const [stats, setStats] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ data: projectsData }, { data: statsData }] = await Promise.all([
          api.get("/projects"),
          api.get("/dashboard/stats"),
        ]);
        if (!cancelled) {
          setProjects(projectsData);
          setStats(statsData);
        }
      } catch {
        if (!cancelled) setProjects([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      const { data } = await api.get("/dashboard/stats");
      setStats(data);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar variant="app" />
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-400">
              {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Dashboard"}
            </div>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Your projects
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Saved plans, ready to refine, export, or ship.
            </p>
          </div>
          <Link
            to="/projects/new"
            data-testid="dashboard-new-project-button"
            className="btn-primary inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Create new project
          </Link>
        </div>

        {/* Analytics row */}
        {stats && stats.total_projects > 0 && (
          <div
            data-testid="dashboard-analytics"
            className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            <StatCard
              testId="stat-total-projects"
              icon={Layers}
              label="Total projects"
              value={stats.total_projects}
            />
            <StatCard
              testId="stat-ready-to-build"
              icon={Rocket}
              label="Ready to build"
              value={stats.ready_to_build}
              hint="Planning → Ready to Launch"
            />
            <StatCard
              testId="stat-avg-score"
              icon={Gauge}
              label="Avg build score"
              value={stats.avg_build_score == null ? "—" : `${stats.avg_build_score}%`}
            />
            <StatCard
              testId="stat-launched"
              icon={ListChecks}
              label="Launched"
              value={stats.by_stage?.Launched ?? 0}
            />
          </div>
        )}

        {/* Stage breakdown */}
        {stats && stats.total_projects > 0 && (
          <div
            data-testid="dashboard-stage-breakdown"
            className="mt-4 flex flex-wrap items-center gap-2 surface p-3"
          >
            <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
              By stage
            </span>
            {Object.entries(stats.by_stage).map(([stage, count]) => (
              <span
                key={stage}
                data-testid={`stage-count-${stage.toLowerCase().replace(/\s+/g, "-")}`}
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-widest ${
                  count === 0 ? "border-white/5 text-zinc-600" : STAGE_STYLES[stage] || STAGE_STYLES.Idea
                }`}
              >
                {stage} · {count}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="mt-10">
          {projects === null ? (
            <div className="flex items-center justify-center py-24 text-zinc-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading projects…
            </div>
          ) : projects.length === 0 ? (
            <EmptyState onCreate={() => navigate("/projects/new")} />
          ) : (
            <div
              data-testid="dashboard-projects-grid"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {projects.map((p) => {
                const buildScore = avgScore(p.generated_plan);
                return (
                  <article
                    key={p.id}
                    data-testid={`project-card-${p.id}`}
                    className="card-surface relative flex flex-col p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                          {p.goal_type}
                        </div>
                        <h3 className="mt-1.5 truncate font-heading text-lg font-semibold tracking-tight text-white">
                          {p.title}
                        </h3>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${
                          STATUS_STYLES[p.status] || STATUS_STYLES.Draft
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span
                        data-testid={`project-stage-${p.id}`}
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${
                          STAGE_STYLES[p.stage] || STAGE_STYLES.Idea
                        }`}
                      >
                        Stage · {p.stage || "Idea"}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm text-zinc-400">
                      {p.idea || "No idea description yet."}
                    </p>

                    {buildScore != null && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                            Build score
                          </span>
                          <span className="font-mono text-sm text-zinc-100">{buildScore}%</span>
                        </div>
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-zinc-200"
                            style={{ width: `${buildScore}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                      <span className="font-mono text-xs text-zinc-500">
                        Updated {relative(p.updated_at)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          data-testid={`project-delete-${p.id}`}
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200 disabled:opacity-50"
                          aria-label="Delete project"
                        >
                          {deletingId === p.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                        <Link
                          to={`/projects/${p.id}`}
                          data-testid={`project-open-${p.id}`}
                          className="btn-secondary inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs"
                        >
                          <FolderOpen className="h-3.5 w-3.5" />
                          Open
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, testId }) {
  return (
    <div data-testid={testId} className="surface p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
          {label}
        </span>
        <Icon className="h-4 w-4 text-zinc-500" />
      </div>
      <div className="mt-2 font-heading text-2xl font-bold tracking-tight text-white">
        {value}
      </div>
      {hint && <div className="mt-1 text-[10px] text-zinc-500">{hint}</div>}
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div
      data-testid="dashboard-empty-state"
      className="relative overflow-hidden rounded-xl border border-dashed border-white/10 bg-[#0a0a0a] p-12 text-center"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 -top-24 mx-auto h-48 w-48"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)",
        }}
      />
      <div className="relative">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.03]">
          <Sparkles className="h-5 w-5 text-zinc-200" />
        </div>
        <h3 className="mt-5 font-heading text-2xl font-semibold tracking-tight text-white">
          No projects yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
          Sketch your first idea and let BuildPilot turn it into a focused MVP
          plan with a 4-week roadmap.
        </p>
        <button
          data-testid="empty-create-project-button"
          onClick={onCreate}
          className="btn-primary mt-6 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Create your first project
        </button>
      </div>
    </div>
  );
}
