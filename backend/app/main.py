from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import companies, experiences, votes, comments, reports

app = FastAPI(title="Ghosted API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies.router)
app.include_router(experiences.router)
app.include_router(votes.router)
app.include_router(comments.router)
app.include_router(reports.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Waiting for HR to reply..."}
