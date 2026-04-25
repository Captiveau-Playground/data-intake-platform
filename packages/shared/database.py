import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from football_intel_config import DATABASE_URL

@contextmanager
def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        conn.close()

@contextmanager
def get_db_cursor(dict_cursor=True):
    with get_db_connection() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor if dict_cursor else None)
        try:
            yield cursor
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()

def init_db():
    with get_db_cursor() as cursor:
        cursor.execute(open("infra/schema.sql", "r").read())