from typing import Annotated
from datetime import datetime

from fastapi import Form, UploadFile
from pydantic import BaseModel, Field

"""
# DOG MODELS
"""
class DogBase(BaseModel):    
    name: Annotated[str, Field(title="Dog Name", description="The name of your dog.", min_length=1, max_length=128)]
    age: Annotated[int, Field(title="Dog Age", description="Your dog's age.", ge=0, le=99)]
    description: Annotated[str, Field(title="Dog Description", description="A short description of your dog.", max_length=250)]

# Creating a dog
class DogCreate(DogBase):
    image: Annotated[UploadFile, Field(title="Dog Image File", description="Image file for your dog")]

class DogEdit(DogBase):
    name: Annotated[str | None, Field(title="Dog Name Edit", description="The new name of your dog", min_length=1, max_length=128)] = None
    age: Annotated[int | None, Field(title="Dog Age Edit", description="The new age of your dog", ge=0, lt=50)] = None
    description: Annotated[str | None, Field(title="Dog Description Edit", description="The new description of your dog", max_length=250)] = None
    image: Annotated[UploadFile | None, Field(title="Dog Image File Edit", description="The new image file for your dog")] = None

# Returning a dog
class DogReturn(DogBase):
    id: Annotated[int, Field(title="Dog ID", description="ID of the dog image")]
    image_url: Annotated[str, Field(title="Image URL", description="Location of the image")]
    owner_id: Annotated[int, Field(title="Owner ID", description="Id of the dog's owner")]
    owner_username: Annotated[str, Field(title="Owner Username", description="The name of the dog's owner")]
    created_at: Annotated[datetime, Field(title="Timestamp of image upload")]


"""
# USER MODELS
"""
class UserBase(BaseModel):
    username: Annotated[str, Field(title="Username", description="Username to identify user", min_length=1, max_length=64)]
    
# Creating a user
class UserCreate(UserBase):
    password: Annotated[str, Field(title="User password", description="User password", min_length=8, max_length=128)]

class SuperUserCreate(UserBase):
    password: Annotated[str, Field(title="Superuser password", description="Superuser password", min_length=8, max_length=128)]
    is_active: Annotated[bool, Field(title="Superuser activity", description="Status of superuser account")] = True
    is_superuser: Annotated[bool, Field(title="Admin Privelege", description="User admin privelege")] = False

# Returning user info
class UserReturn(UserBase):
    id: Annotated[int, Field(title="User ID", description="ID of the user")]
    is_active: Annotated[bool, Field(title="User activity", description="Status of user account")] = True
    is_superuser: Annotated[bool, Field(title="Admin Privelege", description="User admin privelege")] = False
    hashed_password: Annotated[str, Field(title="User hashed password", description="Hashed password for user", min_length=8, max_length=128)]
    created_at: Annotated[datetime, Field(title="Timestamp of user account creation")]


"""
# SECURITY MODELS
"""
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str | None = None







