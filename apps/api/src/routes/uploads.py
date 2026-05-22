import os
import json
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd

from src.core.config import DATABASE_URL
from src.core.deps import User, require_role

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def upload_files(
    files: List[UploadFile] = File(...),
    metadata: str = Form(...),
    current_user: User = Depends(require_role(["administrator", "datacollector"]))
):
    upload_metadata = json.loads(metadata)

    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute(
        "INSERT INTO posts (club_id, post_type, caption, post_url, post_date) VALUES (%s, %s, %s, %s, %s) RETURNING id",
        (upload_metadata.get("club_id"), upload_metadata.get("post_type"),
         upload_metadata.get("caption"), upload_metadata.get("post_url") or None,
         upload_metadata.get("post_date"))
    )
    post = cursor.fetchone()
    post_id = post["id"]

    cursor.execute(
        "INSERT INTO ingestion_jobs (status, total_files, metadata, created_by) VALUES (%s, %s, %s, %s) RETURNING id",
        ("processing", len(files), json.dumps(upload_metadata), current_user.id)
    )
    job = cursor.fetchone()
    job_id = job["id"]
    conn.commit()

    saved_files = []
    total_inserted = 0
    total_duplicates = 0
    total_failed = 0

    for file in files:
        content = await file.read()
        os.makedirs("uploads", exist_ok=True)
        filepath = f"uploads/{file.filename}"
        with open(filepath, "wb") as f:
            f.write(content)
        saved_files.append(filepath)

        try:
            df = _read_file(filepath)
            if df is None or df.empty:
                total_failed += 1
                continue

            df.columns = df.columns.str.strip().str.replace('"', '').str.strip().str.lower()

            valid_rows = _extract_valid_rows(df, post_id)
            failed_in_file = len(df) - len(valid_rows)
            total_failed += failed_in_file

            if valid_rows:
                cursor.executemany(
                    """INSERT INTO comments
                    (post_id, comment_id, text, username, user_id, profile_pic_url, comment_created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (comment_id) DO NOTHING""",
                    valid_rows
                )
                total_inserted = cursor.rowcount
                total_duplicates = len(valid_rows) - total_inserted
            conn.commit()

        except Exception as e:
            conn.rollback()
            print(f"Error processing file {filepath}: {e}")
            total_failed += 1

    cursor.execute(
        """UPDATE ingestion_jobs
        SET status = %s, total_rows = %s, inserted_rows = %s, duplicate_rows = %s, failed_rows = %s, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s""",
        ("completed", total_inserted + total_duplicates + total_failed,
         total_inserted, total_duplicates, total_failed, job_id)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return {"post_id": post_id, "job_id": job_id, "files": saved_files}


def _read_file(filepath: str):
    """Try reading file as Excel, then CSV with multiple encodings."""
    df = None
    if filepath.endswith(('.xls', '.xlsx')):
        try:
            df = pd.read_excel(filepath, engine='openpyxl')
        except Exception:
            try:
                df = pd.read_excel(filepath, engine='xlrd')
            except Exception:
                pass

    if df is None:
        for encoding in ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']:
            try:
                df = pd.read_csv(filepath, encoding=encoding, sep=None, on_bad_lines="skip", quotechar='"', engine="python")
                break
            except Exception:
                continue

    return df


def _extract_valid_rows(df, post_id: int) -> list:
    """Extract valid comment rows from dataframe."""
    valid_rows = []

    def safe_val(v):
        if pd.isna(v):
            return None
        return str(v)

    for _, row in df.iterrows():
        try:
            text = (safe_val(row.get("komentar")) or safe_val(row.get("text")) or
                    safe_val(row.get("comment")) or safe_val(row.get("content")) or
                    safe_val(row.get("message")))
            if not text:
                continue

            comment_id = (safe_val(row.get("comment_id")) or safe_val(row.get("no")) or
                          safe_val(row.get("id")) or str(uuid.uuid4()))

            username = (safe_val(row.get("nama pengguna")) or safe_val(row.get("username")) or
                        safe_val(row.get("user")) or safe_val(row.get("name")))

            valid_rows.append((
                post_id, comment_id, text,
                username, safe_val(row.get("user_id")),
                safe_val(row.get("profile_pic_url")), None
            ))
        except Exception:
            continue

    return valid_rows
