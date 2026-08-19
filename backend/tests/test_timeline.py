def register_and_login(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "pytest_timeline_user",
            "email": "pytest_timeline_user@example.com",
            "password": "TestPassword123!",
            "role": "ANALYST",
        },
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "username": "pytest_timeline_user",
            "password": "TestPassword123!",
        },
    )

    assert login_response.status_code == 200

    return login_response.json()["access_token"]


def create_complete_incident(client, token):
    headers = {
        "Authorization": f"Bearer {token}",
    }

    incident_response = client.post(
        "/api/incidents",
        headers=headers,
        json={
            "title": "Pytest Timeline Test",
            "description": "Timeline integration test",
            "category": "AUTHENTICATION",
            "severity": "HIGH",
        },
    )

    assert incident_response.status_code == 201

    incident_id = incident_response.json()["id"]

    timestamps = [
        "2026-08-18T17:00:00+05:30",
        "2026-08-18T17:02:00+05:30",
        "2026-08-18T17:04:00+05:30",
    ]

    for timestamp in timestamps:
        response = client.post(
            "/api/events",
            headers=headers,
            json={
                "incident_id": incident_id,
                "timestamp": timestamp,
                "event_type": "FAILED_LOGIN",
                "source": "pytest",
                "username": "admin",
                "source_ip": "10.60.70.80",
                "destination_ip": "10.60.70.10",
                "hostname": "TIMELINE-DC",
                "raw_data": "Failed login attempt.",
            },
        )

        assert response.status_code == 201

    analysis_response = client.post(
        f"/api/investigations/{incident_id}/analyze",
        headers=headers,
    )

    assert analysis_response.status_code == 201

    finding_id = analysis_response.json()["id"]

    recommendation_response = client.post(
        f"/api/response-actions/finding/{finding_id}/recommend",
        headers=headers,
    )

    assert recommendation_response.status_code == 201

    action_id = recommendation_response.json()["id"]

    approval_response = client.patch(
        f"/api/response-actions/{action_id}/approve",
        headers=headers,
    )

    assert approval_response.status_code == 200

    execution_response = client.post(
        f"/api/response-actions/{action_id}/execute",
        headers=headers,
        json={
            "mode": "DRY_RUN",
        },
    )

    assert execution_response.status_code == 200

    return incident_id


def test_full_incident_timeline(client):
    token = register_and_login(client)

    incident_id = create_complete_incident(
        client,
        token,
    )

    headers = {
        "Authorization": f"Bearer {token}",
    }

    response = client.get(
        f"/api/incidents/{incident_id}/timeline",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["incident_id"] == incident_id
    assert len(data["timeline"]) > 0

    event_types = [
        item["event_type"]
        for item in data["timeline"]
    ]

    assert "FINDING" in event_types
    assert "REASONING" in event_types
    assert "RESPONSE_RECOMMENDATION" in event_types
    assert "ACTION_APPROVED" in event_types
    assert "ACTION_EXECUTED" in event_types
    assert "EVENT" in event_types


def test_reasoning_filter(client):
    token = register_and_login(client)

    incident_id = create_complete_incident(
        client,
        token,
    )

    headers = {
        "Authorization": f"Bearer {token}",
    }

    response = client.get(
        f"/api/incidents/{incident_id}/timeline"
        "?event_type=REASONING",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["timeline"]) == 3

    for item in data["timeline"]:
        assert item["event_type"] == "REASONING"
        assert item["source_type"] == "INVESTIGATION_STEP"


def test_audit_log_filter(client):
    token = register_and_login(client)

    incident_id = create_complete_incident(
        client,
        token,
    )

    headers = {
        "Authorization": f"Bearer {token}",
    }

    response = client.get(
        f"/api/incidents/{incident_id}/timeline"
        "?source_type=AUDIT_LOG",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["timeline"]) == 2

    event_types = [
        item["event_type"]
        for item in data["timeline"]
    ]

    assert event_types == [
        "ACTION_APPROVED",
        "ACTION_EXECUTED",
    ]

    for item in data["timeline"]:
        assert item["source_type"] == "AUDIT_LOG"


def test_unauthenticated_timeline_returns_401(client):
    response = client.get(
        "/api/incidents/999/timeline"
    )

    assert response.status_code == 401
