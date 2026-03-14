"""
# Dog Queries
"""
def InsertDog() -> str:
    query = """
        INSERT INTO dogs (name, age, description, owner_id, owner_username)
        VALUES (:name, :age, :description, :owner_id, :owner_username)
        RETURNING id, name, age, description, image_url, owner_id, owner_username, created_at;
    """
    
    return query

def UpdateImageUrl() -> str:
    query = """
        UPDATE dogs
        SET image_url = :image_url
        WHERE id = :id
        RETURNING image_url;
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

def GetDogByID() -> str:
    query = """
        SELECT *
        FROM dogs
        WHERE id = :id;
    """

    return query

def GetDogByName() -> str:
    query = """
        SELECT *
        FROM dogs
        WHERE name LIKE '%' || :name || '%';
    """

    return query

def UpdateDog(name_flag: bool = False, age_flag: bool = False, description_flag: bool = False) -> str:
    fields = []

    if name_flag:
        fields.append("name = :name")
    if age_flag:
        fields.append("age = :age")
    if description_flag:
        fields.append("description = :description")
    
    query = f"""
        UPDATE dogs
        SET {', '.join(fields)}
        WHERE id = :id
        RETURNING id, name, age, description, image_url, owner_id, owner_username, created_at;
    """

    return query


def DeleteDog() -> str:
    query = """
        DELETE FROM dogs
        WHERE id = :id
        RETURNING id, name, age, description, image_url, owner_id, owner_username, created_at;
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

def GetUserById() -> str:
    query = """
        SELECT *
        FROM Users
        WHERE id = :id;
    """

    return query

def GetUserByUsername() -> str:
    query = """
        SELECT *
        FROM Users
        WHERE username = :username;
    """

    return query

def DeleteUserById() -> str:
    query = """
        DELETE FROM Users
        WHERE id = :id
        RETURNING id, username, hashed_password, is_active, is_superuser, created_at;
    """

    return query

    