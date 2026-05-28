from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import get_settings


class RAGEngine:
    def __init__(self):
        settings = get_settings()
        self.embeddings = OllamaEmbeddings(
            base_url=settings.ollama_base_url,
            model=settings.ollama_embed_model
        )
        self.vectorstore = Chroma(
            persist_directory=settings.chroma_persist_dir,
            embedding_function=self.embeddings,
            collection_name="research_docs"
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def add_documents(self, documents, metadata=None):
        chunks = self.text_splitter.split_documents(documents)
        self.vectorstore.add_documents(chunks)
        return len(chunks)

    def similarity_search(self, query, k=5):
        return self.vectorstore.similarity_search_with_score(query, k=k)

    def delete_by_metadata(self, filter_dict):
        self.vectorstore.delete(filter=filter_dict)
