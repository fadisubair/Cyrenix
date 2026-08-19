def register_and_login(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "pytest_investigator",
            "email": "pytest_investigator@example.com",
            "password": "TestPassword123!",
            "role": "ANALYST",
        },
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "username": "pytest_investigator",
            "password": "TestPassword123!",
        },
    )

    assert login_response.status_code == 200

    return login_response.json()["access_token"]


def test_complete_investigation_flow(client):
    token = register_and_login(client)

    headers = {
        "Authorization": f"Bearer {token}",
    }

    # ---------------------------------------------------------
    # 1. Create incident
    # ---------------------------------------------------------

    incident_response = client.post(
        "/api/incidents",
        headers=headers,
        json={
            "title": "Pytest Brute Force",
            "description": "Automated investigation test",
            "category": "AUTHENTICATION",
            "severity": "HIGH",
        },
    )

    assert incident_response.status_code == 201

    incident = incident_response.json()
    incident_id = incident["id"]

    # ---------------------------------------------------------
    # 2. Create three failed-login events
    # ---------------------------------------------------------

    event_ids = []

    timestamps = [
        "2026-08-18T15:00:00+05:30",
        "2026-08-18T15:02:00+05:30",
        "2026-08-18T15:04:00+05:30",
    ]

    for timestamp in timestamps:
        response = client.post(
            "/api/events",
            headers=headers,
            json={
                "incident_id": incident_id,
                "timestamp": timestamp,
                "event_type": "FAILED_LOGIN",
                "source": "windows_security",
                "username": "admin",
                "source_ip": "10.20.30.40",
                "destination_ip": "10.20.30.10",
                "hostname": "TEST-DC",
                "raw_data": "Failed login attempt.",
            },
        )

        assert response.status_code == 201

        event_ids.append(
            response.json()["id"]
        )

    assert len(event_ids) == 3

    # ---------------------------------------------------------
    # 3. Analyze incident
    # ---------------------------------------------------------

    analysis_response = client.post(
        f"/api/investigations/{incident_id}/analyze",
        headers=headers,
    )

    assert analysis_response.status_code == 201

    finding = analysis_response.json()

    assert finding["incident_id"] == incident_id
    assert finding["finding_type"] == "BRUTE_FORCE"
    assert finding["confidence"] == 0.75
    assert finding["status"] == "PROPOSED"

    finding_id = finding["id"]

    # ---------------------------------------------------------
    # 4. Verify reasoning
    # ---------------------------------------------------------

    reasoning_response = client.get(
        f"/api/investigations/findings/{finding_id}/reasoning",
        headers=headers,
    )

    assert reasoning_response.status_code == 200

    reasoning = reasoning_response.json()

    assert len(reasoning) == 3

    assert reasoning[0]["step_type"] == "OBSERVATION"
    assert reasoning[1]["step_type"] == "CORRELATION"
    assert reasoning[2]["step_type"] == "ASSESSMENT"

    # Every reasoning step should reference all three events.
    for step in reasoning:
        assert step["evidence_event_ids"] == event_ids

    # ---------------------------------------------------------
    # 5. Verify evidence
    # ---------------------------------------------------------

    evidence_response = client.get(
        f"/api/findings/{finding_id}/evidence",
        headers=headers,
    )

    assert evidence_response.status_code == 200

    evidence = evidence_response.json()

    evidence_ids = [
        event["id"]
        for event in evidence
    ]

    assert evidence_ids == event_ids
