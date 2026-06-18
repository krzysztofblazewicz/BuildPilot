# BuildPilot — PRD

## Original problem statement
Build a modern SaaS-style web app called BuildPilot — an AI-powered project planning workspace
that helps students, beginner founders, and solo developers turn rough ideas into realistic
project plans, MVPs, tech stacks, timelines, risks, and pitch-ready concepts. First version
uses **mock AI output** (no real LLM API).

## Architecture
- **Frontend**: React (CRA, react-router v7), Tailwind, shadcn/ui primitives, lucide-react icons,
  sonner toaster. Auth context with Bearer token in `localStorage` (`bp_token`).
- **Backend**: FastAPI (Python), Motor (Mongo), bcrypt + PyJWT, all routes under `/api`.
- **DB**: MongoDB, collections `users` and `projects` (uuid string ids).
- **Mock plan**: deterministic-by-hash generator in `server.py::generate_mock_plan`.

## User personas
- CS / design students validating class or capstone ideas.
- Beginner founders trying to scope their first MVP.
- Solo developers exploring side-project ideas.

## Core requirements (static)
- Landing page with hero, CTAs, bento feature grid, how-it-works, final CTA.
- Auth: JWT email/password, signup + login, protected routes.
- Dashboard with project cards (title, goal type, status, last updated, open, delete) + empty state.
- Create Project form with 10 fields, "Generate Build Plan" CTA, simulated loading.
- Project Detail showing all generated sections (pitch, problem, MVP, nice-to-haves, tech
  stack, 4-week roadmap, risks, ethics, next 3 actions, idea score w/ %s and difficulty).
- Edit, Export (Markdown), Regenerate, Back-to-dashboard buttons.
- Settings/profile with sign-out.
- Responsive dark-mode design, Outfit/Manrope/JetBrains Mono.

## What's been implemented (2026-02)
- ✅ Full landing page (hero, dashboard mock, bento features, how-it-works, footer CTA).
- ✅ Signup / login / logout, protected routing, auth context with bearer token.
- ✅ Admin user seeded on startup (`admin@buildpilot.app` / `admin123`).
- ✅ Project CRUD (`/api/projects`) + mock plan generator (`/api/projects/:id/generate`).
- ✅ Dashboard with empty state, project cards, delete, last-updated relative time.
- ✅ Create Project form with simulated multi-step loader (~2.5s).
- ✅ Project Detail bento layout, idea score with circular ring metrics, difficulty badge.
- ✅ Markdown export, inline edit, regenerate.
- ✅ Settings page with profile + sign-out.
- ✅ Backend testing: 9/9 pytest. Frontend testing: all key flows pass.

## Prioritized backlog
- **P1**: Hook up a real LLM (Claude Sonnet 4.5 / GPT-5.2 via Emergent LLM key) behind a
  feature flag to replace the mock generator.
- **P1**: "Refine plan" follow-up prompts (ask BuildPilot to tighten MVP, add risks, etc.).
- **P2**: Public share link for a generated plan (read-only URL).
- **P2**: PDF export (in addition to Markdown).
- **P2**: Project templates (Startup / Hackathon / Capstone presets).
- **P3**: Toast notifications on save / regenerate / delete.
- **P3**: Multi-step form UX for Create Project (instead of long scroll).
