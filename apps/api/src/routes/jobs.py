from fastapi import APIRouter, Depends, HTTPException
import psycopg2
from psycopg2.extras import RealDictCursor

from src.core.config import DATABASE_URL
from src.core.deps import User, require_role

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/")
async def get_jobs(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(require_role(["administrator", "datacollector"]))
):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM ingestion_jobs ORDER BY created_at DESC LIMIT %s OFFSET %s", (limit, offset))
    jobs = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(job) for job in jobs]


@router.get("/{job_id}")
async def get_job(job_id: int, current_user: User = Depends(require_role(["administrator", "datacollector"]))):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM ingestion_jobs WHERE id = %s", (job_id,))
    job = cursor.fetchone()
    cursor.close()
    conn.close()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return dict(job)
