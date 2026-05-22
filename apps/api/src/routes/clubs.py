from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
import psycopg2
from psycopg2.extras import RealDictCursor

from src.core.config import DATABASE_URL
from src.core.deps import User, require_role
from src.models.club import ClubCreate

router = APIRouter(prefix="/clubs", tags=["clubs"])


@router.get("/")
async def get_clubs(
    search: Optional[str] = None,
    league: Optional[str] = None,
    current_user: User = Depends(require_role(["administrator", "datacollector"]))
):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    query = "SELECT * FROM clubs WHERE 1=1"
    params = []
    if search:
        query += " AND name ILIKE %s"
        params.append(f"%{search}%")
    if league:
        query += " AND league = %s"
        params.append(league)
    query += " ORDER BY league, name"

    cursor.execute(query, params)
    clubs = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(club) for club in clubs]


@router.get("/{club_id}")
async def get_club(club_id: int, current_user: User = Depends(require_role(["administrator", "datacollector"]))):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM clubs WHERE id = %s", (club_id,))
    club = cursor.fetchone()
    cursor.close()
    conn.close()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    return dict(club)


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_club(club: ClubCreate, current_user: User = Depends(require_role(["administrator"]))):
    if club.league not in ("Liga 1", "Liga 2"):
        raise HTTPException(status_code=400, detail="League must be 'Liga 1' or 'Liga 2'")

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            "INSERT INTO clubs (name, country, league, instagram_handle) VALUES (%s, %s, %s, %s) RETURNING *",
            (club.name, club.country, club.league, club.instagram_handle)
        )
        new_club = cursor.fetchone()
        conn.commit()
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=409, detail="Club name already exists")
    finally:
        cursor.close()
        conn.close()
    return dict(new_club)


@router.put("/{club_id}")
async def update_club(club_id: int, club: ClubCreate, current_user: User = Depends(require_role(["administrator"]))):
    if club.league not in ("Liga 1", "Liga 2"):
        raise HTTPException(status_code=400, detail="League must be 'Liga 1' or 'Liga 2'")

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            "UPDATE clubs SET name=%s, country=%s, league=%s, instagram_handle=%s WHERE id=%s RETURNING *",
            (club.name, club.country, club.league, club.instagram_handle, club_id)
        )
        updated = cursor.fetchone()
        conn.commit()
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=409, detail="Club name already exists")
    finally:
        cursor.close()
        conn.close()

    if not updated:
        raise HTTPException(status_code=404, detail="Club not found")
    return dict(updated)


@router.delete("/{club_id}", status_code=204)
async def delete_club(club_id: int, current_user: User = Depends(require_role(["administrator"]))):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("DELETE FROM clubs WHERE id = %s", (club_id,))
    deleted = cursor.rowcount
    conn.commit()
    cursor.close()
    conn.close()
    if not deleted:
        raise HTTPException(status_code=404, detail="Club not found")
