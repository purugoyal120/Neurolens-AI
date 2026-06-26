"""Integration tests for the simple Vision Profile Test Module's HTTP API."""
import os

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app


@pytest.fixture()
def client():
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


def _perfect_answers() -> list[dict]:
    return [
        {"question_id": "q1", "selected_option_id": "q1_a", "response_time_ms": 900},
        {"question_id": "q2", "selected_option_id": "q2_b", "response_time_ms": 900},
        {"question_id": "q3", "selected_option_id": "q3_b", "response_time_ms": 900},
        {"question_id": "q4", "selected_option_id": "q4_b", "response_time_ms": 900},
        {"question_id": "q5", "selected_option_id": "q5_b", "response_time_ms": 900},
        {"question_id": "q6", "selected_option_id": "q6_c", "response_time_ms": 900},
        {"question_id": "q7", "selected_option_id": "q7_b", "response_time_ms": 900},
        {"question_id": "q8", "selected_option_id": "q8_c", "response_time_ms": 900},
        {"question_id": "q9", "selected_option_id": "q9_b", "response_time_ms": 900},
        {"question_id": "q10", "selected_option_id": "q10_b", "response_time_ms": 900},
    ]


def test_start_returns_10_questions_with_timer(client):
    res = client.post("/api/vision-test/start")
    assert res.status_code == 200
    body = res.json()
    assert len(body["questions"]) == 10
    assert body["time_limit_seconds"] == 120
    # spot check axis distribution matches the spec: 3 rg, 3 by, 2 mixed, 2 real-world
    axes = [q["axis"] for q in body["questions"]]
    assert axes.count("red_green") == 3
    assert axes.count("blue_yellow") == 3
    assert axes.count("mixed") == 2
    assert axes.count("real_world") == 2
    # every question has 4+ options
    assert all(len(q["options"]) >= 4 for q in body["questions"])


def test_submit_perfect_score(client):
    res = client.post(
        "/api/vision-test/submit",
        json={"user_id": "user_123", "test_id": "t1", "answers": _perfect_answers()},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["profile"]["deficiency_type"] == "none"
    assert body["score_summary"]["accuracy"] == 1.0


def test_submit_red_green_pattern_and_transformations_serialize_correctly(client):
    answers = _perfect_answers()
    answers[0] = {"question_id": "q1", "selected_option_id": "q1_b", "response_time_ms": 2000}
    answers[1] = {"question_id": "q2", "selected_option_id": "q2_a", "response_time_ms": 2000}
    answers[2] = {"question_id": "q3", "selected_option_id": "q3_a", "response_time_ms": 2000}

    res = client.post(
        "/api/vision-test/submit",
        json={"user_id": "puru", "test_id": "t1", "answers": answers},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["profile"]["deficiency_type"] == "red-green"
    transformations = body["profile"]["recommended_transformations"]
    assert len(transformations) > 0
    # "from" must serialize as the literal key "from" (it's a reserved word
    # in Python, aliased internally to from_) — this is the exact contract
    # shape requested in the spec.
    for t in transformations:
        assert "from" in t
        assert "to" in t
        assert "reason" in t
        assert t["from"].startswith("#")
        assert t["to"].startswith("#")


def test_get_profile_404_before_submission(client):
    res = client.get("/api/vision-profile/nobody")
    assert res.status_code == 404


def test_get_profile_after_submission(client):
    client.post(
        "/api/vision-test/submit",
        json={"user_id": "user_123", "test_id": "t1", "answers": _perfect_answers()},
    )
    res = client.get("/api/vision-profile/user_123")
    assert res.status_code == 200
    body = res.json()
    assert body["user_id"] == "user_123"
    assert "perception_scores" in body
    assert set(body["perception_scores"].keys()) == {"red", "green", "blue", "yellow"}


def test_submit_empty_answers_rejected(client):
    res = client.post(
        "/api/vision-test/submit",
        json={"user_id": "x", "test_id": "t1", "answers": []},
    )
    assert res.status_code == 400


def test_resubmission_overwrites_profile(client):
    client.post(
        "/api/vision-test/submit",
        json={"user_id": "retaker", "test_id": "t1", "answers": _perfect_answers()},
    )
    first = client.get("/api/vision-profile/retaker").json()
    assert first["deficiency_type"] == "none"

    bad_answers = _perfect_answers()
    bad_answers[0] = {"question_id": "q1", "selected_option_id": "q1_b", "response_time_ms": 2000}
    bad_answers[1] = {"question_id": "q2", "selected_option_id": "q2_a", "response_time_ms": 2000}
    bad_answers[2] = {"question_id": "q3", "selected_option_id": "q3_a", "response_time_ms": 2000}
    client.post(
        "/api/vision-test/submit",
        json={"user_id": "retaker", "test_id": "t2", "answers": bad_answers},
    )
    second = client.get("/api/vision-profile/retaker").json()
    assert second["deficiency_type"] == "red-green"


def test_two_modules_coexist_without_table_collision(client):
    """The 12-trial module and this 10-question module both write to their
    own tables (vision_profiles vs simple_vision_profiles) for the same
    user_id without clobbering each other."""
    client.post(
        "/api/vision-test/submit",
        json={"user_id": "shared_user", "test_id": "t1", "answers": _perfect_answers()},
    )
    simple_profile = client.get("/api/vision-profile/shared_user")
    assert simple_profile.status_code == 200

    extended_profile = client.get("/api/v1/profile/shared_user/vision-map")
    assert extended_profile.status_code == 404  # this user never took the OTHER test
