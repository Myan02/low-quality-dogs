import uvicorn
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles

from app.api import dogs, health, auth
from app.config import Settings, Directories
from app.db import db

"""
# Initialize FastApi app
"""
def InitApp() -> FastAPI:

    # create and initialize dogs directory
    if not Directories.LOCAL_IMAGE_DIR.exists():
        Directories.LOCAL_IMAGE_DIR.mkdir(parents=True)
    
    # create app instance
    app = FastAPI(
        title=Settings.APP_TITLE
    )

    app.mount(
        path=str(Directories.IMAGE_PATH), 
        app=StaticFiles(directory=str(Directories.LOCAL_IMAGE_DIR)), 
        name="images")

    # initialize db and create tables
    with db.db_session() as conn:
        conn.executescript(open(Directories.DB_SCHEMA).read())

    # initialize endpoint routers
    app.include_router(dogs.router)
    app.include_router(health.router)
    app.include_router(auth.router)
    
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
        reload=Settings.APP_RELOAD
    )
