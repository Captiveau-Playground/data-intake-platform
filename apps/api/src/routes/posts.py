from typing import Optional, Any

from fastapi import APIRouter, Depends, HTTPException
import psycopg2
from psycopg2.extras import RealDictCursor

from src.core.config import DATABASE_URL
from src.core.deps import User, require_role

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("/")
async def get_posts(
    club_id: Optional[int] = None,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(require_role(["administrator"]))
):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    if club_id:
        cursor.execute("SELECT * FROM posts WHERE club_id = %s ORDER BY created_at DESC LIMIT %s OFFSET %s", (club_id, limit, offset))
    else:
        cursor.execute("SELECT * FROM posts ORDER BY created_at DESC LIMIT %s OFFSET %s", (limit, offset))

    posts = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(post) for post in posts]


@router.post("/")
async def create_post(post: Any, current_user: User = Depends(require_role(["administrator"]))):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        "INSERT INTO posts (club_id, post_type, caption, post_url, post_date, source_filename) VALUES (%s, %s, %s, %s, %s, %s) RETURNING *",
        (post.club_id, post.post_type, post.caption, post.post_url, post.post_date, post.source_filename)
    )
    new_post = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return dict(new_post)
