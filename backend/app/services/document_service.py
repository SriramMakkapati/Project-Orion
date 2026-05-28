import os
import uuid
from fastapi import UploadFile
from langchain_community.document_loaders import (
    PyMuPDFLoader,
    Docx2txtLoader,
    TextLoader,
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from app.config import Settings
from app.services.embedding_service import EmbeddingService


class DocumentService:
    def __init__(self, settings: Settings, embedding_service: EmbeddingService):
        self.settings = settings
        self.embedding_service = embedding_service
        self.upload_dir = settings.upload_dir
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        self.vectorstore = Chroma(
            persist_directory=settings.chroma_persist_dir,
            embedding_function=embedding_service.embeddings,
            collection_name="research_docs"
        )

    async def ingest_document(self, file: UploadFile):
        """Save uploaded file and ingest into vector store."""
        doc_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1].lower()
        safe_filename = f"{doc_id}{file_ext}"
        file_path = os.path.join(self.upload_dir, safe_filename)

        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        loader = self._get_loader(file_path, file_ext)
        documents = loader.load()

        for doc in documents:
            doc.metadata["doc_id"] = doc_id
            doc.metadata["filename"] = file.filename
            doc.metadata["source_type"] = "upload"

        chunks = self.text_splitter.split_documents(documents)
        self.vectorstore.add_documents(chunks)

        return {
            "doc_id": doc_id,
            "filename": file.filename,
            "chunks": len(chunks),
            "status": "ingested"
        }

    async def list_documents(self):
        """List all documents in the vector store."""
        collection = self.vectorstore._collection
        results = collection.get(include=["metadatas"])
        docs = {}
        for meta in results["metadatas"]:
            doc_id = meta.get("doc_id", "unknown")
            if doc_id not in docs:
                docs[doc_id] = {
                    "doc_id": doc_id,
                    "filename": meta.get("filename", "unknown"),
                    "chunks": 0
                }
            docs[doc_id]["chunks"] += 1
        return {"documents": list(docs.values())}

    async def delete_document(self, document_id: str):
        """Delete a document by ID."""
        self.vectorstore._collection.delete(where={"doc_id": document_id})
        return {"status": "deleted", "doc_id": document_id}

    def _get_loader(self, file_path: str, file_ext: str):
        loaders = {
            ".pdf": PyMuPDFLoader,
            ".docx": Docx2txtLoader,
            ".txt": TextLoader,
            ".md": TextLoader,
        }
        loader_class = loaders.get(file_ext)
        if not loader_class:
            raise ValueError(f"Unsupported file type: {file_ext}")
        return loader_class(file_path)
