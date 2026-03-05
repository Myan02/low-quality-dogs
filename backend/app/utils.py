from datetime import datetime, timedelta, timezone

from fastapi import UploadFile, HTTPException, status
from PIL import Image
from io import BytesIO
from pathlib import Path as DirPath
from pwdlib import PasswordHash
import jwt

from app.config import Settings, Directories
from app.db import db, queries

"""
# Compress and save image to mounted directory
"""
async def CompressImage(id: int, name: str, image: UploadFile) -> dict:

    try:
        img_path = DirPath(f"{Directories.LOCAL_IMAGE_DIR}/{name}_{id}.{Settings.IMG_FORMAT.lower()}")

        # compress image and save to directory at lower quality
        image_bytes = await image.read()
        with Image.open(BytesIO(image_bytes)) as img:
            img.thumbnail((Settings.IMG_SIZE, Settings.IMG_SIZE))
            img.save(
                str(img_path),
                format=Settings.IMG_FORMAT,
                quality=50,
                optimize=True
            )
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Something went wrong processing your image, error code: {e}")
    
    return {"status": "Image processed successfully!"}

"""
# Security
"""
def verify_password(plain_password, hashed_password) -> str:
    return PasswordHash.recommended().verify(plain_password, hashed_password)

def get_password_hash(password):
    return PasswordHash.recommended().hash(password)

def create_access_token(payload: dict, expires_delta: timedelta | None = None):
    to_encode = payload.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, Settings.SECRET_KEY, algorithm=Settings.ALGORITHM)
    return encoded_jwt

def authenticate_user(username: str, password: str):
    
    with db.db_session() as conn:
        user = conn.execute(
            queries.GetUserByUsername(), {"username": username}
        ).fetchone()    

    if not user:
        dummy_hash = get_password_hash(Settings.DUMMY_KEY)
        verify_password(password, dummy_hash)
        return False
    
    if not verify_password(password, user["hashed_password"]):
        return False
    
    return user


"""
# Exceptions
"""
def credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
