def register_and_login(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "pytest_response_user",
            "email": "pytest_response_user@example.com",
            "password": "TestPassword123!",
            "role": "ANALYST",
        },
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "username": "pytest_response_user",
            "password": "TestPassword123!",
        },
    )

    assert login_response.status_code == 200

    return login_response.json()["access_token"]


def create_bruteforce_finding(client, token):
    headers = {
        "Authorization": f"Bearer {token}",
    }

    # Create incident
    incident_response = client.post(
        "/api/incidents",
        headers=headers,
        json={
            "title": "Pytest Response Test",
            "description": "Response action integration test",
            "category": "AUTHENTICATION",
            "severity": "HIGH",
        },
    )

    assert incident_response.status_code == 201

    incident_id = incident_response.json()["id"]

    # Create three matching failed-login events
    timestamps = [
        "2026-08-18T16:00:00+05:30",
        "2026-08-18T16:02:00+05:30",
        "2026-08-18T16:04:00+05:30",
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
                "source_ip": "10.50.60.70",
                "destination_ip": "10.50.60.10",
                "hostname": "PYTEST-DC",
                "raw_data": "Failed login attempt.",
            },
        )

        assert response.status_code == 201

    # Analyze
    analysis_response = client.post(
        f"/api/investigations/{incident_id}/analyze",
        headers=headers,
    )

    assert analysis_response.status_code == 201

    return analysis_response.json()["id"]

def create_failed_login_spike_finding(client, token):
    headers = {
        "Authorization": f"Bearer {token}",
    }

    # Create incident
    incident_response = client.post(
        "/api/incidents",
        headers=headers,
        json={
            "title": "Pytest Response Test Spike",
            "description": "Response action integration test for spike",
            "category": "AUTHENTICATION",
            "severity": "HIGH",
        },
    )

    assert incident_response.status_code == 201

    incident_id = incident_response.json()["id"]

    # Create three failed-login events from different IPs so they don't form a group but pass MIN_FAILED_LOGINS=3 check
    events_data = [
        {"timestamp": "2026-08-18T16:00:00+05:30", "ip": "10.50.60.71"},
        {"timestamp": "2026-08-18T16:02:00+05:30", "ip": "10.50.60.72"},
        {"timestamp": "2026-08-18T16:04:00+05:30", "ip": "10.50.60.73"},
    ]

    for event_data in events_data:
        response = client.post(
            "/api/events",
            headers=headers,
            json={
                "incident_id": incident_id,
                "timestamp": event_data["timestamp"],
                "event_type": "FAILED_LOGIN",
                "source": "pytest",
                "username": "admin",
                "source_ip": event_data["ip"],
                "destination_ip": "10.50.60.10",
                "hostname": "PYTEST-DC",
                "raw_data": "Failed login attempt.",
            },
        )

        assert response.status_code == 201

    # Analyze
    analysis_response = client.post(
        f"/api/investigations/{incident_id}/analyze",
        headers=headers,
    )

    assert analysis_response.status_code == 201

    return analysis_response.json()["id"]


def test_response_action_lifecycle(client):
    token = register_and_login(client)

    headers = {
        "Authorization": f"Bearer {token}",
    }

    finding_id = create_bruteforce_finding(
        client,
        token,
    )

    # ---------------------------------------------------------
    # 1. Recommend response
    # ---------------------------------------------------------

    recommendation_response = client.post(
        f"/api/response-actions/finding/{finding_id}/recommend",
        headers=headers,
    )

    assert recommendation_response.status_code == 201

    action = recommendation_response.json()

    assert action["action_type"] == "BLOCK_SOURCE_IP"
    assert action["target"] == "10.50.60.70"
    assert action["status"] == "PENDING_APPROVAL"
    assert action["execution_status"] == "NOT_EXECUTED"

    action_id = action["id"]

    # ---------------------------------------------------------
    # 2. Approve using authenticated identity
    # ---------------------------------------------------------

    approval_response = client.patch(
        f"/api/response-actions/{action_id}/approve",
        headers=headers,
    )

    assert approval_response.status_code == 200

    approved_action = approval_response.json()

    assert approved_action["status"] == "APPROVED"
    assert approved_action["approved_by"] == "pytest_response_user"

    # ---------------------------------------------------------
    # 3. Verify approval audit
    # ---------------------------------------------------------

    audit_response = client.get(
        f"/api/audit-logs/response-action/{action_id}",
        headers=headers,
    )

    assert audit_response.status_code == 200

    audit_logs = audit_response.json()

    assert len(audit_logs) == 1

    assert audit_logs[0]["action"] == "ACTION_APPROVED"
    assert audit_logs[0]["actor"] == "pytest_response_user"

    # ---------------------------------------------------------
    # 4. Execute DRY_RUN
    # ---------------------------------------------------------

    execution_response = client.post(
        f"/api/response-actions/{action_id}/execute",
        headers=headers,
        json={
            "mode": "DRY_RUN",
        },
    )

    assert execution_response.status_code == 200

    executed_action = execution_response.json()

    assert executed_action["status"] == "APPROVED"
    assert executed_action["execution_status"] == "SUCCESS"
    assert executed_action["execution_mode"] == "DRY_RUN"
    assert (
        executed_action["execution_message"]
        == "DRY RUN: Simulated blocking of source IP 10.50.60.70."
    )

    # ---------------------------------------------------------
    # 5. Verify execution audit
    # ---------------------------------------------------------

    audit_response = client.get(
        f"/api/audit-logs/response-action/{action_id}",
        headers=headers,
    )

    assert audit_response.status_code == 200

    audit_logs = audit_response.json()

    assert len(audit_logs) == 2

    assert audit_logs[0]["action"] == "ACTION_APPROVED"
    assert audit_logs[0]["actor"] == "pytest_response_user"

    assert audit_logs[1]["action"] == "ACTION_EXECUTED"
    assert audit_logs[1]["actor"] == "pytest_response_user"

    # ---------------------------------------------------------
    # 6. Prevent duplicate execution
    # ---------------------------------------------------------

    duplicate_execution = client.post(
        f"/api/response-actions/{action_id}/execute",
        headers=headers,
        json={
            "mode": "DRY_RUN",
        },
    )

    assert duplicate_execution.status_code == 400

    assert (
        duplicate_execution.json()["detail"]
        == "Response action has already been executed"
    )


