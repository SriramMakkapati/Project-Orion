from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api.routes import chat, documents, sources, health
from app.models.database import init_db
import os

settings = get_settings()

app = FastAPI(
    title="Multi-Source Research Agent",
    version="1.0.0",
    description="RAG + MCP powered research agent with local Ollama"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(sources.router, prefix="/api/sources", tags=["Sources"])


@app.on_event("startup")
async def startup():
    os.makedirs(settings.chroma_persist_dir, exist_ok=True)
    os.makedirs(settings.upload_dir, exist_ok=True)
    await init_db()
