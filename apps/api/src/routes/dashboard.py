from fastapi import APIRouter, Depends
import psycopg2
from psycopg2.extras import RealDictCursor

from src.core.config import DATABASE_URL
from src.core.deps import User, require_role

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats(current_user: User = Depends(require_role(["administrator", "datacollector"]))):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("SELECT COUNT(*) as total_comments FROM comments")
    total_comments = cursor.fetchone()["total_comments"]

    cursor.execute("SELECT COUNT(*) as total_posts FROM posts")
    total_posts = cursor.fetchone()["total_posts"]

    cursor.execute("SELECT COUNT(*) as total_uploads FROM ingestion_jobs")
    total_uploads = cursor.fetchone()["total_uploads"]

    cursor.execute("SELECT SUM(duplicate_rows) as total_duplicates FROM ingestion_jobs")
    total_duplicates = cursor.fetchone()["total_duplicates"] or 0

    cursor.execute("SELECT * FROM ingestion_jobs ORDER BY created_at DESC LIMIT 1")
    latest_job = cursor.fetchone()

    cursor.close()
    conn.close()

    return {
        "total_comments": total_comments,
        "total_posts": total_posts,
        "total_uploads": total_uploads,
        "total_duplicates": total_duplicates,
        "latest_job": dict(latest_job) if latest_job else None
    }
