from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import profile, vision_test, transform, ml_transform, camera, ai_assistant

from app.core.config import settings
from app.db.session import init_db

@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield

app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router, prefix=settings.api_v1_prefix)
app.include_router(vision_test.router, prefix="/api")
app.include_router(transform.router, prefix="/api")
app.include_router(ml_transform.router, prefix="/api")
app.include_router(camera.router, prefix="/api")
app.include_router(ai_assistant.router, prefix="/api")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": settings.app_name}

from fastapi.staticfiles import StaticFiles
import os

static_dir = os.path.join(os.path.dirname(__file__), "../static")

# Mount SDK and Excel
app.mount("/sdk", StaticFiles(directory=os.path.join(static_dir, "sdk"), html=True), name="sdk")
app.mount("/excel", StaticFiles(directory=os.path.join(static_dir, "excel"), html=True), name="excel")

# Mount Web App last to avoid catching API routes
app.mount("/app", StaticFiles(directory=os.path.join(static_dir, "app"), html=True), name="app")
