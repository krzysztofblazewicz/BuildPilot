import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Plus, FolderOpen, Sparkles, Trash2, Loader2 } from "lucide-react";

const STATUS_STYLES = {
  Draft: "border-zinc-500/40 text-zinc-300 bg-zinc-500/5",
  Generated: "border-indigo-400/40 text-indigo-200 bg-indigo-500/10",
  Refined: "border-emerald-400/40 text-emerald-200 bg-emerald-500/10",
};

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
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/projects");
        if (!cancelled) setProjects(data);
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
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar variant="app" />
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-300">
              {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Dashboard"}
            </div>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Your projects
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Saved plans, ready to refine, export, or ship.
            </p>
          </div>
          <Link
            to="/projects/new"
            data-testid="dashboard-new-project-button"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.7)]"
          >
            <Plus className="h-4 w-4" />
            Create new project
          </Link>
        </div>

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
              {projects.map((p) => (
                <article
                  key={p.id}
                  data-testid={`project-card-${p.id}`}
                  className="group relative flex flex-col rounded-lg border border-white/10 bg-zinc-950 p-5 transition-all hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-black/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-300">
                        {p.goal_type}
                      </div>
                      <h3 className="mt-1.5 truncate font-heading text-lg font-semibold tracking-tight">
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
                  <p className="mt-3 line-clamp-3 text-sm text-zinc-400">
                    {p.idea || "No idea description yet."}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="font-mono text-xs text-zinc-500">
                      Updated {relative(p.updated_at)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        data-testid={`project-delete-${p.id}`}
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-red-400 disabled:opacity-50"
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
                        className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:border-white/30"
                      >
                        <FolderOpen className="h-3.5 w-3.5" />
                        Open
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div
      data-testid="dashboard-empty-state"
      className="relative overflow-hidden rounded-xl border border-dashed border-white/10 bg-zinc-950 p-12 text-center"
    >
      <div className="absolute inset-x-0 -top-20 mx-auto h-40 w-40 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="relative">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/15 ring-1 ring-indigo-500/30">
          <Sparkles className="h-5 w-5 text-indigo-300" />
        </div>
        <h3 className="mt-5 font-heading text-2xl font-semibold tracking-tight">
          No projects yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
          Sketch your first idea and let BuildPilot turn it into a focused MVP
          plan with a 4-week roadmap.
        </p>
        <button
          data-testid="empty-create-project-button"
          onClick={onCreate}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.7)]"
        >
          <Plus className="h-4 w-4" />
          Create your first project
        </button>
      </div>
    </div>
  );
}
