from fastapi import APIRouter
from app.db import db

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
def CheckHealth() -> dict:
    with db.db_session() as conn:
        check = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table';"
        ).fetchall()
    
    return {
        "Server Status": "OK",
        "Check": [dict(table) for table in check]
    }
    
