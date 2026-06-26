"""Integration tests for the profile API, using FastAPI's TestClient (in-memory, no real server)."""
import os

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import StaticPool, create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import Base, get_db
from app.main import app


@pytest.fixture()
def client():
    # Fresh in-memory SQLite per test run, shared across connections via StaticPool
    # so the same in-memory DB is visible across requests within a test.
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_get_test_battery_has_12_trials(client):
    res = client.get("/api/v1/profile/test-battery")
    assert res.status_code == 200
    body = res.json()
    assert len(body["trials"]) == 12
    assert all(t["stimuli"] for t in body["trials"])
    # Every stimulus hex should be a valid 7-char hex string.
    for trial in body["trials"]:
        for stim in trial["stimuli"]:
            assert stim["hex"].startswith("#")
            assert len(stim["hex"]) == 7


def test_vision_map_404_before_test_taken(client):
    res = client.get("/api/v1/profile/nobody/vision-map")
    assert res.status_code == 404


def test_submit_results_then_fetch_vision_map(client):
    payload = {
        "user_id": "puru",
        "test_version": "v1.0",
        "responses": [
            {"trial_id": "rg_discrim_1", "answer": "same", "response_time_ms": 2500},
            {"trial_id": "rg_discrim_2", "answer": "same", "response_time_ms": 3000},
            {"trial_id": "rg_discrim_3", "answer": "same", "response_time_ms": 3200},
            {"trial_id": "by_discrim_1", "answer": "different", "response_time_ms": 900},
            {"trial_id": "by_discrim_2", "answer": "different", "response_time_ms": 1100},
            {"trial_id": "by_discrim_3", "answer": "different", "response_time_ms": 1500},
            {"trial_id": "ident_red", "answer": "Brown", "response_time_ms": 2800},
            {"trial_id": "ident_green", "answer": "Brown", "response_time_ms": 2900},
            {"trial_id": "ident_brownish", "answer": "Green", "response_time_ms": 3100},
            {"trial_id": "control_1", "answer": "different", "response_time_ms": 700},
            {"trial_id": "control_2", "answer": "different", "response_time_ms": 650},
            {"trial_id": "calibration_1", "answer": "different", "response_time_ms": 800},
        ],
    }
    submit_res = client.post("/api/v1/profile/test-results", json=payload)
    assert submit_res.status_code == 200
    summary = submit_res.json()
    assert summary["vision_map"]["cvd_type"] in ("protan", "deutan")
    assert summary["vision_map"]["recommended_strategy"] == "icon_replacement"

    fetch_res = client.get("/api/v1/profile/puru/vision-map")
    assert fetch_res.status_code == 200
    assert fetch_res.json()["user_id"] == "puru"


def test_empty_responses_rejected(client):
    res = client.post(
        "/api/v1/profile/test-results",
        json={"user_id": "x", "test_version": "v1.0", "responses": []},
    )
    assert res.status_code == 400


def test_retaking_test_overwrites_profile(client):
    base_payload = {
        "user_id": "retake_user",
        "test_version": "v1.0",
        "responses": [
            {"trial_id": "rg_discrim_1", "answer": "different", "response_time_ms": 800},
            {"trial_id": "rg_discrim_2", "answer": "different", "response_time_ms": 900},
            {"trial_id": "rg_discrim_3", "answer": "different", "response_time_ms": 1000},
            {"trial_id": "by_discrim_1", "answer": "different", "response_time_ms": 800},
            {"trial_id": "by_discrim_2", "answer": "different", "response_time_ms": 900},
            {"trial_id": "by_discrim_3", "answer": "different", "response_time_ms": 1000},
            {"trial_id": "ident_red", "answer": "Red", "response_time_ms": 700},
            {"trial_id": "ident_green", "answer": "Green", "response_time_ms": 700},
            {"trial_id": "ident_brownish", "answer": "Brown", "response_time_ms": 900},
            {"trial_id": "control_1", "answer": "different", "response_time_ms": 600},
            {"trial_id": "control_2", "answer": "different", "response_time_ms": 600},
            {"trial_id": "calibration_1", "answer": "different", "response_time_ms": 600},
        ],
    }
    res1 = client.post("/api/v1/profile/test-results", json=base_payload)
    assert res1.json()["vision_map"]["cvd_type"] == "none"

    severe_payload = dict(base_payload)
    severe_payload["responses"] = [
        {"trial_id": "rg_discrim_1", "answer": "same", "response_time_ms": 2500},
        {"trial_id": "rg_discrim_2", "answer": "same", "response_time_ms": 3000},
        {"trial_id": "rg_discrim_3", "answer": "same", "response_time_ms": 3200},
    ] + base_payload["responses"][3:]
    res2 = client.post("/api/v1/profile/test-results", json=severe_payload)
    assert res2.json()["vision_map"]["cvd_type"] in ("protan", "deutan")

    # Only one profile should exist for this user (overwritten, not duplicated).
    fetch = client.get("/api/v1/profile/retake_user/vision-map")
    assert fetch.json()["cvd_type"] in ("protan", "deutan")


def test_delete_profile(client):
    client.post(
        "/api/v1/profile/test-results",
        json={
            "user_id": "to_delete",
            "test_version": "v1.0",
            "responses": [{"trial_id": "rg_discrim_1", "answer": "different", "response_time_ms": 500}],
        },
    )
    del_res = client.delete("/api/v1/profile/to_delete")
    assert del_res.status_code == 200

    fetch_res = client.get("/api/v1/profile/to_delete/vision-map")
    assert fetch_res.status_code == 404
