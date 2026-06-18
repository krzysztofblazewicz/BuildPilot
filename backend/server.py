from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any, Dict

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from ai_service import get_provider as get_ai_provider

# ----- MongoDB -----
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# ----- App -----
app = FastAPI(title="BuildPilot API")
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MIN = 60 * 24 * 7  # 7 days for MVP convenience

logger = logging.getLogger("buildpilot")
logging.basicConfig(level=logging.INFO)


# ----- Helpers -----
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MIN),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Dict[str, Any]:
    token: Optional[str] = None
    if creds and creds.scheme.lower() == "bearer":
        token = creds.credentials
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ----- Models -----
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=80)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    name: str
    created_at: str


class AuthOut(BaseModel):
    user: UserOut
    token: str


class ProjectIn(BaseModel):
    idea: str
    target_user: str = ""
    problem: str = ""
    goal_type: str = "Startup"
    skill_level: str = "Beginner"
    timeframe: str = "1 month"
    preferred_tech: str = ""
    team_size: str = "1"
    constraints: str = ""
    notes: str = ""


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    idea: Optional[str] = None
    target_user: Optional[str] = None
    problem: Optional[str] = None
    goal_type: Optional[str] = None
    skill_level: Optional[str] = None
    timeframe: Optional[str] = None
    preferred_tech: Optional[str] = None
    team_size: Optional[str] = None
    constraints: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    stage: Optional[str] = None
    generated_plan: Optional[Dict[str, Any]] = None


class StageUpdate(BaseModel):
    stage: str


class ChecklistItemUpdate(BaseModel):
    id: str
    done: bool


class ChecklistUpdate(BaseModel):
    items: List[Dict[str, Any]]


PROJECT_STAGES = [
    "Idea",
    "Validating",
    "Planning",
    "Building MVP",
    "Testing",
    "Ready to Launch",
    "Launched",
]


DEFAULT_CHECKLIST = [
    {"id": "define-target-user", "label": "Define target user", "done": False},
    {"id": "identify-main-problem", "label": "Identify main problem", "done": False},
    {"id": "list-competitors", "label": "List competitors or alternatives", "done": False},
    {"id": "create-landing-page", "label": "Create landing page", "done": False},
    {"id": "speak-to-5-users", "label": "Speak to 5 potential users", "done": False},
    {"id": "build-mvp", "label": "Build MVP", "done": False},
    {"id": "test-with-users", "label": "Test with users", "done": False},
    {"id": "collect-feedback", "label": "Collect feedback", "done": False},
    {"id": "improve-based-on-feedback", "label": "Improve based on feedback", "done": False},
    {"id": "prepare-launch", "label": "Prepare launch", "done": False},
]


