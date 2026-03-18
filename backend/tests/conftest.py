from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from main import app

# Provide test client and inject when calling pytest
@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c