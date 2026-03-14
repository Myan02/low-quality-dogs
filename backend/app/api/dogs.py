from typing import Annotated, Any
from pathlib import Path as DirPath

from fastapi import APIRouter, HTTPException, Path, Depends, status, Query, Form, UploadFile, File

from app.api.auth import get_current_user
from app.db import db, queries
from app.config import Settings, Directories
from app.models import models
from app.utils import CompressImage

router = APIRouter(prefix="/dogs", tags=["dogs"])

"""
# This endpoint does 3 things:
#   1. compresses an image (hopefully of a dog)
#   2. inserts information about the dog into the db
#   3. uploads the dog into the static/images directory
"""
@router.post("/", response_model=models.DogReturn, status_code=status.HTTP_201_CREATED)
async def UploadDog(
    current_user: Annotated[models.UserReturn, Depends(get_current_user)],
    name: Annotated[str, Form(title="Dog Name", description="The name of your dog.", min_length=1, max_length=64)],
    age: Annotated[int, Form(title="Dog Age", description="Your dog's age.", ge=0, le=99)],
    description: Annotated[str, Form(title="Dog Description", description="A short description of your dog.", max_length=250)],
    image: Annotated[UploadFile, File(title="Dog Image", description="The file to upload of your dog.")],
) -> Any:
    
    # Raise exception if incorrect file type
    if DirPath(image.filename).suffix not in Settings.ACCEPTABLE_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use one of the supported file types."
        )
    
    try:    
        # insert into db, get the id to concat with the image path
        with db.db_session() as conn:
            img_record = conn.execute(
                queries.InsertDog(), {
                    "name": name, 
                    "age": age, 
                    "description": description,
                    "owner_id": current_user.id,
                    "owner_username": current_user.username
                }
            ).fetchone()
        
        dog = models.DogReturn(**dict(img_record))

        # compress and save video 
        # returns a dict if successfull or raise HTTP exception
        await CompressImage(id=dog.id, name=dog.name, image=image)

        # update the db entry with the proper image url
        with db.db_session() as conn:
            updated_record = conn.execute(
                queries.UpdateImageUrl(), {
                    "image_url": f"{Directories.LOCAL_IMAGE_DIR}/{dog.name}_{dog.id}.{Settings.IMG_FORMAT.lower()}",
                    "id": dog.id,
                }
            ).fetchone()

        dog.image_url = dict(updated_record)["image_url"]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Something went wrong uploading your dog, error: {e}"
        )

    return dog


"""
# This endpoint will retrieve EVERY DOG!
"""
@router.get("/", response_model=list[models.DogReturn])
def GetAllDogs(
    offset: Annotated[int, Query(description="Number of rows to skip", ge=0)],
    limit: Annotated[int, Query(description="Number of rows to show", ge=1, le=100)] = 20
) -> list[dict]:
    try:
        with db.db_session() as conn:
            rows = conn.execute(
                queries.GetAllDogs(), {
                    "offset": offset * limit,
                    "limit": limit
                }
            ).fetchall()
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Something went wrong on our end, error: {e}"
        )
    
    return [dict(row) for row in rows]


"""
# This endpoing will retrieve all dogs with the same name
"""
@router.get("/name/{name}", response_model=list[models.DogReturn])
def GetDogByName(name: Annotated[str, Path(description="The name of the dog to retrieve")]) -> Any:
    try:
        with db.db_session() as conn:
            rows = conn.execute(
                queries.GetDogByName(), {"name": name}
            ).fetchall()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Something went wrong on our end, error: {e}"
        )
    
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"No dog's have this name."
        )

    return [models.DogReturn(**dict(row)) for row in rows]

"""
# This endpoing will retrieve a dog by its id
"""
@router.get("/id/{id}", response_model=models.DogReturn)
def GetDogById(id: Annotated[int, Path(description="The id of your dog to retrieve", gt=0)]) -> Any:
    try:
        with db.db_session() as conn:
            row = conn.execute(
                queries.GetDogByID(), {"id": id}
            ).fetchone()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Something went wrong on our end, error: {e}"
        )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"This dog does not exist"
        )

    return models.DogReturn(**dict(row))


