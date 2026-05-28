from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    query: str
    sources: Optional[list[str]] = None


class SourceResult(BaseModel):
    content: str
    metadata: dict = {}
    score: Optional[float] = None
    source: str = "unknown"


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict] = []
    query: str


class DocumentUploadResponse(BaseModel):
    doc_id: str
    filename: str
    chunks: int
    status: str
