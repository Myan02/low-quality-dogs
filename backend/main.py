from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient
from pathlib import Path

from app.api import dogs, health, auth
from app.config import Settings, Directories
from app.db import db, queries
from app.utils import get_password_hash

import uvicorn

"""
# Initialize FastApi app
"""
def InitApp() -> FastAPI:

    # create and initialize dogs directory
    if not Directories.LOCAL_IMAGE_DIR.exists():
        Directories.LOCAL_IMAGE_DIR.mkdir(parents=True, mode=0o755)
    
    # create db if it doesn't exist
    DB_PATH = Path(Directories.DB_DIR/Directories.DB_NAME)

    if not Directories.DB_DIR.exists():
        Directories.DB_DIR.mkdir(mode=0o755)
        DB_PATH.touch(mode=0o755)
    
    # create app instance
    app = FastAPI(
        title=Settings.APP_TITLE,
        root_path=f"/{Settings.API_VERSION}"
    )

    app.mount(
        path=str(Directories.IMAGE_PATH), 
        app=StaticFiles(directory=str(Directories.LOCAL_IMAGE_DIR)), 
        name="images"
    )

    # initialize db and create tables
    with db.db_session() as conn:
        conn.executescript(open(Directories.DB_SCHEMA).read())
    
    # initialize superuser if they don't exist
    with db.db_session() as conn:
        user = conn.execute(
            queries.GetUserByUsername(), {"username": Settings.SUPER_USERNAME}
        ).fetchone()
    
    if not user:
        with db.db_session() as conn:
            conn.execute(
                queries.CreateUser(is_superuser=True), {
                    "username": Settings.SUPER_USERNAME,
                    "hashed_password": get_password_hash(Settings.SUPER_PASSWORD),
                    "is_superuser": 1
                }
            )

    # initialize endpoint routers
    app.include_router(dogs.router)
    app.include_router(health.router)
    app.include_router(auth.router)

    # set all CORS enabled origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=Settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    return app

"""
# App singleton
"""
app = InitApp()

"""
# Start server
"""
if __name__ == "__main__":
    uvicorn.run(
        app=Settings.APP,
        host=Settings.HOST,
        port=Settings.PORT,
        workers=Settings.WORKERS,
        reload=Settings.APP_RELOAD,
    )
