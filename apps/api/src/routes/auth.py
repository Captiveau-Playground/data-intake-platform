from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from psycopg2.extras import RealDictCursor
import psycopg2

from src.core.config import DATABASE_URL, ACCESS_TOKEN_EXPIRE_MINUTES
from src.core.security import create_access_token, verify_password
from src.core.deps import get_user_from_token, User
from src.models.auth import Token

router = APIRouter(tags=["auth"])


@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT id, username, password_hash, role FROM users WHERE username = %s", (form_data.username,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(access_token=access_token, token_type="bearer")


@router.get("/users/me")
async def read_users_me(current_user: User = Depends(get_user_from_token)):
    return {"id": current_user.id, "username": current_user.username, "role": current_user.role}


@router.get("/users/me/permissions")
async def get_my_permissions(current_user: User = Depends(get_user_from_token)):
    permissions = {
        "administrator": [
            "dashboard.view", "upload.create", "posts.view", "comments.view",
            "jobs.view", "clubs.view", "clubs.create", "clubs.edit", "clubs.delete",
            "users.view", "users.create", "users.edit", "users.delete"
        ],
        "datacollector": [
            "dashboard.view", "upload.create", "jobs.view", "clubs.view"
        ]
    }
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "permissions": permissions.get(current_user.role, [])
    }
