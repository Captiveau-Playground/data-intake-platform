import os
import json
import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://football_intel:football_intel_dev@localhost:5432/football_intel")
CSV_REQUIRED_HEADERS = ["comment_id", "created_at", "profile_pic_url", "text", "user_id", "username"]

class ETLWorker:
    def __init__(self, job_id: int, post_id: int, file_paths: list):
        self.job_id = job_id
        self.post_id = post_id
        self.file_paths = file_paths
        self.inserted_rows = 0
        self.duplicate_rows = 0
        self.failed_rows = 0

    def get_db_connection(self):
        return psycopg2.connect(DATABASE_URL)

    def validate_csv(self, filepath: str) -> tuple[bool, str]:
        try:
            df = pd.read_csv(filepath, nrows=0)
            missing = set(CSV_REQUIRED_HEADERS) - set(df.columns)
            if missing:
                return False, f"Missing required headers: {missing}"
            return True, "Valid"
        except Exception as e:
            return False, str(e)

    def clean_text(self, text: str) -> str:
        if pd.isna(text):
            return ""
        return str(text).strip().replace("\n", " ").replace("\r", " ")

    def process_file(self, filepath: str) -> tuple[int, int, int]:
        df = pd.read_csv(filepath, encoding="utf-8")
        df = df.dropna(subset=["text"])
        df["text"] = df["text"].apply(self.clean_text)
        df = df[df["text"].str.len() > 0]
        df = df.drop_duplicates(subset=["comment_id"])

        inserted = 0
        duplicates = 0

        conn = self.get_db_connection()
        cursor = conn.cursor()

        for _, row in df.iterrows():
            try:
                cursor.execute(
                    """INSERT INTO comments 
                    (post_id, comment_id, text, username, user_id, profile_pic_url, comment_created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (post_id, comment_id) DO NOTHING""",
                    (
                        self.post_id,
                        str(row["comment_id"]),
                        row["text"],
                        row.get("username"),
                        row.get("user_id"),
                        row.get("profile_pic_url"),
                        row.get("created_at")
                    )
                )
                if cursor.rowcount > 0:
                    inserted += 1
                else:
                    duplicates += 1
            except Exception:
                pass

        conn.commit()
        cursor.close()
        conn.close()

        return inserted, duplicates, len(df) - inserted

    def run(self):
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "UPDATE ingestion_jobs SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (self.job_id,)
        )
        conn.commit()

        total_inserted = 0
        total_duplicates = 0
        total_failed = 0

        for filepath in self.file_paths:
            valid, msg = self.validate_csv(filepath)
            if not valid:
                print(f"Validation failed for {filepath}: {msg}")
                continue

            inserted, duplicates, failed = self.process_file(filepath)
            total_inserted += inserted
            total_duplicates += duplicates
            total_failed += failed

        self.inserted_rows = total_inserted
        self.duplicate_rows = total_duplicates
        self.failed_rows = total_failed

        status = "completed"
        cursor.execute(
            """UPDATE ingestion_jobs 
            SET status = %s, total_rows = %s, inserted_rows = %s, duplicate_rows = %s, failed_rows = %s, updated_at = CURRENT_TIMESTAMP 
            WHERE id = %s""",
            (status, len(self.file_paths), total_inserted, total_duplicates, total_failed, self.job_id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        print(f"Job {self.job_id} completed: {total_inserted} inserted, {total_duplicates} duplicates, {total_failed} failed")

def process_job(job_id: int, post_id: int, file_paths: list):
    worker = ETLWorker(job_id, post_id, file_paths)
    worker.run()

if __name__ == "__main__":
    process_job(1, 1, ["uploads/test.csv"])