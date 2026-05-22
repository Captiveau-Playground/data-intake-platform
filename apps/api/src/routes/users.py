from fastapi import APIRouter, Depends, HTTPException, status, Form
import psycopg2
from psycopg2.extras import RealDictCursor

from src.core.config import DATABASE_URL
from src.core.security import hash_password
from src.core.deps import User, require_admin

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/")
async def get_users(current_user: User = Depends(require_admin)):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT id, username, role, created_at FROM users ORDER BY created_at DESC")
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(u) for u in users]


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(
    username: str = Form(...),
    password: str = Form(...),
    role: str = Form("datacollector"),
    current_user: User = Depends(require_admin)
):
    if role not in ("administrator", "datacollector"):
        raise HTTPException(status_code=400, detail="Role must be 'administrator' or 'datacollector'")

    password_hash = hash_password(password)

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s) RETURNING id, username, role, created_at",
            (username, password_hash, role)
        )
        new_user = cursor.fetchone()
        conn.commit()
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=409, detail="Username already exists")
    finally:
        cursor.close()
        conn.close()

    return dict(new_user)


@router.delete("/{user_id}")
async def delete_user(user_id: int, current_user: User = Depends(require_admin)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("DELETE FROM users WHERE id = %s RETURNING id", (user_id,))
    deleted = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()

    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted"}


@router.patch("/{user_id}/role")
async def update_user_role(user_id: int, role: str = Form(...), current_user: User = Depends(require_admin)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    if role not in ("administrator", "datacollector"):
        raise HTTPException(status_code=400, detail="Role must be 'administrator' or 'datacollector'")

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("UPDATE users SET role = %s WHERE id = %s RETURNING id, username, role, created_at", (role, user_id))
    updated = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()

    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(updated)
