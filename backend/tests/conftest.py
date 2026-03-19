from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from tests.utils import auth
from app.config import Settings
from main import app

# Provide test client and inject when calling pytest
@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def normal_user_token_header(client: TestClient) -> dict[str, str]:
    return auth.user_authenticate_headers(
        client=client, username="test_username", password="test_password"
    )

@pytest.fixture(scope="module")
def super_user_token_header(client: TestClient) -> dict[str, str]:
    return auth.user_authenticate_headers(
        client=client, username=Settings.SUPER_USERNAME, password=Settings.SUPER_PASSWORD
    )