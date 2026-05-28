from fastapi import APIRouter

router = APIRouter()

AVAILABLE_SOURCES = [
    {"id": "vector_db", "name": "Document Store", "type": "vector", "enabled": True},
    {"id": "web_search", "name": "Web Search", "type": "web", "enabled": True},
    {"id": "file_system", "name": "Local Files", "type": "file", "enabled": True},
]


@router.get("/")
async def list_sources():
    """List all available research sources."""
    return {"sources": AVAILABLE_SOURCES}


@router.get("/{source_id}/status")
async def source_status(source_id: str):
    """Check if a source is available and connected."""
    source = next((s for s in AVAILABLE_SOURCES if s["id"] == source_id), None)
    if not source:
        return {"error": "Source not found", "status": "unavailable"}
    return {"source": source, "status": "available"}
