"""
# Dog Queries
"""
def InsertDog() -> str:
    query = """
        INSERT INTO dogs (name, age, owner_id)
        VALUES (:name, :age, :owner_id)
        RETURNING id, name, age, owner_id, created_at;
    """
    
    return query

def GetAllDogs() -> str:
    query = """
        SELECT *
        FROM dogs
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset;
    """

    return query

def GetDog() -> str:
    query = """
        SELECT *
        FROM dogs
        WHERE id = :id;
    """

    return query

def UpdateDog(update_name: str | None = None, update_age: str | None = None) -> str:
    query = ""
    
    if update_name and update_age:
        query = """
            UPDATE dogs
            SET name = :new_name, age = :new_age
            WHERE id = :id
            RETURNING id, name, age, owner_id, created_at;
        """

    elif update_name:
        query = """
            UPDATE dogs
            SET name = :new_name
            WHERE id = :id
            RETURNING id, name, age, owner_id, created_at;
        """

    elif update_age:
        query = """
            UPDATE dogs
            SET age = :new_age
            WHERE id = :id
            RETURNING id, name, age, owner_id, created_at;
        """
    
    return query

def DeleteDog() -> str:
    query = """
        DELETE FROM dogs
        WHERE id = :id
        RETURNING id, name, age, owner_id, created_at;
    """
    
    return query


"""
# User Queries
"""
def CreateUser(is_superuser: bool = False) -> str:
    query = ""

    if is_superuser:
        query = """
            INSERT INTO Users(username, hashed_password, is_superuser)
            VALUES (:username, :hashed_password, :is_superuser)
            RETURNING id, username, hashed_password, is_active, is_superuser, created_at;
        """
    else:
        query = """
            INSERT INTO Users(username, hashed_password)
            VALUES (:username, :hashed_password)
            RETURNING id, username, hashed_password, is_active, is_superuser, created_at;
        """

    return query

def GetUserByUsername() -> str:
    query = """
        SELECT *
        FROM Users
        WHERE username = :username;
    """

    return query

    