def test_unapproved_action_cannot_execute(client):
    token = register_and_login(client)

    headers = {
        "Authorization": f"Bearer {token}",
    }

    finding_id = create_bruteforce_finding(
        client,
        token,
    )

    recommendation_response = client.post(
        f"/api/response-actions/finding/{finding_id}/recommend",
        headers=headers,
    )

    assert recommendation_response.status_code == 201

    action_id = recommendation_response.json()["id"]

    execution_response = client.post(
        f"/api/response-actions/{action_id}/execute",
        headers=headers,
        json={
            "mode": "DRY_RUN",
        },
    )

    assert execution_response.status_code == 400

    assert (
        execution_response.json()["detail"]
        == "Only approved actions can be executed"
    )
def test_unsupported_execution_mode_returns_400(client):
    token = register_and_login(client)

    headers = {
        "Authorization": f"Bearer {token}",
    }

    finding_id = create_bruteforce_finding(
        client,
        token,
    )

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
            "mode": "REAL_EXECUTION",
        },
    )

    assert execution_response.status_code == 400
    assert (
        execution_response.json()["detail"]
        == "Unsupported execution mode"
    )


def test_reject_response_action(client):
    token = register_and_login(client)

    headers = {
        "Authorization": f"Bearer {token}",
    }

    finding_id = create_bruteforce_finding(
        client,
        token,
    )

    recommendation_response = client.post(
        f"/api/response-actions/finding/{finding_id}/recommend",
        headers=headers,
    )

    assert recommendation_response.status_code == 201

    action_id = recommendation_response.json()["id"]

    rejection_response = client.patch(
        f"/api/response-actions/{action_id}/reject",
        headers=headers,
    )

    assert rejection_response.status_code == 200

    rejected_action = rejection_response.json()

    assert rejected_action["status"] == "REJECTED"
    assert rejected_action["rejected_at"] is not None


def test_cannot_reject_approved_action(client):
    token = register_and_login(client)

    headers = {
        "Authorization": f"Bearer {token}",
    }

    finding_id = create_bruteforce_finding(
        client,
        token,
    )

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

    rejection_response = client.patch(
        f"/api/response-actions/{action_id}/reject",
        headers=headers,
    )

    assert rejection_response.status_code == 400
    assert (
        rejection_response.json()["detail"]
        == "Only pending actions can be rejected"
    )


def test_missing_response_action_returns_404(client):
    token = register_and_login(client)

    headers = {
        "Authorization": f"Bearer {token}",
    }

    response = client.get(
        "/api/response-actions/999999",
        headers=headers,
    )

    assert response.status_code == 404
    assert (
        response.json()["detail"]
        == "Response action not found"
    )

def test_response_action_recommend_failed_login_spike(client):
    token = register_and_login(client)

    headers = {
        "Authorization": f"Bearer {token}",
    }

    finding_id = create_failed_login_spike_finding(
        client,
        token,
    )

    recommendation_response = client.post(
        f"/api/response-actions/finding/{finding_id}/recommend",
        headers=headers,
    )

    assert recommendation_response.status_code == 201

    action = recommendation_response.json()

    assert action["action_type"] == "BLOCK_SOURCE_IP"
    assert action["target"] == "10.50.60.71"
    assert action["status"] == "PENDING_APPROVAL"
