import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  ArrowUpRight,
  CheckCircle2,
  Compass,
  Layers,
  ShieldAlert,
  Sparkles,
  Rocket,
  Map,
  Wrench,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Idea Validation",
    body: "Pressure-test your rough idea against feasibility, originality, and real market signal before you write a line of code.",
    span: "md:col-span-7",
  },
  {
    icon: Layers,
    title: "MVP Planning",
    body: "Cut scope to what actually matters. Get a sharp MVP list plus the nice-to-haves to revisit later.",
    span: "md:col-span-5",
  },
  {
    icon: Wrench,
    title: "Tech Stack Suggestions",
    body: "Opinionated stack picks tuned to your skill level and timeframe — no analysis paralysis.",
    span: "md:col-span-5",
  },
  {
    icon: ShieldAlert,
    title: "Risk Detection",
    body: "Spot the traps — scope creep, distribution, data modeling — before they wreck your timeline.",
    span: "md:col-span-7",
  },
  {
    icon: Map,
    title: "4-Week Roadmap",
    body: "A week-by-week plan with concrete tasks so you always know what to ship next.",
    span: "md:col-span-7",
  },
  {
    icon: Rocket,
    title: "Pitch Generation",
    body: "Walk away with a one-line pitch and a launch-day script ready for the demo or class.",
    span: "md:col-span-5",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar variant="marketing" />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-grid opacity-60"
          style={{
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-24 text-center sm:pt-28 sm:pb-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-mono uppercase tracking-[0.2em] text-indigo-300 fade-up">
            <Sparkles className="h-3.5 w-3.5" />
            AI co-pilot for builders
          </div>
          <h1
            data-testid="hero-title"
            className="font-heading text-4xl font-black leading-[0.95] tracking-tighter sm:text-6xl lg:text-7xl fade-up"
            style={{ animationDelay: "60ms" }}
          >
            Turn rough ideas into
            <br />
            <span className="text-indigo-400">buildable</span> projects.
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg fade-up"
            style={{ animationDelay: "120ms" }}
          >
            BuildPilot helps students, creators, and beginner founders refine
            ideas, plan MVPs, choose tech stacks, and avoid wasted time.
          </p>
          <div
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row fade-up"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              to="/signup"
              data-testid="hero-cta-start"
              className="group inline-flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_36px_-4px_rgba(99,102,241,0.8)]"
            >
              Start Building
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <a
              href="#demo"
              data-testid="hero-cta-demo"
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-6 py-3 text-sm text-white transition-colors hover:border-white/30"
            >
              View Demo
            </a>
          </div>
          <div className="mt-10 flex items-center justify-center gap-6 text-xs text-zinc-500 font-mono uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 60-second setup
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Free to try
            </span>
          </div>
        </div>
      </section>

      {/* DEMO PREVIEW */}
      <section id="demo" className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="relative rounded-xl border border-white/10 bg-zinc-950 p-2 shadow-[0_40px_120px_-30px_rgba(99,102,241,0.4)]">
          <div className="rounded-lg border border-white/10 bg-[#0c0c10] p-6">
            <div className="mb-6 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="ml-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
                buildpilot / dashboard
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { title: "StudyLoop AI", goal: "University", status: "Generated", feas: 82 },
                { title: "FoundryKit", goal: "Startup", status: "Refined", feas: 74 },
                { title: "GreenMile", goal: "Portfolio", status: "Draft", feas: 61 },
              ].map((p) => (
                <div
                  key={p.title}
                  className="rounded-md border border-white/10 bg-zinc-900/60 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="font-heading text-base font-semibold">{p.title}</div>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-zinc-300">
                      {p.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-mono uppercase tracking-widest text-indigo-300">
                    {p.goal}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Feasibility</span>
                    <span className="font-mono text-sm text-white">{p.feas}%</span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${p.feas}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES — BENTO */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-indigo-300">
            What you get
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to go from <span className="text-indigo-400">"what if"</span> to "let's build".
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {features.map(({ icon: Icon, title, body, span }, i) => (
            <div
              key={title}
              className={`group relative overflow-hidden rounded-lg border border-white/10 bg-zinc-950 p-6 transition-all hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-black/50 ${span}`}
              data-testid={`feature-card-${i}`}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-indigo-600/10 ring-1 ring-indigo-500/20">
                <Icon className="h-5 w-5 text-indigo-300" />
              </div>
              <h3 className="font-heading text-xl font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-indigo-300">
            How it works
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps. Then you build.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { n: "01", t: "Describe your idea", b: "A few sentences, target user, problem you want to solve." },
            { n: "02", t: "Generate the plan", b: "MVP scope, tech stack, 4-week roadmap, risks, idea score." },
            { n: "03", t: "Save & iterate", b: "Refine it, export it, and ship what actually matters." },
          ].map((s) => (
            <div key={s.n} className="rounded-lg border border-white/10 bg-zinc-950 p-6">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                Step {s.n}
              </div>
              <div className="mt-3 font-heading text-xl font-semibold">{s.t}</div>
              <p className="mt-2 text-sm text-zinc-400">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-zinc-950 to-black p-10 sm:p-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Pick the idea. We'll handle the plan.
              </h2>
              <p className="mt-3 text-zinc-400">
                Stop staring at the blank page. Generate your first project plan in under 90 seconds.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <Link
                to="/signup"
                data-testid="footer-cta-start"
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_36px_-4px_rgba(99,102,241,0.8)]"
              >
                Create your free account
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                No credit card required
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Compass className="h-3.5 w-3.5" />
            BuildPilot — built with intention.
          </div>
          <div className="font-mono uppercase tracking-widest">© {new Date().getFullYear()}</div>
        </div>
      </footer>
    </div>
  );
}
