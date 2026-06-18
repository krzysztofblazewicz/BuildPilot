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
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar variant="marketing" />

      {/* HERO */}
      <section className="relative overflow-hidden hero-spotlight">
        <div
          aria-hidden
          className="absolute inset-0 bg-grid opacity-50"
          style={{
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-28 text-center sm:pt-32 sm:pb-36">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 fade-up">
            <Sparkles className="h-3.5 w-3.5" />
            Project planning, sharpened
          </div>
          <h1
            data-testid="hero-title"
            className="font-heading text-4xl font-black leading-[0.95] tracking-tighter sm:text-6xl lg:text-7xl text-white fade-up"
            style={{ animationDelay: "60ms" }}
          >
            Turn rough ideas into
            <br />
            <span className="silver-text">buildable</span> projects.
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
              className="btn-primary group inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium"
            >
              Start Building
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <a
              href="#demo"
              data-testid="hero-cta-demo"
              className="btn-secondary inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm"
            >
              View Demo
            </a>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono uppercase tracking-widest text-zinc-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" /> No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" /> 60-second setup
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" /> Free to try
            </span>
          </div>
        </div>
      </section>

      {/* DEMO PREVIEW */}
      <section id="demo" className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="relative rounded-xl border border-white/10 bg-[#0a0a0a] p-2">
          <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-6">
            <div className="mb-6 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
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
                <div key={p.title} className="card-surface p-4">
                  <div className="flex items-start justify-between">
                    <div className="font-heading text-base font-semibold text-white">
                      {p.title}
                    </div>
                    <span className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-zinc-300">
                      {p.status}
                    </span>
                  </div>
                  <div className="mt-2 font-mono text-xs uppercase tracking-widest text-zinc-500">
                    {p.goal}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Feasibility</span>
                    <span className="font-mono text-sm text-zinc-100">{p.feas}%</span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-zinc-300"
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
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
            What you get
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Everything you need to go from <span className="silver-text">"what if"</span> to "let's build".
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {features.map(({ icon: Icon, title, body, span }, i) => (
            <div
              key={title}
              className={`group relative overflow-hidden card-surface p-6 ${span}`}
              data-testid={`feature-card-${i}`}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.03]">
                <Icon className="h-5 w-5 text-zinc-200" />
              </div>
              <h3 className="font-heading text-xl font-semibold tracking-tight text-white">
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
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
            How it works
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Three steps. Then you build.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { n: "01", t: "Describe your idea", b: "A few sentences, target user, problem you want to solve." },
            { n: "02", t: "Generate the plan", b: "MVP scope, tech stack, 4-week roadmap, risks, idea score." },
            { n: "03", t: "Save & iterate", b: "Refine it, export it, and ship what actually matters." },
          ].map((s) => (
            <div key={s.n} className="surface p-6">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                Step {s.n}
              </div>
              <div className="mt-3 font-heading text-xl font-semibold text-white">{s.t}</div>
              <p className="mt-2 text-sm text-zinc-400">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] p-10 sm:p-14">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 50% 50% at 90% 0%, rgba(255,255,255,0.08), transparent 70%)",
            }}
          />
          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-white">
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
                className="btn-primary inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium"
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
