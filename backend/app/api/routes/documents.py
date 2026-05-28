from fastapi import APIRouter, UploadFile, File, Depends
from app.services.document_service import DocumentService
from app.api.deps import get_document_service

router = APIRouter()


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    service: DocumentService = Depends(get_document_service)
):
    """Upload and ingest a document into the vector store."""
    result = await service.ingest_document(file)
    return result


@router.get("/")
async def list_documents(
    service: DocumentService = Depends(get_document_service)
):
    """List all ingested documents."""
    return await service.list_documents()


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    service: DocumentService = Depends(get_document_service)
):
    """Delete a document from the vector store."""
    return await service.delete_document(document_id)
