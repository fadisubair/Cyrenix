import pytest

def register_and_login(client, role="ANALYST", username="pytest_events_user"):
    client.post(
        "/api/auth/register",
        json={
            "username": username,
            "email": f"{username}@example.com",
            "password": "TestPassword123!",
            "role": role,
        },
    )
    login_response = client.post(
        "/api/auth/login",
        json={
            "username": username,
            "password": "TestPassword123!",
        },
    )
    return login_response.json()["access_token"]

def test_associate_event_success(client):
    token = register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Create incident
    inc_resp = client.post(
        "/api/incidents",
        headers=headers,
        json={
            "title": "Test Incident",
            "description": "Desc",
            "category": "AUTHENTICATION",
            "severity": "LOW"
        }
    )
    incident_id = inc_resp.json()["id"]

    # Create event
    evt_resp = client.post(
        "/api/events",
        headers=headers,
        json={
            "timestamp": "2026-08-31T00:00:00Z",
            "event_type": "FAILED_LOGIN",
            "source": "Wazuh",
            "raw_data": "raw data"
        }
    )
    event_id = evt_resp.json()["id"]

    # Associate
    assoc_resp = client.patch(
        f"/api/events/{event_id}/incident/{incident_id}",
        headers=headers
    )
    assert assoc_resp.status_code == 200
    assert assoc_resp.json()["incident_id"] == incident_id

    # Verify audit log
    audit_resp = client.get("/api/audit-logs", headers=headers)
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    assoc_logs = [log for log in logs if log["action"] == "ASSOCIATE_EVENT"]
    assert len(assoc_logs) > 0
    assert "event_id" in assoc_logs[0]["details"]

def test_associate_event_not_found(client):
    token = register_and_login(client, username="pytest_events_user_2")
    headers = {"Authorization": f"Bearer {token}"}

    assoc_resp = client.patch(
        "/api/events/999999/incident/1",
        headers=headers
    )
    assert assoc_resp.status_code == 404

def test_associate_incident_not_found(client):
    token = register_and_login(client, username="pytest_events_user_3")
    headers = {"Authorization": f"Bearer {token}"}

    # Create event
    evt_resp = client.post(
        "/api/events",
        headers=headers,
        json={
            "timestamp": "2026-08-31T00:00:00Z",
            "event_type": "FAILED_LOGIN",
            "source": "Wazuh",
            "raw_data": "raw data"
        }
    )
    event_id = evt_resp.json()["id"]

    assoc_resp = client.patch(
        f"/api/events/{event_id}/incident/999999",
        headers=headers
    )
    assert assoc_resp.status_code == 404

def test_associate_viewer_unauthorized(client):
    token = register_and_login(client, role="VIEWER", username="pytest_events_viewer")
    headers = {"Authorization": f"Bearer {token}"}

    assoc_resp = client.patch(
        "/api/events/1/incident/1",
        headers=headers
    )
    assert assoc_resp.status_code == 403

def test_associate_reassignment_conflict(client):
    token = register_and_login(client, username="pytest_events_user_4")
    headers = {"Authorization": f"Bearer {token}"}

    # Create incident
    inc_resp = client.post(
        "/api/incidents",
        headers=headers,
        json={
            "title": "Test Incident 2",
            "description": "Desc",
            "category": "AUTHENTICATION",
            "severity": "LOW"
        }
    )
    incident_id = inc_resp.json()["id"]

    # Create event linked to incident
    evt_resp = client.post(
        "/api/events",
        headers=headers,
        json={
            "incident_id": incident_id,
            "timestamp": "2026-08-31T00:00:00Z",
            "event_type": "FAILED_LOGIN",
            "source": "Wazuh",
            "raw_data": "raw data"
        }
    )
    event_id = evt_resp.json()["id"]

    # Attempt to reassign to a new incident
    inc_resp_2 = client.post(
        "/api/incidents",
        headers=headers,
        json={
            "title": "Test Incident 3",
            "description": "Desc",
            "category": "AUTHENTICATION",
            "severity": "LOW"
        }
    )
    incident_id_2 = inc_resp_2.json()["id"]

    assoc_resp = client.patch(
        f"/api/events/{event_id}/incident/{incident_id_2}",
        headers=headers
    )
    assert assoc_resp.status_code == 409
