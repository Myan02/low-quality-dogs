from fastapi.testclient import TestClient

from tests.utils import utils
from app.db import db, queries

def user_authenticate_headers(
    *,
    client: TestClient,
    username: str,
    password: str
) -> dict[str, str]:
    data = {"username": username, "password": password}

    with db.db_session() as conn:
        user = conn.execute(
            queries.GetUserByUsername(), {"username": username}
        ).fetchone()

    if not user:
        with db.db_session() as conn:
            conn.execute(
                queries.CreateUser(), {
                    "username": username,
                    "hashed_password": utils.get_password_hash_test(password),
                    "is_superuser": 0
                }
            )

    r = client.post("/auth/login", data=data)
    res = r.json()
    auth_token = res["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    return headers

