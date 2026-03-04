import sqlite3
from contextlib import contextmanager

from app.config import Directories

"""
# Connect to the database
"""
def GetConnection() -> sqlite3.Connection:
    conn = sqlite3.connect(f"{Directories.DB_DIR}/{Directories.DB_NAME}")
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

"""
# Database session manager
"""
@contextmanager
def db_session():
    conn = GetConnection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
