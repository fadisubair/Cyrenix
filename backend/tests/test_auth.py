def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "pytest_auth_user",
            "email": "pytest_auth_user@example.com",
            "password": "TestPassword123!",
            "role": "ANALYST",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["username"] == "pytest_auth_user"
    assert data["email"] == "pytest_auth_user@example.com"
    assert data["role"] == "ANALYST"
    assert data["is_active"] is True

    assert "password" not in data
    assert "password_hash" not in data


def test_login_user(client):
    register_response = client.post(
        "/api/auth/register",
        json={
            "username": "pytest_login_user",
            "email": "pytest_login_user@example.com",
            "password": "TestPassword123!",
            "role": "ANALYST",
        },
    )

    assert register_response.status_code == 201

    response = client.post(
        "/api/auth/login",
        json={
            "username": "pytest_login_user",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_get_current_user(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "pytest_me_user",
            "email": "pytest_me_user@example.com",
            "password": "TestPassword123!",
            "role": "ANALYST",
        },
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "username": "pytest_me_user",
            "password": "TestPassword123!",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.get(
        "/api/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["username"] == "pytest_me_user"
    assert data["role"] == "ANALYST"
def test_duplicate_registration_returns_409(client):
    payload = {
        "username": "pytest_duplicate_user",
        "email": "pytest_duplicate_user@example.com",
        "password": "TestPassword123!",
        "role": "ANALYST",
    }

    first_response = client.post(
        "/api/auth/register",
        json=payload,
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/api/auth/register",
        json=payload,
    )

    assert second_response.status_code == 409


def test_invalid_login_returns_401(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "pytest_invalid_login",
            "email": "pytest_invalid_login@example.com",
            "password": "TestPassword123!",
            "role": "ANALYST",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "username": "pytest_invalid_login",
            "password": "WrongPassword123!",
        },
    )

    assert response.status_code == 401
