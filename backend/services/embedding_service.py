from sentence_transformers import SentenceTransformer
from core.chroma_client import get_chroma_client

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.chroma_client = get_chroma_client()
        self.collection = self.chroma_client.get_or_create_collection(name="memory_chunks")

    def generate_embedding(self, text: str):
        return self.model.encode(text).tolist()

    def add_chunks_to_chroma(self, file_id: int, chunks: list[str]):
        embeddings = self.model.encode(chunks).tolist()
        ids = [f"{file_id}_{i}" for i in range(len(chunks))]
        metadatas = [{"file_id": file_id, "chunk_index": i} for i in range(len(chunks))]
        
        self.collection.add(
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )

    def search_similar(self, query: str, n_results: int = 5):
        query_embedding = self.generate_embedding(query)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        return results

embedding_service = EmbeddingService()
