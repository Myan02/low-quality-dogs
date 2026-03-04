"""
# Dog Queries
"""
def InsertDog() -> str:
    return (
        """
            INSERT INTO dogs (name, age)
            VALUES (:name, :age)
            RETURNING id, name, age, created_at;
        """
    )

def GetAllDogs() -> str:
    return (
        """
            SELECT *
            FROM dogs;
        """
    )

def GetDog() -> str:
    return (
        """
            SELECT *
            FROM dogs
            WHERE id = :id
            ORDER BY name ASC;
        """
    )

def UpdateDog(update_name: str | None = None, update_age: str | None = None) -> str:
    if update_name and update_age:
        return (
            """
                UPDATE dogs
                SET name = :new_name, age = :new_age
                WHERE id = :id
                RETURNING id, name, age, created_at;
            """
        )

    if update_name:
        return (
            """
                UPDATE dogs
                SET name = :new_name
                WHERE id = :id
                RETURNING id, name, age, created_at;
            """
        )

    if update_age:
        return (
            """
                UPDATE dogs
                SET age = :new_age
                WHERE id = :id
                RETURNING id, name, age, created_at;
            """
        )

def DeleteDog() -> str:
    return (
        """
            DELETE FROM dogs
            WHERE id = :id
            RETURNING id, name, age, created_at;
        """
    )


"""
# User Queries
"""
def CreateUser() -> str:
    return (
        """
            INSERT INTO Users(username, hashed_password)
            VALUES (:username, :hashed_password)
            RETURNING id, username, hashed_password, is_active, is_superuser, created_at;
        """
    )

def GetUserByUsername() -> str:
    return (
        """
            SELECT *
            FROM Users
            WHERE username = :username;
        """
    )