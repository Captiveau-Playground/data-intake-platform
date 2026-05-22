from dataclasses import dataclass

import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from src.core.config import DATABASE_URL, SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@dataclass
class User:
    id: int
    username: str
    role: str


def get_db():
    """Get a database connection."""
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        conn.close()


def get_user_from_token(token: str = Depends(oauth2_scheme)) -> User:
    """Decode JWT and return current user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT id, username, role FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user is None:
        raise credentials_exception
    return User(id=user["id"], username=user["username"], role=user["role"])


def require_admin(current_user: User = Depends(get_user_from_token)) -> User:
    """Only administrators."""
    if current_user.role != "administrator":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Administrator access required")
    return current_user


def require_role(allowed_roles: list):
    """Flexible role checker."""
    def role_checker(current_user: User = Depends(get_user_from_token)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' tidak memiliki akses. Required: {allowed_roles}"
            )
        return current_user
    return role_checker
