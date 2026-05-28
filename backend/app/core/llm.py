from langchain_ollama import ChatOllama
from app.config import get_settings


def get_llm():
    settings = get_settings()
    return ChatOllama(
        base_url=settings.ollama_base_url,
        model=settings.ollama_model,
        temperature=0.3,
    )
