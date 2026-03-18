# UNIT TESTS: Tests Authentication Endpoints
# Check for client injection under conftest.py

from fastapi.testclient import TestClient

from app.config import Settings
from app.models import models

# Test for correct login credentials
def test_login_correct_credentials(client: TestClient) -> None:
    login_data = {
        "username": Settings.SUPER_USERNAME,
        "password": Settings.SUPER_PASSWORD,
    }
    r = client.post(f"/auth/login", data=login_data)
    tokens = r.json()
    assert r.status_code == 200
    assert "access_token" in tokens
    assert tokens["access_token"]

# Test for incorrect login credentials
def test_login_incorrect_credentials(client: TestClient) -> None:
    login_data = {
        "username": "SomeUsername",
        "password": "SomePassword",
    }
    r = client.post(f"/auth/login", data=login_data)
    assert r.status_code == 401

# Test for new user account signup
def test_signup_correct_credentials(client: TestClient) -> None:
    signup_data = {
        "username": "new_user_5",
        "password": "new_password_3",
    }
    r = client.post(f"/auth/signup", data=signup_data)
    user = r.json()
    assert "id" in user
    assert "username" in user
    assert "is_active" in user
    assert "is_superuser" in user and user["is_superuser"] == 0
    assert "hashed_password" in user
    assert "created_at" in user

# Test for existing user signup
def test_signup_existing_user(client: TestClient) -> None:
    signup_data = {
        "username": Settings.SUPER_USERNAME,
        "password": Settings.SUPER_PASSWORD,
    }
    r = client.post(f"/auth/signup", data=signup_data)
    assert r.status_code == 400

    

