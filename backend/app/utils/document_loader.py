from langchain_community.document_loaders import (
    PyMuPDFLoader,
    Docx2txtLoader,
    TextLoader,
)
import os


SUPPORTED_EXTENSIONS = {
    ".pdf": PyMuPDFLoader,
    ".docx": Docx2txtLoader,
    ".txt": TextLoader,
    ".md": TextLoader,
}


def load_document(file_path: str):
    """Load a document based on its file extension."""
    ext = os.path.splitext(file_path)[1].lower()
    loader_class = SUPPORTED_EXTENSIONS.get(ext)
    if not loader_class:
        raise ValueError(f"Unsupported file type: {ext}. Supported: {list(SUPPORTED_EXTENSIONS.keys())}")
    loader = loader_class(file_path)
    return loader.load()


def get_supported_extensions():
    return list(SUPPORTED_EXTENSIONS.keys())
