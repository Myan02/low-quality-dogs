from typing import Annotated, Any
from pathlib import Path as DirPath

from fastapi import APIRouter, HTTPException, Path, Depends, status

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
async def UploadDog(form_data: Annotated[models.DogCreate, Depends()], current_user: Annotated[models.UserReturn, Depends(get_current_user)]) -> dict:
    
    try:
        # unpack values
        name, age, image = form_data.model_dump().values()
    
        # insert into db, get the id to concat with the image path
        with db.db_session() as conn:
            img_record = conn.execute(
                queries.InsertDog(), {"name": name, "age": age, "owner_id": current_user.id}
            ).fetchone()
        
        # compress and save video 
        # return: returns a dict if successfull or raise HTTP exception
        await CompressImage(id=img_record[0], name=name, image=image)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong uploading your dog :/ error: {e}")

    return models.DogReturn(**dict(img_record))


"""
# This endpoint will retrieve EVERY DOG!
"""
@router.get("/", response_model=list[models.DogReturn])
def GetAllDogs() -> list[dict]:

    try:
        with db.db_session() as conn:
            rows = conn.execute(
                queries.GetAllDogs(),
            ).fetchall()
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong getting your dogs T_T error: {e}")
    
    return [dict(row) for row in rows]


"""
# This endpoing will retrieve a dog by its id
"""
@router.get("/{id}", response_model=models.DogReturn)
def GetDogById(id: Annotated[int, Path(description="The id of your dog to retrieve", gt=0)]) -> dict:
    
    try:
        with db.db_session() as conn:
            row = conn.execute(
                queries.GetDog(), {"id": id}
            ).fetchone()

            if not row:
                raise HTTPException(status_code=500, detail=f"This dog does not exist :/")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong getting your single dog boo, error: {e}")

    return {
        "id": row[0], 
        "name": row[1], 
        "age": row[2], 
        "created_at": row[3],
        "status": "Dog retrieved successfully!"
    }

"""
# This endpoint will update a dog by id!
"""
@router.patch("/{id}", response_model=models.DogReturn, dependencies=[Depends(get_current_user)])
async def EditDog(
    id: Annotated[int, Path(description="The id of your dog to retrieve", gt=0)], 
    form_data: Annotated[models.DogEdit, Depends()]
) -> dict:
    try:
        # check if the dog to edit exists
        with db.db_session() as conn:
            row = conn.execute(
                queries.GetDog(), {"id": id}
            ).fetchone()
        
        if not row:
            raise HTTPException(status_code=500, detail=f"This dog does not exist :/")

        # unpack values
        name, age, image = form_data.model_dump().values()
        process_status = None

        # rename image 
        if name:
            img_path = DirPath(f"{Directories.LOCAL_IMAGE_DIR}/{row[1]}_{row[0]}.{Settings.IMG_FORMAT.lower()}")
            img_path.rename(DirPath(f"{Directories.LOCAL_IMAGE_DIR}/{name}_{row[0]}.{Settings.IMG_FORMAT.lower()}"))

        # update db with new name or new age
        if name or age:
            with db.db_session() as conn:
                row = conn.execute(
                    queries.UpdateDog(update_name=name, update_age=age), {"id": id, "new_name": name, "new_age": age}
                ).fetchone()
        
        # compress new uploaded image and replace old image
        if image:
            process_status = await CompressImage(id=id, name=row[1], image=image)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"something went wrong: {e}")
    
    return {
        "id": row[0], 
        "name": row[1], 
        "age": row[2], 
        "created_at": row[3],
        "status": f"Dog edited successfully, {process_status["status"] if process_status else "no new images uploaded!"}"
    }
    

"""
# This endpoint will delete a dog from the db and directory through its id
"""
@router.delete("/{id}", response_model=models.DogReturn, dependencies=[Depends(get_current_user)])
def DeleteDog(id: Annotated[int, Path(description="The id of the dog you want to delete :(", gt=0)]) -> dict:
    
    try:
        # delete from db, return the deleted dogs id
        with db.db_session() as conn:
            row = conn.execute(
                queries.DeleteDog(), {"id": id}
            ).fetchone()
                
        # get the dog image path given the deleted id
        img_path = DirPath(f"{Directories.LOCAL_IMAGE_DIR}/{row[1]}_{id}.{Settings.IMG_FORMAT.lower()}")

        # raise exception if the image doesnt exist somehow
        if not img_path.exists():
            raise HTTPException(status_code=400, detail="The file you are trying to delete does not exist :3")
        
        # delete image
        img_path.unlink()
    
    except TypeError:
        raise HTTPException(status_code=400, detail="The file you are trying to delete does not exist :3")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong deleting your dog omg, error: {e}")
    
    return {
        "id": row[0], 
        "name": row[1], 
        "age": row[2], 
        "created_at": row[3],
        "status": "Dog deleted successfully!"
    }
