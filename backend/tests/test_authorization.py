def register_and_login(
    client,
    username: str,
    email: str,
    role: str,
):
    register_response = client.post(
        "/api/auth/register",
        json={
            "username": username,
            "email": email,
            "password": "TestPassword123!",
            "role": role,
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/api/auth/login",
        json={
            "username": username,
            "password": "TestPassword123!",
        },
    )

    assert login_response.status_code == 200

    return login_response.json()["access_token"]


def test_unauthenticated_request_returns_401(client):
    response = client.get(
        "/api/events"
    )

    assert response.status_code == 401


def test_analyst_can_read_events(client):
    token = register_and_login(
        client,
        "pytest_analyst_auth",
        "pytest_analyst_auth@example.com",
        "ANALYST",
    )

    response = client.get(
        "/api/events",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200


def test_viewer_can_read_events(client):
    token = register_and_login(
        client,
        "pytest_viewer_read",
        "pytest_viewer_read@example.com",
        "VIEWER",
    )

    response = client.get(
        "/api/events",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200


def test_viewer_cannot_create_event(client):
    token = register_and_login(
        client,
        "pytest_viewer_write",
        "pytest_viewer_write@example.com",
        "VIEWER",
    )

    response = client.post(
        "/api/events",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "incident_id": None,
            "timestamp": "2026-08-18T15:00:00+05:30",
            "event_type": "TEST_EVENT",
        },
    )

    assert response.status_code == 403


def test_analyst_can_create_event(client):
    token = register_and_login(
        client,
        "pytest_analyst_write",
        "pytest_analyst_write@example.com",
        "ANALYST",
    )

    response = client.post(
        "/api/events",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "incident_id": None,
            "timestamp": "2026-08-18T15:00:00+05:30",
            "event_type": "TEST_EVENT",
        },
    )

    assert response.status_code == 201
def test_invalid_jwt_returns_401(client):
    response = client.get(
        "/api/events",
        headers={
            "Authorization": "Bearer invalid.jwt.token",
        },
    )

    assert response.status_code == 401
