from typing import Optional

from fastapi import APIRouter, Depends
import psycopg2
from psycopg2.extras import RealDictCursor

from src.core.config import DATABASE_URL
from src.core.deps import User, require_role

router = APIRouter(prefix="/comments", tags=["comments"])


@router.get("/")
async def get_comments(
    post_id: Optional[int] = None,
    username: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(require_role(["administrator"]))
):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # Count total
    count_query = "SELECT COUNT(*) as total FROM comments WHERE 1=1"
    count_params = []
    if post_id:
        count_query += " AND post_id = %s"
        count_params.append(post_id)
    if username:
        count_query += " AND username = %s"
        count_params.append(username)
    cursor.execute(count_query, count_params)
    total = cursor.fetchone()["total"]

    # Fetch paginated data
    query = "SELECT * FROM comments WHERE 1=1"
    params = []
    if post_id:
        query += " AND post_id = %s"
        params.append(post_id)
    if username:
        query += " AND username = %s"
        params.append(username)
    query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    cursor.execute(query, params)
    comments = cursor.fetchall()
    cursor.close()
    conn.close()
    return {"data": [dict(c) for c in comments], "total": total, "limit": limit, "offset": offset}
