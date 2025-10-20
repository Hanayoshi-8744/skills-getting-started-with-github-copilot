import src.app as app_module
from fastapi.testclient import TestClient

client = TestClient(app_module.app)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    # basic sanity: Chess Club exists
    assert "Chess Club" in data


def test_signup_and_unregister():
    activity = "Chess Club"
    email = "test_student@example.com"

    # Ensure clean start (remove if pre-existing)
    participants = app_module.activities[activity]["participants"]
    if email in participants:
        participants.remove(email)

    # Sign up
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    j = resp.json()
    assert "Signed up" in j.get("message", "")
    assert email in app_module.activities[activity]["participants"]

    # Unregister
    resp2 = client.delete(f"/activities/{activity}/participants?email={email}")
    assert resp2.status_code == 200
    j2 = resp2.json()
    assert "Unregistered" in j2.get("message", "")
    assert email not in app_module.activities[activity]["participants"]
