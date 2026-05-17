import os
import json
from datetime import datetime, timedelta
from typing import Optional, List, Any
from dataclasses import dataclass

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor
from jose import JWTError, jwt

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://football_intel:football_intel_dev@localhost:5432/football_intel")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
ALGORITHM = os.getenv("ALGORITHM", "HS256")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app = FastAPI(title="Football Intel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@dataclass
class User:
    id: int
    username: str
    role: str

@dataclass
class Token:
    access_token: str
    token_type: str

def get_user_from_token(token: str = Depends(oauth2_scheme)):
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

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT id, username, password_hash FROM users WHERE username = %s", (form_data.username,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    # Verify password with bcrypt
    password_hash = user["password_hash"]
    if not bcrypt.checkpw(form_data.password.encode('utf-8'), password_hash.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user["username"]}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return Token(access_token=access_token, token_type="bearer")

@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_user_from_token)):
    return current_user

@app.get("/clubs")
async def get_clubs(current_user: User = Depends(get_user_from_token)):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM clubs ORDER BY name")
    clubs = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(club) for club in clubs]

@app.post("/clubs")
async def create_club(club: Any, current_user: User = Depends(get_user_from_token)):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        "INSERT INTO clubs (name, country, league, instagram_handle) VALUES (%s, %s, %s, %s) RETURNING id, name, country, league, instagram_handle, created_at",
        (club.name, club.country, club.league, club.instagram_handle)
    )
    new_club = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return dict(new_club)

@app.get("/posts")
async def get_posts(
    club_id: Optional[int] = None,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_user_from_token)
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

@app.post("/posts")
async def create_post(post: Any, current_user: User = Depends(get_user_from_token)):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        "INSERT INTO posts (club_id, post_type, caption, post_url, post_date, source_filename) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, club_id, post_type, caption, post_url, post_date, source_filename, created_at",
        (post.club_id, post.post_type, post.caption, post.post_url, post.post_date, post.source_filename)
    )
    new_post = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return dict(new_post)

@app.get("/comments")
async def get_comments(
    post_id: Optional[int] = None,
    username: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_user_from_token)
):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
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
    return [dict(comment) for comment in comments]

@app.post("/uploads", status_code=status.HTTP_201_CREATED)
async def upload_files(
    files: List[UploadFile] = File(...),
    metadata: str = Form(...),
    current_user: User = Depends(get_user_from_token)
):
    import json
    import pandas as pd
    upload_metadata = json.loads(metadata)
    
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute(
        "INSERT INTO posts (club_id, post_type, caption, post_url, post_date) VALUES (%s, %s, %s, %s, %s) RETURNING id",
        (upload_metadata.get("club_id"), upload_metadata.get("post_type"), upload_metadata.get("caption"), upload_metadata.get("post_url"), upload_metadata.get("post_date"))
    )
    post = cursor.fetchone()
    post_id = post["id"]
    
    cursor.execute(
        "INSERT INTO ingestion_jobs (status, total_files, metadata, created_by) VALUES (%s, %s, %s, %s) RETURNING id, status, total_files, total_rows, inserted_rows, duplicate_rows, failed_rows, created_at",
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
        
        # Process CSV immediately
        try:
            print(f"Processing file: {filepath}")
            # Gunakan sep=None agar pandas otomatis mendeteksi apakah file menggunakan koma (,) atau titik koma (;)
            df = pd.read_csv(filepath, encoding="utf-8", sep=None, on_bad_lines="skip", quotechar='"', engine="python")
            print(f"Loaded {len(df)} rows, columns: {df.columns.tolist()}")
            
            # Normalize column names - strip quotes and make lowercase for easier matching
            df.columns = df.columns.str.strip().str.replace('"', '').str.strip().str.lower()
            print(f"Normalized columns: {df.columns.tolist()}")
            
            import uuid
            
            def safe_val(v):
                if pd.isna(v):
                    return None
                return str(v)
            
            print(f"Inserting {len(df)} comments...")
            
            # Prepare data first, skip invalid
            valid_rows = []
            for idx, row in df.iterrows():
                try:
                    # Cari kolom teks komentar dengan berbagai variasi nama kolom
                    text = safe_val(row.get("komentar")) or safe_val(row.get("text")) or safe_val(row.get("comment")) or safe_val(row.get("content")) or safe_val(row.get("message"))
                    if not text:
                        continue
                        
                    # Generate unique ID (cari dari comment_id, no, id, atau bikin UUID baru)
                    comment_id = safe_val(row.get("comment_id")) or safe_val(row.get("no")) or safe_val(row.get("id")) or str(uuid.uuid4())
                    
                    # Cari username
                    username = safe_val(row.get("nama pengguna")) or safe_val(row.get("username")) or safe_val(row.get("user")) or safe_val(row.get("name"))
                    
                    valid_rows.append((
                        post_id, comment_id, text, 
                        username, safe_val(row.get("user_id")), 
                        safe_val(row.get("profile_pic_url")), None
                    ))
                except Exception as e:
                    print(f"Row error: {e}")
                    total_failed += 1
            
            # Batch insert
            try:
                if valid_rows:
                    cursor.executemany(
                        """INSERT INTO comments 
                        (post_id, comment_id, text, username, user_id, profile_pic_url, comment_created_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (post_id, comment_id) DO NOTHING""",
                        valid_rows
                    )
                    total_inserted = len(valid_rows)
                conn.commit()
            except Exception as e:
                conn.rollback()
                print(f"Batch insert error: {e}")
                total_failed = len(df)
            
            print(f"Insert complete: {total_inserted} inserted, {total_duplicates} duplicates, {total_failed} failed")
        except Exception as e:
            print(f"Error processing file {filepath}: {e}")
    
    cursor.execute(
        """UPDATE ingestion_jobs 
        SET status = %s, total_rows = %s, inserted_rows = %s, duplicate_rows = %s, failed_rows = %s, updated_at = CURRENT_TIMESTAMP 
        WHERE id = %s""",
        ("completed", total_inserted + total_duplicates + total_failed, total_inserted, total_duplicates, total_failed, job_id)
    )
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        "post_id": post_id,
        "job_id": job_id,
        "files": saved_files
    }

@app.get("/jobs")
async def get_jobs(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_user_from_token)
):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM ingestion_jobs ORDER BY created_at DESC LIMIT %s OFFSET %s", (limit, offset))
    jobs = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(job) for job in jobs]

@app.get("/jobs/{job_id}")
async def get_job(job_id: int, current_user: User = Depends(get_user_from_token)):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM ingestion_jobs WHERE id = %s", (job_id,))
    job = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return dict(job)

@app.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_user_from_token)):
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)