"""
# This endpoint will update a dog by id!
"""
@router.patch("/{id}", response_model=models.DogReturn)
async def EditDog(
    current_user: Annotated[models.UserReturn, Depends(get_current_user)],
    id: Annotated[int, Path(description="The id of your dog to retrieve", gt=0)], 
    name: Annotated[str | None, Form(title="Dog Name Edit", description="New name for your dog.", min_length=1, max_length=128)] = None,
    age: Annotated[int | None, Form(title="Dog Age Edit", description="New age for your dog.", ge=0, le=99)] = None,
    description: Annotated[str | None, Form(title="Dog Description Edit", description="New description for your dog.", max_length=250)] = None,
    image: Annotated[UploadFile | None, File(title="Dog Image Edit", description="New image for your dog.")] = None,
) -> Any:
    try:
        # check if the dog exists
        with db.db_session() as conn:
            row = conn.execute(
                queries.GetDogByID(), {"id": id}
            ).fetchone()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Something went wrong on our end, error: {e}"
        )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"This dog does not exist."
        )

    dog = models.DogReturn(**dict(row))

    # authenticate user to edit their images
    if not current_user.is_superuser and dog.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="You are not authorized to edit this image as it is not yours."
        )

    # rename image 
    if name:
        img_path = DirPath(f"{Directories.LOCAL_IMAGE_DIR}/{dog.name}_{dog.id}.{Settings.IMG_FORMAT.lower()}")
        img_path.rename(DirPath(f"{Directories.LOCAL_IMAGE_DIR}/{name}_{dog.id}.{Settings.IMG_FORMAT.lower()}"))

        # update the db entry with the proper image url
        with db.db_session() as conn:
            updated_record = conn.execute(
                queries.UpdateImageUrl(), {
                    "image_url": f"{Directories.LOCAL_IMAGE_DIR}/{name}_{dog.id}.{Settings.IMG_FORMAT.lower()}",
                    "id": id,
                }
            ).fetchone()

        dog.image_url = dict(updated_record)["image_url"]

    try:
        # update db with new name or new age
        if name or age or description:
            with db.db_session() as conn:
                row = conn.execute(
                    queries.UpdateDog(
                        name_flag=bool(name), 
                        age_flag=bool(age),
                        description_flag=bool(description)
                    ), {
                        "id": id, 
                        "name": name, 
                        "age": age,
                        "description": description,
                    }
                ).fetchone()
        
        dog = models.DogReturn(**dict(row))

        # compress new uploaded image and replace old image
        if image:
            await CompressImage(id=id, name=dog.name, image=image)

    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Something went wrong on our end, error: {e}"
        )

    return dog
    

"""
# This endpoint will delete a dog from the db and directory through its id
"""
@router.delete("/{id}", response_model=models.DogReturn)
def DeleteDog(
    id: Annotated[int, Path(description="The id of the dog you want to delete", gt=0)],
    current_user: Annotated[models.UserReturn, Depends(get_current_user)]
) -> Any:
    
    try:
        # check if the dog exists
        with db.db_session() as conn:
            row = conn.execute(
                queries.GetDogByID(), {"id": id}
            ).fetchone()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Something went wrong on our end, error: {e}"
        )
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"This dog does not exist."
        )
    
    dog = models.DogReturn(**dict(row))

    # authenticate user to delete their images
    if not current_user.is_superuser and dog.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="You are not authorized to delete this image as it is not yours."
        )
            
    try:
        # delete from db, return the deleted dogs id
        with db.db_session() as conn:
            row = conn.execute(
                queries.DeleteDog(), {"id": id}
            ).fetchone()
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Something went wrong on our end, error: {e}"
        )
    
    # get the dog image path given the deleted id
    img_path = DirPath(f"{Directories.LOCAL_IMAGE_DIR}/{dog.name}_{id}.{Settings.IMG_FORMAT.lower()}")

    # raise exception if the image doesnt exist somehow
    if not img_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="The file you are trying to delete does not exist."
        )
    
    # delete image
    img_path.unlink()

    return models.DogReturn(**dict(row))
