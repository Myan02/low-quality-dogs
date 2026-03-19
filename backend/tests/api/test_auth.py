# UNIT TESTS: Tests Authentication Endpoints
# Check for client injection under conftest.py

from typing import Annotated
from fastapi import Depends
from fastapi.testclient import TestClient

from app.config import Settings
from app.models import models
from app.api.auth import get_current_user

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
        "username": "random_username",
        "password": "random_password",
    }
    r = client.post(f"/auth/signup", data=signup_data)
    user = r.json()
    assert "id" in user
    assert "username" in user
    assert "is_active" in user
    assert "is_superuser" in user and user["is_superuser"] == 0
    assert "hashed_password" in user
    assert "created_at" in user
    client.delete(f"/auth/{user["id"]}")

# Test for existing user signup
def test_signup_existing_user(client: TestClient) -> None:
    signup_data = {
        "username": Settings.SUPER_USERNAME,
        "password": Settings.SUPER_PASSWORD,
    }
    r = client.post("/auth/signup", data=signup_data)
    assert r.status_code == 400

# Test retrieve all users
def test_get_all_users(client: TestClient, super_user_token_header: dict[str, str]) -> None:
    query_params = {
        "offset": 0,
        "limit": 10
    }

    r = client.get("/auth/", params=query_params, headers=super_user_token_header)
    assert r.status_code == 200
    assert r

def test_get_all_users_without_superuser(client: TestClient, normal_user_token_header: dict[str, str]) -> None:
    query_params = {
        "offset": 0,
        "limit": 10
    }

    r = client.get("/auth/", params=query_params, headers=normal_user_token_header)
    assert r.status_code == 401

def test_get_single_user(client: TestClient, super_user_token_header: dict[str, str]) -> None:
    username = Settings.SUPER_USERNAME
    
    r = client.get(f"/auth/{username}", headers=super_user_token_header)

    assert r
    assert r.status_code == 200

def test_get_single_user_doesnt_exist(client: TestClient, super_user_token_header: dict[str, str]) -> None:
    username = "unknown_username"
    
    r = client.get(f"/auth/{username}", headers=super_user_token_header)

    assert r.status_code == 404

def test_get_single_user_without_superuser(client: TestClient, normal_user_token_header: dict[str, str]) -> None:
    username = Settings.SUPER_USERNAME
    
    r = client.get(f"/auth/{username}", headers=normal_user_token_header)

    assert r.status_code == 401





    

