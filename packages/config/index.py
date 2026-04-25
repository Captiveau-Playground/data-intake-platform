import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://football_intel:football_intel_dev@localhost:5432/football_intel"
)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

API_PORT = 3001
WEB_PORT = 3000

CSV_REQUIRED_HEADERS = [
    "comment_id",
    "created_at",
    "profile_pic_url",
    "text",
    "user_id",
    "username"
]