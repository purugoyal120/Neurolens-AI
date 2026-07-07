from __future__ import annotations



from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import profile, vision_test, transform, ml_transform, camera, ai_assistant, auth

from app.core.config import settings

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(profile.router, prefix=settings.api_v1_prefix)
app.include_router(vision_test.router, prefix="/api")
app.include_router(transform.router, prefix="/api")
app.include_router(ml_transform.router, prefix="/api")
app.include_router(camera.router, prefix="/api")
app.include_router(ai_assistant.router, prefix="/api")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": settings.app_name}

# Removed StaticFiles mounts for Vercel compatibility. 
# The frontend and SDK should be deployed as separate Vercel projects.
