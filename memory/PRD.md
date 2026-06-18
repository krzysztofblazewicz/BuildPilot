# BuildPilot — PRD

## Original problem statement
Build a modern SaaS-style web app called BuildPilot — an AI-powered project planning workspace
that helps students, beginner founders, and solo developers turn rough ideas into realistic
project plans, MVPs, tech stacks, timelines, risks, and pitch-ready concepts. First version
uses **mock AI output** (no real LLM API).

## Architecture
- **Frontend**: React (CRA, react-router v7), Tailwind, shadcn/ui primitives, lucide-react,
  sonner. Auth context with Bearer token in `localStorage` (`bp_token`).
- **Backend**: FastAPI + Motor (Mongo), bcrypt + PyJWT, all routes under `/api`.
- **AI service layer** (`/app/backend/ai_service.py`): `MockAIProvider` (default) +
  `ClaudeAIProvider` / `OpenAIProvider` placeholders. Selected via `AI_PROVIDER` env var.
- **DB**: MongoDB; collections `users` and `projects` (uuid string ids).

## User personas
- CS / design students validating class or capstone ideas.
- Beginner founders trying to scope their first MVP.
- Solo developers / indie hackers exploring side-project ideas.

## What's been implemented

### MVP (2026-02)
- Landing page, signup/login/logout, protected routes, JWT auth (admin seeded).
- Project CRUD + mock plan generator (refined name, pitch, problem, MVP, nice-to-haves,
  tech stack, 4-week roadmap, risks, ethics, next 3 actions, idea score + difficulty).
- Dashboard with cards + empty state, Create Project form with simulated multi-step loader,
  Project Detail with idea score (ring metrics + difficulty badge), Markdown export, inline
  edit, regenerate, settings page.
- Backend testing: 9/9 pytest. Frontend testing: all key flows pass.

### Expansion Phases 1–7 (2026-02)
- **P1 — Stages**: `stage` field with 7 values (Idea → Launched). Default `Idea`. Backfilled
  for legacy projects. Editable on Project Detail via `stage-selector`. Chip rendered on
  dashboard cards.
- **P2 — Validation checklist**: 10 default items per project. Per-item tick with optimistic
  UI + PUT persistence. Progress bar on Project Detail.
- **P3 — Optional AI mode panels**: 6 new endpoints `/api/ai/{refine-idea, build-mvp,
  tech-stack, check-risks, launch-plan, generate-pitch}`. Each returns deterministic
  structured JSON. Frontend renders an `ai-modes-bar` with 6 buttons; each result renders
  a dedicated panel (`ai-mode-{key}-panel`). Existing `/generate` flow untouched.
- **P4 — Extended build score**: added `technical_complexity`, `speed_to_mvp`,
  `monetisation_potential` to the existing `score` dict (additive, original keys preserved).
  Rendered as `extended-score-card` with progress bars. Original `idea-score-card` retained.
- **P5 — Export variants**: dropdown on `detail-export-button` with 5 variants
  (Full Markdown, Founder One-Pager, Technical Build Plan, Launch Checklist, Pitch Summary).
  Original Markdown export preserved.
- **P6 — AI provider layer**: `AI_PROVIDER=mock` env var, `MockAIProvider` deterministic by
  hash. `ClaudeAIProvider` / `OpenAIProvider` are placeholder classes raising
  `NotImplementedError` with inline integration notes; no API key required to run.
- **P7 — Dashboard analytics**: `/api/dashboard/stats` returns totals, by-stage counts,
  per-metric score averages, overall avg build score, ready-to-build count, and recent
  projects. Dashboard renders a 4-tile stat row and a stage-breakdown chip row.

### Test status
- Backend: **25/25 pytest passing** (regression + new endpoints).
- Frontend: all 7 phase flows verified by testing agent end-to-end. No regressions.

## Prioritized backlog
- **P1**: Wire `ClaudeAIProvider` to a real Anthropic Sonnet 4.5 call (via
  `emergentintegrations.LlmChat`) behind the existing `AI_PROVIDER` env var.
- **P1**: Make `Refine Idea` mode write its `summary` back into the project's idea field
  (apply the refinement, not just preview it).
- **P2**: Public read-only share link per generated plan (small route + copy-link button).
- **P2**: PDF export (using puppeteer or react-pdf) alongside Markdown variants.
- **P2**: Project templates (Startup / Hackathon / Capstone presets) on Create Project.
- **P3**: Toast notifications on save / regenerate / delete / stage change.
- **P3**: Multi-step form UX for Create Project (currently long scroll).
- **P3**: Split `ProjectDetail.jsx` (~1100 lines) into smaller modules — extract export
  builders to `lib/exporters.js` and AI panels to their own components.
