import os
from dotenv import load_dotenv
from pathlib import Path

"""
# Load environment variables
"""
load_dotenv()


"""
# Project settings 
"""
class Settings():
    APP = os.getenv("APP")
    APP_TITLE = os.getenv("APP_TITLE")
    PORT = int(os.getenv("PORT"))
    HOST = os.getenv("HOST")
    WORKERS = int(os.getenv("WORKERS"))
    APP_RELOAD = bool(os.getenv("APP_RELOAD"))

    BACKEND_CORS_ORIGINS = os.getenv("BACKEND_CORS_ORIGINS").split(",")
    SECRET_KEY = os.getenv("SECRET_KEY")
    DUMMY_KEY = os.getenv("DUMMY_KEY")
    ALGORITHM = os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

    IMG_SIZE = int(os.getenv("IMG_SIZE"))
    IMG_FORMAT = os.getenv("IMG_FORMAT")
    ACCEPTABLE_FORMATS = set(os.getenv("ACCEPTABLE_FORMATS").split(","))

    SUPER_USERNAME = os.getenv("SUPER_USERNAME")
    SUPER_PASSWORD = os.getenv("SUPER_PASSWORD")


"""
# App directories
"""
class Directories():
    IMAGE_PATH = Path(os.getenv("IMAGE_PATH"))
    LOCAL_IMAGE_DIR = Path(os.getenv("LOCAL_IMAGE_DIR"))
    DB_NAME = os.getenv("DB_NAME")
    DB_DIR = Path(os.getenv("DB_DIR"))
    DB_SCHEMA = Path(os.getenv("DB_SCHEMA"))


