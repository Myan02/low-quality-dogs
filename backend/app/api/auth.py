from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, HTTPException, Depends, status, Form, Path, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from jwt.exceptions import InvalidTokenError

from app.db import db, queries
from app.config import Settings
from app.models import models
from app.utils import get_password_hash, create_access_token, authenticate_user, credentials_exception

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

"""
# Authentication dependency, decodes the jwt token 
# provided by the client and makes sure the signature is correct
"""
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> models.UserReturn:

    try:
        # decode jwt token and check username 
        payload = jwt.decode(token, Settings.SECRET_KEY, algorithms=[Settings.ALGORITHM])
        username = payload.get("sub")

        if username is None:
            raise credentials_exception()
        
        token_data = models.TokenPayload(sub=username)

    except InvalidTokenError:
        raise credentials_exception()

    try:
        # use token data to check db if user is correct
        with db.db_session() as conn:
            user = conn.execute(
                queries.GetUserByUsername(), {"username": token_data.sub}
            ).fetchone()

        if user is None:
            raise credentials_exception()
        
    except Exception as e:
        print(f"error: {e}")
        raise credentials_exception()

    return models.UserReturn(**user)


"""
# This endpoint logs the user in and creates
# a JWT access token for them
"""
@router.post("/login")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> models.Token:

    # Make sure user has the correct username and password
    user = authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # create an access token and return it to the user
    access_token_expires = timedelta(minutes=Settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    access_token = create_access_token(
        payload={"sub": user["username"]},
        expires_delta=access_token_expires
    )

    return models.Token(access_token=access_token, token_type="bearer")


"""
# This endpoint will check if a user exists, and if they don't it'll register
# a new user to the db
"""
@router.post("/signup", response_model=models.UserReturn)
def register_user(user_data: Annotated[models.UserCreate, Form()]) -> Any:
    
    try:
        # Check db if user exists
        with db.db_session() as conn:
            user = conn.execute(
                queries.GetUserByUsernameDistinct(), {"username": user_data.username}
            ).fetchone()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Something went wrong on our end, error: {e}"
        )
    
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists."
        )

    # hash password
    hashed_password = get_password_hash(user_data.password)

    try:
        # commit credentials to db with hashed password
        with db.db_session() as conn:
            new_user = conn.execute(
                queries.CreateUser(), {"username": user_data.username, "hashed_password": hashed_password}
            ).fetchone()
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Something went wrong on our end, error: {e}"
        )

    return models.UserReturn(**dict(new_user))

"""
# This endpoint returns the current logged in user
"""
@router.get("/me", response_model=models.UserReturn)
async def GetMe(current_user: Annotated[models.UserReturn, Depends(get_current_user)]) -> Any:
    return current_user

"""
# This endpoing retrieves all users
# Must be superuser
# """
@router.get("/", response_model=list[models.UserReturnBasic])
async def GetAllUsers(
    current_user: Annotated[models.UserReturn, Depends(get_current_user)],
    offset: Annotated[int, Query(title="Page Offser", description="Number of pages to show", ge=0)],
    limit: Annotated[int, Query(title="User Limit", description="Put a limit on number of users to return", ge=1, le=100)] = 10,
) -> Any:
    # Check if user logged in is a super user
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized request, permission denied."
        )
    
    try:
        with db.db_session() as conn:
            users = conn.execute(
                queries.GetAllUsers(), {
                    "offset": offset * limit,
                    "limit": limit,
                }
            ).fetchall()
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Something went wrong on our end, error: {e}"
        )
    
    return [models.UserReturnBasic(**dict(user)) for user in users]

"""
# This endpoint will retrieve users by matching name
"""
@router.get("/{username}", response_model=list[models.UserReturnBasic])
async def GetUserByUsername(
    current_user: Annotated[models.UserReturn, Depends(get_current_user)],
    username: Annotated[str, Path(title="Fetch Users by name", description="Returns list of users by matching username")]
) -> Any:
    # Check if user logged in is a super user
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized request, permission denied."
        )
    
    try:
        with db.db_session() as conn:
            users = conn.execute(
                queries.GetUserByUsername(), {"username": username}
            ).fetchall()
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Something went wrong on our end, error: {e}"
        )

    if not users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This user does not exist."
        )
    
    return [models.UserReturnBasic(**dict(user)) for user in users]
    

"""
# This endpoint will delete a user
# Can only be used by a superuser
"""
@router.delete("/{user_id}", response_model=models.UserReturn)
async def DeleteUser(
    user_id: Annotated[int, Path(title="User Delete", description="The user id to delete", gt=0)],
    current_user: Annotated[models.UserReturn, Depends(get_current_user)]
) -> Any:
    
    # Cannot delete other accounts without being admin
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized request, permission denied."
        )
    
    # Search user to make sure they exist
    try:
        with db.db_session() as conn:
            queried_user = conn.execute(
                queries.GetUserById(), {"id": user_id}
            ).fetchone()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Something went wrong on our end, error: {e}"
        )
    
    # Check if user exists
    if not queried_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user you are trying to delete does not exist."
        )
    
    user = models.UserReturn(**dict(queried_user))

    # Check if you are trying to delete your own account
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own admin account."
        )
    
    # Delete account
    try:
        with db.db_session() as conn:
            conn.execute(
                queries.DeleteUserById(), {"id": user.id}
            ).fetchone()
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Something went wrong on our end, error: {e}"
        )
    
    return user
    





