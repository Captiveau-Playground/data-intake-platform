from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import CORS_ORIGINS
from src.routes import auth, clubs, posts, comments, uploads, jobs, users, dashboard

app = FastAPI(title="Football Intel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(clubs.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(uploads.router)
app.include_router(jobs.router)
app.include_router(users.router)
app.include_router(dashboard.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
