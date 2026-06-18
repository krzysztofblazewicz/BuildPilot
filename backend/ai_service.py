"""AI service layer for BuildPilot.

This module isolates AI-mode generation behind a provider interface so we can swap
the deterministic mock for a real LLM later without touching routes or UI.

Configure via env var: AI_PROVIDER=mock | claude | openai
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Dict


# ---------- Helpers ----------
def _seed(text: str) -> int:
    h = 0
    for ch in (text or ""):
        h = (h * 31 + ord(ch)) & 0xFFFFFFFF
    return h or 7


def _pick(seq, seed: int):
    return seq[seed % len(seq)]


# ---------- Mock provider ----------
class MockAIProvider:
    """Deterministic mock provider.

    Output is generated from a hash of the project so the same input yields
    the same output - useful for tests and free-tier demos.
    """

    name = "mock"

    # ----- Mode: refine-idea -----
    def refine_idea(self, project: Dict[str, Any]) -> Dict[str, Any]:
        s = _seed(project.get("idea", "") + project.get("target_user", ""))
        idea = (project.get("idea") or "your idea").strip()
        target = (project.get("target_user") or "early adopters").strip()
        problem = (project.get("problem") or "an unmet need").strip()
        sharpened = (
            f"{target} can't easily {problem.lower().replace('losing', 'avoid losing')}. "
            f"{idea.split('.')[0].strip()} fixes that with a focused, single-purpose tool."
        )
        return {
            "mode": "refine_idea",
            "headline": "Sharper one-paragraph version of your idea",
            "summary": sharpened,
            "before": idea,
            "after": sharpened,
            "improvements": [
                f"Tightened audience to '{target}' (instead of 'everyone')",
                "Removed jargon, kept the verbs concrete",
                "Names the moment of pain, not just the topic",
            ],
            "ask_yourself": [
                f"Would a {target.lower().rstrip('s')} pay $5/month for this on day one?",
                "Is the problem urgent, or just nice-to-have?",
                "Can the MVP be shipped in 2 weekends?",
            ],
            "confidence": 60 + (s % 35),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    # ----- Mode: build-mvp -----
    def build_mvp(self, project: Dict[str, Any]) -> Dict[str, Any]:
        s = _seed(project.get("idea", "") + "mvp")
        target = (project.get("target_user") or "users").strip()
        problem = (project.get("problem") or "the core problem").strip()
        return {
            "mode": "build_mvp",
            "headline": "Smallest possible thing worth shipping",
            "must_have": [
                f"One screen that lets {target.lower()} solve {problem.lower()}",
                "Account creation with email + password (no SSO yet)",
                "Local persistence of the user's primary entity",
                "A single 'aha moment' interaction within 60 seconds of signup",
                "Basic error / empty states",
            ],
            "explicitly_cut": [
                "Multi-user collaboration",
                "Mobile native apps",
                "Notifications and email digests",
                "Admin dashboards / analytics",
                "Themes, customization, and settings",
            ],
            "definition_of_done": [
                "5 friendly users completed the core flow end-to-end without help",
                "You can reproduce the 'aha moment' in a 60-second screen recording",
                "There is one written sentence you'd use to describe it on Show HN",
            ],
            "estimated_build_hours": 30 + (s % 50),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    # ----- Mode: tech-stack -----
    def tech_stack(self, project: Dict[str, Any]) -> Dict[str, Any]:
        s = _seed(project.get("idea", "") + "tech")
        skill = project.get("skill_level", "Beginner")
        pref = (project.get("preferred_tech") or "").strip()
        speed_first = skill == "Beginner"
        recommendations = {
            "frontend": "Next.js + Tailwind + shadcn/ui" if not speed_first else "React (Vite) + Tailwind + shadcn/ui",
            "backend": "FastAPI (Python)" if "python" in pref.lower() or speed_first else "Node.js (Express) or FastAPI",
            "database": "MongoDB Atlas (free tier)" if speed_first else "Postgres (Supabase) for relational data",
            "auth": "Email + password JWT to start, social login later",
            "hosting": "Vercel (frontend) + Fly.io / Render (backend)",
            "ai": "Claude Sonnet 4.5 or GPT-5.2 via a thin server-side wrapper",
        }
        return {
            "mode": "tech_stack",
            "headline": "An opinionated, boring stack you can actually ship with",
            "recommended": recommendations,
            "tradeoffs": [
                "Boring stack = less learning, more shipping. Pick novelty only where it's a feature.",
                "Skip microservices, Docker, Kubernetes for an MVP. One process, one DB.",
                "Don't roll your own auth. Use a battle-tested library.",
            ],
            "user_preference": pref or "(none provided)",
            "score": 70 + (s % 25),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    # ----- Mode: check-risks -----
    def check_risks(self, project: Dict[str, Any]) -> Dict[str, Any]:
        s = _seed(project.get("idea", "") + "risk")
        target = (project.get("target_user") or "your audience").strip()
        risks = [
            {
                "title": "Distribution is harder than building",
                "severity": "High",
                "detail": f"Reaching {target.lower()} consistently is often 80% of the work. Plan your first 50 users before week 1.",
            },
            {
                "title": "Scope creep",
                "severity": "High",
                "detail": "Every 'just one more feature' delays your launch and dilutes your wedge. Keep a 'later' file.",
            },
            {
                "title": "Solo burnout",
                "severity": "Medium",
                "detail": "If you build solo, schedule rest days. Set a non-negotiable shipping cadence (e.g., every Friday).",
            },
            {
                "title": "Building a vitamin, not a painkiller",
                "severity": "Medium",
                "detail": "If users say 'cool' instead of 'when can I have it?', you're solving a nice-to-have. Re-interview.",
            },
            {
                "title": "Data privacy debt",
                "severity": "Low",
                "detail": "Decide upfront what user data you store. Add deletion + export before launch.",
            },
        ]
        return {
            "mode": "check_risks",
            "headline": "Where this idea is most likely to break",
            "risks": risks,
            "blind_spots": [
                "You may be overestimating how willing users are to switch from existing tools.",
                "The 'one feature' you think is special may actually be table-stakes.",
            ],
            "overall_risk_level": _pick(["Low", "Medium", "High"], s),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    # ----- Mode: launch-plan -----
    def launch_plan(self, project: Dict[str, Any]) -> Dict[str, Any]:
        s = _seed(project.get("idea", "") + "launch")
        target = (project.get("target_user") or "your audience").strip()
        return {
            "mode": "launch_plan",
            "headline": "A 14-day pre-launch and launch-week plan",
            "pre_launch": [
                "Build a one-page teaser site with a clear promise and email capture",
                f"Identify 3 communities where {target.lower()} hang out (subreddit / Discord / niche forum)",
                "Write a personal 'why I built this' post for those communities",
                "Reach out to 10 friendly testers for early access feedback",
            ],
            "launch_day": [
                "Post on Show HN, Product Hunt (if relevant), and Reddit at 8am ET",
                "DM the 10 testers asking for an honest upvote/comment",
                "Be online to answer every comment within 30 minutes",
                "Record a 60-second demo video and pin it everywhere",
            ],
            "post_launch": [
                "Send a thank-you email to everyone who signed up day-of",
                "Publish a 'what I learned' write-up within 7 days",
                "Ship one improvement from launch feedback within 72 hours",
            ],
            "channels_ranked": ["Show HN", "Niche communities", "X / Twitter", "Product Hunt", "Cold outreach"],
            "estimated_reach": 200 + (s % 800),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    # ----- Mode: generate-pitch -----
    def generate_pitch(self, project: Dict[str, Any]) -> Dict[str, Any]:
        s = _seed(project.get("idea", "") + "pitch")
        name = project.get("title") or "Your project"
        target = (project.get("target_user") or "people").strip()
        problem = (project.get("problem") or "a real problem").strip()
        return {
            "mode": "generate_pitch",
            "headline": "Three pitch variants - one-liner, tweet, and elevator",
            "one_liner": f"{name} is the fastest way for {target.lower()} to solve {problem.lower()}.",
            "tweet": (
                f"I built {name}. It's a focused tool for {target.lower()} who "
                f"keep hitting the wall on {problem.lower()}. Free to try - link below."
            ),
            "elevator": (
                f"{target} lose hours every week to {problem.lower()}. Existing tools are "
                f"either too generic or too heavy. {name} is the smallest tool that solves "
                f"just that, in under a minute. We launch in {project.get('timeframe', '1 month')}."
            ),
            "demo_script": [
                "Open with the painful current workflow (10s)",
                f"Show the {name} alternative end-to-end (40s)",
                "Land on the 'aha moment' result (10s)",
                "Close with the CTA and your contact (5s)",
            ],
            "tone_score": 70 + (s % 25),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }


# ---------- Placeholder real providers (not wired) ----------
class ClaudeAIProvider:
    """Placeholder for Anthropic Claude Sonnet 4.5 integration.

    To wire this up later:
      1. Add ANTHROPIC_API_KEY (or EMERGENT_LLM_KEY) to backend/.env
      2. Install emergentintegrations and use LlmChat(provider="anthropic", ...)
      3. Replace each method body with a prompt + JSON response parsing
      4. Keep the return shape identical to MockAIProvider so the frontend doesn't change
    """

    name = "claude"

    def _not_implemented(self, mode):
        raise NotImplementedError(
            f"Claude provider for '{mode}' not yet implemented. "
            "Set AI_PROVIDER=mock or wire Anthropic in ai_service.py."
        )

    def refine_idea(self, project): self._not_implemented("refine_idea")
    def build_mvp(self, project): self._not_implemented("build_mvp")
    def tech_stack(self, project): self._not_implemented("tech_stack")
    def check_risks(self, project): self._not_implemented("check_risks")
    def launch_plan(self, project): self._not_implemented("launch_plan")
    def generate_pitch(self, project): self._not_implemented("generate_pitch")


class OpenAIProvider:
    """Placeholder for OpenAI GPT-5.2 integration.

    Same notes as ClaudeAIProvider. Use the Emergent LLM key path via
    emergentintegrations.LlmChat(provider="openai", model="gpt-5.2").
    """

    name = "openai"

    def _not_implemented(self, mode):
        raise NotImplementedError(
            f"OpenAI provider for '{mode}' not yet implemented. "
            "Set AI_PROVIDER=mock or wire OpenAI in ai_service.py."
        )

    def refine_idea(self, project): self._not_implemented("refine_idea")
    def build_mvp(self, project): self._not_implemented("build_mvp")
    def tech_stack(self, project): self._not_implemented("tech_stack")
    def check_risks(self, project): self._not_implemented("check_risks")
    def launch_plan(self, project): self._not_implemented("launch_plan")
    def generate_pitch(self, project): self._not_implemented("generate_pitch")


# ---------- Factory ----------
_provider_singleton = None


def get_provider():
    """Return the configured AI provider. Defaults to the deterministic mock."""
    global _provider_singleton
    if _provider_singleton is None:
        name = (os.environ.get("AI_PROVIDER") or "mock").strip().lower()
        if name == "claude":
            _provider_singleton = ClaudeAIProvider()
        elif name == "openai":
            _provider_singleton = OpenAIProvider()
        else:
            _provider_singleton = MockAIProvider()
    return _provider_singleton