def _with_project_defaults(project: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Backfill stage + checklist on read so existing projects keep working."""
    if not project:
        return project
    if not project.get("stage"):
        project["stage"] = "Idea"
    if not project.get("checklist"):
        project["checklist"] = [dict(item) for item in DEFAULT_CHECKLIST]
    return project


# ----- Mock Plan Generator -----
GOAL_TYPES = ["Startup", "University Project", "Portfolio Project", "Business"]
DIFFICULTIES = ["Easy", "Medium", "Hard"]


def _hash_seed(text: str) -> int:
    h = 0
    for ch in text:
        h = (h * 31 + ord(ch)) & 0xFFFFFFFF
    return h or 7


def generate_mock_plan(p: Dict[str, Any]) -> Dict[str, Any]:
    seed = _hash_seed((p.get("idea") or "") + (p.get("target_user") or ""))
    idea = (p.get("idea") or "your idea").strip()
    short = idea.split(".")[0][:60].rstrip()
    refined_name = (short.title() if short else "Untitled Project").replace("  ", " ")
    if len(refined_name.split()) < 2:
        refined_name = refined_name + " OS"

    target = (p.get("target_user") or "early adopters").strip()
    problem = (p.get("problem") or "an unmet need in this space").strip()
    tech = (p.get("preferred_tech") or "React, FastAPI, MongoDB").strip()
    skill = p.get("skill_level", "Beginner")
    timeframe = p.get("timeframe", "1 month")

    feasibility = 55 + (seed % 40)
    originality = 45 + ((seed >> 3) % 45)
    market = 50 + ((seed >> 6) % 45)
    technical_complexity = 30 + ((seed >> 12) % 60)
    speed_to_mvp = 40 + ((seed >> 15) % 55)
    monetisation_potential = 35 + ((seed >> 18) % 60)
    difficulty = DIFFICULTIES[(seed >> 9) % 3]
    if skill == "Beginner" and difficulty == "Hard":
        difficulty = "Medium"

    mvp_features = [
        f"Onboarding flow tailored for {target.lower()}",
        f"Core workflow that addresses: {problem.lower()}",
        "Persistent user accounts with saved progress",
        "Clean dashboard with primary action front-and-center",
        "Search / filter across user-generated data",
    ]
    nice_to_haves = [
        "Email digests and reminders",
        "Public share links for individual items",
        "Light/dark theme toggle and accessibility polish",
        "Mobile-first responsive layout",
        "Basic analytics for the operator (you)",
    ]
    tech_stack = {
        "frontend": "React + Tailwind + shadcn/ui",
        "backend": "FastAPI (Python) with REST endpoints",
        "database": "MongoDB (Atlas free tier)",
        "auth": "JWT email/password",
        "hosting": "Vercel (frontend) + Fly.io / Render (backend)",
        "preferred_user_stack": tech,
    }
    roadmap = [
        {
            "week": 1,
            "title": "Foundations & UX skeleton",
            "tasks": [
                "Set up repo, CI, and base stack",
                "Wireframe 3 core screens on paper",
                "Implement auth + empty dashboard",
            ],
        },
        {
            "week": 2,
            "title": "Build the primary workflow",
            "tasks": [
                f"Implement the one feature that solves: {problem.lower()}",
                "Wire up create / read / update endpoints",
                "Seed realistic demo data for testing",
            ],
        },
        {
            "week": 3,
            "title": "Polish, edge cases & feedback",
            "tasks": [
                "Add empty states, loading states, errors",
                "Ship to 5 friendly users from your target group",
                "Collect feedback in a shared doc",
            ],
        },
        {
            "week": 4,
            "title": "Launch-ready & pitch",
            "tasks": [
                "Record a 60-second demo video",
                "Write a one-paragraph landing pitch",
                "Submit to relevant communities / Show HN / class demo",
            ],
        },
    ]
    risks = [
        f"Scope creep beyond the {timeframe} window — protect the MVP boundary",
        f"Reaching {target.lower()} is harder than building the product",
        "Underestimating data-modeling work for core entities",
        "Burnout from solo building — schedule rest weeks",
    ]
    ethics = [
        "Be explicit about what user data is stored and why",
        "Avoid dark patterns in onboarding and notifications",
        "Have a clear path for users to export or delete their data",
    ]
    next_actions = [
        "Write a one-paragraph pitch you would send to a friend",
        "Sketch the 3 most important screens on paper or Figma",
        "Talk to 3 people in your target user group this week",
    ]
    pitch = f"{refined_name} helps {target.lower()} solve {problem.lower()} — in {timeframe}, with a {skill.lower()} build."

    return {
        "refined_name": refined_name,
        "pitch": pitch,
        "problem_statement": f"{target} struggle with {problem.lower()}. Existing options are scattered, generic, or overkill for the actual need.",
        "target_users": target,
        "mvp_features": mvp_features,
        "nice_to_have_features": nice_to_haves,
        "tech_stack": tech_stack,
        "roadmap": roadmap,
        "risks": risks,
        "ethics": ethics,
        "next_actions": next_actions,
        "score": {
            "feasibility": feasibility,
            "originality": originality,
            "market_potential": market,
            "difficulty": difficulty,
            "technical_complexity": technical_complexity,
            "speed_to_mvp": speed_to_mvp,
            "monetisation_potential": monetisation_potential,
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


# ----- Routes -----
@api_router.get("/")
async def root():
    return {"message": "BuildPilot API online"}


@api_router.post("/auth/register", response_model=AuthOut)
async def register(payload: RegisterIn):
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "name": payload.name.strip(),
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email)
    return AuthOut(
        user=UserOut(id=user_id, email=email, name=doc["name"], created_at=doc["created_at"]),
        token=token,
    )


@api_router.post("/auth/login", response_model=AuthOut)
async def login(payload: LoginIn):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    return AuthOut(
        user=UserOut(id=user["id"], email=user["email"], name=user["name"], created_at=user["created_at"]),
        token=token,
    )


@api_router.get("/auth/me", response_model=UserOut)
async def me(current=Depends(get_current_user)):
    return UserOut(**current)


@api_router.post("/auth/logout")
async def logout():
    return {"ok": True}


# ----- Projects -----
def _project_title(idea: str) -> str:
    base = (idea or "Untitled project").strip().split("\n")[0]
    return (base[:60] + ("..." if len(base) > 60 else "")) or "Untitled project"


@api_router.get("/projects")
async def list_projects(current=Depends(get_current_user)):
    cursor = db.projects.find({"user_id": current["id"]}, {"_id": 0}).sort("updated_at", -1)
    items = await cursor.to_list(500)
    return [_with_project_defaults(p) for p in items]


@api_router.post("/projects")
async def create_project(payload: ProjectIn, current=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    pid = str(uuid.uuid4())
    doc = {
        "id": pid,
        "user_id": current["id"],
        "title": _project_title(payload.idea),
        **payload.model_dump(),
        "generated_plan": None,
        "status": "Draft",
        "stage": "Idea",
        "checklist": [dict(item) for item in DEFAULT_CHECKLIST],
        "created_at": now,
        "updated_at": now,
    }
    await db.projects.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.post("/projects/{project_id}/generate")
async def generate_plan(project_id: str, current=Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": current["id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    plan = generate_mock_plan(project)
    now = datetime.now(timezone.utc).isoformat()
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"generated_plan": plan, "status": "Generated", "title": plan["refined_name"], "updated_at": now}},
    )
    project["generated_plan"] = plan
    project["status"] = "Generated"
    project["title"] = plan["refined_name"]
    project["updated_at"] = now
    return _with_project_defaults(project)


# ----- Phase 1: stage update -----
@api_router.put("/projects/{project_id}/stage")
async def update_project_stage(project_id: str, payload: StageUpdate, current=Depends(get_current_user)):
    if payload.stage not in PROJECT_STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Allowed: {PROJECT_STAGES}")
    res = await db.projects.update_one(
        {"id": project_id, "user_id": current["id"]},
        {"$set": {"stage": payload.stage, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return _with_project_defaults(project)


# ----- Phase 2: checklist update -----
@api_router.put("/projects/{project_id}/checklist")
async def update_project_checklist(
    project_id: str, payload: ChecklistUpdate, current=Depends(get_current_user)
):
    # Normalize: ensure each item has id, label, done
    normalized = []
    for item in payload.items:
        if "id" not in item or "label" not in item:
            raise HTTPException(status_code=400, detail="Each checklist item needs id and label")
        normalized.append(
            {"id": str(item["id"]), "label": str(item["label"]), "done": bool(item.get("done"))}
        )
    res = await db.projects.update_one(
        {"id": project_id, "user_id": current["id"]},
        {"$set": {"checklist": normalized, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return _with_project_defaults(project)


# ----- Phase 3: optional AI mode panels -----
async def _load_project_for_ai(project_id: str, user_id: str) -> Dict[str, Any]:
    project = await db.projects.find_one({"id": project_id, "user_id": user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@api_router.post("/ai/refine-idea")
async def ai_refine_idea(payload: Dict[str, Any], current=Depends(get_current_user)):
    project = await _load_project_for_ai(payload.get("project_id", ""), current["id"])
    return get_ai_provider().refine_idea(project)


@api_router.post("/ai/build-mvp")
async def ai_build_mvp(payload: Dict[str, Any], current=Depends(get_current_user)):
    project = await _load_project_for_ai(payload.get("project_id", ""), current["id"])
    return get_ai_provider().build_mvp(project)


@api_router.post("/ai/tech-stack")
async def ai_tech_stack(payload: Dict[str, Any], current=Depends(get_current_user)):
    project = await _load_project_for_ai(payload.get("project_id", ""), current["id"])
    return get_ai_provider().tech_stack(project)


@api_router.post("/ai/check-risks")
async def ai_check_risks(payload: Dict[str, Any], current=Depends(get_current_user)):
    project = await _load_project_for_ai(payload.get("project_id", ""), current["id"])
    return get_ai_provider().check_risks(project)


@api_router.post("/ai/launch-plan")
async def ai_launch_plan(payload: Dict[str, Any], current=Depends(get_current_user)):
    project = await _load_project_for_ai(payload.get("project_id", ""), current["id"])
    return get_ai_provider().launch_plan(project)


@api_router.post("/ai/generate-pitch")
async def ai_generate_pitch(payload: Dict[str, Any], current=Depends(get_current_user)):
    project = await _load_project_for_ai(payload.get("project_id", ""), current["id"])
    return get_ai_provider().generate_pitch(project)


# ----- Phase 7: dashboard analytics -----
@api_router.get("/dashboard/stats")
async def dashboard_stats(current=Depends(get_current_user)):
    cursor = db.projects.find({"user_id": current["id"]}, {"_id": 0})
    projects = await cursor.to_list(1000)
    projects = [_with_project_defaults(p) for p in projects]

    total = len(projects)
    by_stage = {stage: 0 for stage in PROJECT_STAGES}
    score_keys = [
        "feasibility",
        "originality",
        "market_potential",
        "technical_complexity",
        "speed_to_mvp",
        "monetisation_potential",
    ]
    score_sums = {k: 0 for k in score_keys}
    score_counts = {k: 0 for k in score_keys}
    overall_sum = 0
    overall_count = 0
    ready_to_build = 0
    for p in projects:
        stage = p.get("stage", "Idea")
        if stage in by_stage:
            by_stage[stage] += 1
        if p.get("generated_plan"):
            score = p["generated_plan"].get("score") or {}
            project_overall = []
            for k in score_keys:
                v = score.get(k)
                if isinstance(v, (int, float)):
                    score_sums[k] += v
                    score_counts[k] += 1
                    project_overall.append(v)
            if project_overall:
                overall_sum += sum(project_overall) / len(project_overall)
                overall_count += 1
        if stage in ("Planning", "Building MVP", "Testing", "Ready to Launch"):
            ready_to_build += 1

    averages = {k: (round(score_sums[k] / score_counts[k]) if score_counts[k] else None) for k in score_keys}
    avg_build_score = round(overall_sum / overall_count) if overall_count else None

    recent = sorted(projects, key=lambda p: p.get("updated_at", ""), reverse=True)[:5]
    recent_compact = [
        {
            "id": p["id"],
            "title": p.get("title"),
            "stage": p.get("stage", "Idea"),
            "status": p.get("status"),
            "updated_at": p.get("updated_at"),
        }
        for p in recent
    ]
    return {
        "total_projects": total,
        "by_stage": by_stage,
        "score_averages": averages,
        "avg_build_score": avg_build_score,
        "ready_to_build": ready_to_build,
        "recent": recent_compact,
    }


@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, current=Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": current["id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _with_project_defaults(project)


@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, payload: ProjectUpdate, current=Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": current["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if "stage" in update and update["stage"] not in PROJECT_STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Allowed: {PROJECT_STAGES}")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.projects.update_one({"id": project_id}, {"$set": update})
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return _with_project_defaults(updated)


@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current=Depends(get_current_user)):
    res = await db.projects.delete_one({"id": project_id, "user_id": current["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"ok": True}


# ----- Startup -----
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.projects.create_index("user_id")
    await db.projects.create_index("id", unique=True)
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@buildpilot.app").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Admin",
            "password_hash": hash_password(admin_password),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
