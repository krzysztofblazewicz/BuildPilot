"""BuildPilot backend API tests (Phases 1-7 + regression)."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://pilot-preview-19.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@buildpilot.app"
ADMIN_PASSWORD = "admin123"

STAGES = ["Idea", "Validating", "Planning", "Building MVP", "Testing", "Ready to Launch", "Launched"]
AI_MODES = ["refine-idea", "build-mvp", "tech-stack", "check-risks", "launch-plan", "generate-pitch"]


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def fresh_user(session):
    email = f"TEST_{uuid.uuid4().hex[:8]}@buildpilot.app"
    r = session.post(f"{API}/auth/register", json={"email": email, "password": "testpass123", "name": "Tester"})
    assert r.status_code == 200, r.text
    data = r.json()
    return {"email": email, "password": "testpass123", "token": data["token"], "user": data["user"]}


@pytest.fixture(scope="session")
def auth_headers(fresh_user):
    return {"Authorization": f"Bearer {fresh_user['token']}"}


# --- Regression: Health/Auth ---
def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert "BuildPilot" in r.json().get("message", "")


def test_register_duplicate(session, fresh_user):
    r = session.post(f"{API}/auth/register", json={"email": fresh_user["email"], "password": "x" * 6, "name": "Dup"})
    assert r.status_code == 400


def test_login_admin(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    assert r.json()["user"]["email"] == ADMIN_EMAIL


def test_login_invalid(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass"})
    assert r.status_code == 401


def test_me_requires_auth(session):
    r = session.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_me_with_token(session, auth_headers, fresh_user):
    r = session.get(f"{API}/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == fresh_user["email"].lower()


# --- Regression: protected ---
def test_projects_protected(session):
    for method, path in [("get", "/projects"), ("post", "/projects"), ("get", "/projects/x"),
                         ("put", "/projects/x"), ("delete", "/projects/x"), ("post", "/projects/x/generate")]:
        r = getattr(session, method)(f"{API}{path}", json={} if method in ("post", "put") else None)
        assert r.status_code == 401, f"{method} {path} -> {r.status_code}"


def test_new_endpoints_protected(session):
    """Phase 1/2/3/7 endpoints require auth."""
    paths = [
        ("put", "/projects/x/stage", {"stage": "Idea"}),
        ("put", "/projects/x/checklist", {"items": []}),
        ("get", "/dashboard/stats", None),
    ]
    for method, path, body in paths:
        r = getattr(session, method)(f"{API}{path}", json=body)
        assert r.status_code == 401, f"{method} {path} -> {r.status_code}"
    for mode in AI_MODES:
        r = session.post(f"{API}/ai/{mode}", json={"project_id": "x"})
        assert r.status_code == 401, f"/ai/{mode} -> {r.status_code}"


# --- Project CRUD + Generate regression ---
@pytest.fixture(scope="session")
def created_project(session, auth_headers):
    payload = {"idea": "An app to help students organize study sessions",
               "target_user": "college students", "problem": "procrastination",
               "goal_type": "University Project", "skill_level": "Beginner",
               "timeframe": "1 month", "preferred_tech": "React, FastAPI"}
    r = session.post(f"{API}/projects", headers=auth_headers, json=payload)
    assert r.status_code == 200, r.text
    return r.json()


def test_create_defaults_stage_and_checklist(created_project):
    """Phase 1+2: new projects default stage=Idea + 10 checklist items."""
    assert created_project["stage"] == "Idea"
    assert isinstance(created_project["checklist"], list)
    assert len(created_project["checklist"]) == 10
    for it in created_project["checklist"]:
        assert "id" in it and "label" in it and "done" in it
        assert it["done"] is False


def test_get_project_returns_defaults(session, auth_headers, created_project):
    r = session.get(f"{API}/projects/{created_project['id']}", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["stage"] == "Idea"
    assert len(data["checklist"]) == 10


def test_generate_plan_extended_score(session, auth_headers, created_project):
    """Phase 4: generated plan has both legacy + extended score keys."""
    pid = created_project["id"]
    r = session.post(f"{API}/projects/{pid}/generate", headers=auth_headers)
    assert r.status_code == 200, r.text
    g = r.json()
    plan = g["generated_plan"]
    for k in ["refined_name", "pitch", "problem_statement", "mvp_features",
              "nice_to_have_features", "tech_stack", "roadmap", "risks",
              "ethics", "next_actions", "score"]:
        assert k in plan
    assert len(plan["roadmap"]) == 4
    s = plan["score"]
    for k in ["feasibility", "originality", "market_potential", "difficulty",
              "technical_complexity", "speed_to_mvp", "monetisation_potential"]:
        assert k in s, f"missing score key {k}"
    assert g["status"] == "Generated"


# --- Phase 1: stage update ---
def test_update_stage_valid_persists(session, auth_headers, created_project):
    pid = created_project["id"]
    r = session.put(f"{API}/projects/{pid}/stage", headers=auth_headers, json={"stage": "Validating"})
    assert r.status_code == 200
    assert r.json()["stage"] == "Validating"
    # GET verify
    r = session.get(f"{API}/projects/{pid}", headers=auth_headers)
    assert r.json()["stage"] == "Validating"


def test_update_stage_invalid(session, auth_headers, created_project):
    r = session.put(f"{API}/projects/{created_project['id']}/stage",
                    headers=auth_headers, json={"stage": "Bogus"})
    assert r.status_code == 400


def test_update_stage_via_put_project(session, auth_headers, created_project):
    """PUT /projects/{id} should also accept stage."""
    r = session.put(f"{API}/projects/{created_project['id']}", headers=auth_headers, json={"stage": "Planning"})
    assert r.status_code == 200
    assert r.json()["stage"] == "Planning"


# --- Phase 2: checklist ---
def test_update_checklist_persists(session, auth_headers, created_project):
    pid = created_project["id"]
    items = list(created_project["checklist"])
    items[0] = {**items[0], "done": True}
    items[1] = {**items[1], "done": True}
    r = session.put(f"{API}/projects/{pid}/checklist", headers=auth_headers, json={"items": items})
    assert r.status_code == 200, r.text
    cl = r.json()["checklist"]
    assert cl[0]["done"] is True
    assert cl[1]["done"] is True
    # GET verify
    r = session.get(f"{API}/projects/{pid}", headers=auth_headers)
    cl2 = r.json()["checklist"]
    assert sum(1 for it in cl2 if it["done"]) == 2


# --- Phase 3: AI mode endpoints ---
@pytest.mark.parametrize("mode", AI_MODES)
def test_ai_mode_endpoint(session, auth_headers, created_project, mode):
    r = session.post(f"{API}/ai/{mode}", headers=auth_headers,
                     json={"project_id": created_project["id"]})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "headline" in data
    assert "mode" in data
    assert "generated_at" in data


def test_ai_mode_404_for_missing_project(session, auth_headers):
    r = session.post(f"{API}/ai/refine-idea", headers=auth_headers, json={"project_id": "nonexistent"})
    assert r.status_code == 404


# --- Phase 7: dashboard analytics ---
def test_dashboard_stats(session, auth_headers, created_project):
    r = session.get(f"{API}/dashboard/stats", headers=auth_headers)
    assert r.status_code == 200, r.text
    data = r.json()
    for k in ["total_projects", "by_stage", "score_averages", "avg_build_score", "ready_to_build", "recent"]:
        assert k in data, f"missing {k}"
    assert data["total_projects"] >= 1
    assert set(data["by_stage"].keys()) == set(STAGES), data["by_stage"].keys()
    assert isinstance(data["recent"], list)


# --- Backend defaults backfill for legacy projects ---
def test_legacy_project_backfill(session, auth_headers):
    """Inserting a project missing stage/checklist via direct PUT shows defaults on read.
    Simulate by creating then 'removing' via update (we can't, so just verify default on list)."""
    r = session.get(f"{API}/projects", headers=auth_headers)
    assert r.status_code == 200
    for p in r.json():
        assert p.get("stage") in STAGES
        assert isinstance(p.get("checklist"), list) and len(p["checklist"]) >= 1


# --- User isolation ---
def test_user_isolation(session, auth_headers):
    email = f"TEST_{uuid.uuid4().hex[:8]}@buildpilot.app"
    r = session.post(f"{API}/auth/register", json={"email": email, "password": "testpass123", "name": "U2"})
    token2 = r.json()["token"]
    h2 = {"Authorization": f"Bearer {token2}"}

    r = session.post(f"{API}/projects", headers=auth_headers, json={"idea": "secret idea"})
    pid = r.json()["id"]
    try:
        r = session.get(f"{API}/projects/{pid}", headers=h2)
        assert r.status_code == 404
        # also stage/checklist endpoints can't touch
        r = session.put(f"{API}/projects/{pid}/stage", headers=h2, json={"stage": "Idea"})
        assert r.status_code == 404
    finally:
        session.delete(f"{API}/projects/{pid}", headers=auth_headers)
