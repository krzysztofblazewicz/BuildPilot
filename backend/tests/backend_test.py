"""BuildPilot backend API tests"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://pilot-preview-19.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@buildpilot.app"
ADMIN_PASSWORD = "admin123"


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


# --- Health ---
def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert "BuildPilot" in r.json().get("message", "")


# --- Auth ---
def test_register_duplicate(session, fresh_user):
    r = session.post(f"{API}/auth/register", json={"email": fresh_user["email"], "password": "x" * 6, "name": "Dup"})
    assert r.status_code == 400


def test_login_admin(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    data = r.json()
    assert "token" in data and data["user"]["email"] == ADMIN_EMAIL


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


# --- Projects: protected ---
def test_projects_protected(session):
    for method, path in [("get", "/projects"), ("post", "/projects"), ("get", "/projects/x"), ("put", "/projects/x"), ("delete", "/projects/x"), ("post", "/projects/x/generate")]:
        r = getattr(session, method)(f"{API}{path}", json={} if method in ("post", "put") else None)
        assert r.status_code == 401, f"{method} {path} -> {r.status_code}"


# --- Project CRUD ---
def test_project_full_flow(session, auth_headers):
    # Create
    payload = {
        "idea": "An app to help students organize study sessions",
        "target_user": "college students",
        "problem": "procrastination and poor scheduling",
        "goal_type": "University Project",
        "skill_level": "Beginner",
        "timeframe": "1 month",
        "preferred_tech": "React, FastAPI",
        "team_size": "1",
        "constraints": "no budget",
        "notes": "for capstone",
    }
    r = session.post(f"{API}/projects", headers=auth_headers, json=payload)
    assert r.status_code == 200, r.text
    proj = r.json()
    assert proj["status"] == "Draft"
    assert proj["title"].startswith("An app to help")
    assert "id" in proj
    pid = proj["id"]

    # List
    r = session.get(f"{API}/projects", headers=auth_headers)
    assert r.status_code == 200
    assert any(p["id"] == pid for p in r.json())

    # Get
    r = session.get(f"{API}/projects/{pid}", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["id"] == pid

    # Generate
    r = session.post(f"{API}/projects/{pid}/generate", headers=auth_headers)
    assert r.status_code == 200, r.text
    g = r.json()
    plan = g["generated_plan"]
    for key in ["refined_name", "pitch", "problem_statement", "mvp_features", "nice_to_have_features",
                "tech_stack", "roadmap", "risks", "ethics", "next_actions", "score"]:
        assert key in plan, f"missing {key}"
    assert len(plan["roadmap"]) == 4
    for s in ["feasibility", "originality", "market_potential", "difficulty"]:
        assert s in plan["score"]
    assert g["status"] == "Generated"

    # Update
    r = session.put(f"{API}/projects/{pid}", headers=auth_headers, json={"notes": "updated", "status": "Refined"})
    assert r.status_code == 200
    assert r.json()["notes"] == "updated"
    assert r.json()["status"] == "Refined"

    # GET verify persistence
    r = session.get(f"{API}/projects/{pid}", headers=auth_headers)
    assert r.json()["notes"] == "updated"

    # Delete
    r = session.delete(f"{API}/projects/{pid}", headers=auth_headers)
    assert r.status_code == 200
    r = session.get(f"{API}/projects/{pid}", headers=auth_headers)
    assert r.status_code == 404


def test_user_isolation(session, auth_headers):
    # second user shouldn't see other's projects
    email = f"TEST_{uuid.uuid4().hex[:8]}@buildpilot.app"
    r = session.post(f"{API}/auth/register", json={"email": email, "password": "testpass123", "name": "U2"})
    token2 = r.json()["token"]
    h2 = {"Authorization": f"Bearer {token2}"}

    r = session.post(f"{API}/projects", headers=auth_headers, json={"idea": "secret idea"})
    pid = r.json()["id"]

    r = session.get(f"{API}/projects/{pid}", headers=h2)
    assert r.status_code == 404

    session.delete(f"{API}/projects/{pid}", headers=auth_headers)
