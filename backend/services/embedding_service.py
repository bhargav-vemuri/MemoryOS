from sentence_transformers import SentenceTransformer
from core.chroma_client import get_chroma_client
from PIL import Image

class EmbeddingService:
    def __init__(self):
        self.text_model = SentenceTransformer('all-MiniLM-L6-v2')
        try:
            self.image_model = SentenceTransformer('clip-ViT-B-32')
        except Exception:
            self.image_model = None
            
        self.chroma_client = get_chroma_client()
        self.collection = self.chroma_client.get_or_create_collection(name="memory_chunks")
        self.image_collection = self.chroma_client.get_or_create_collection(name="image_memories")

    def generate_embedding(self, text: str):
        return self.text_model.encode(text).tolist()

    def add_chunks_to_chroma(self, file_id: int, chunks: list[str]):
        embeddings = self.text_model.encode(chunks).tolist()
        ids = [f"{file_id}_{i}" for i in range(len(chunks))]
        metadatas = [{"file_id": file_id, "chunk_index": i} for i in range(len(chunks))]
        
        self.collection.add(
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
        
    def add_image_to_chroma(self, file_id: int, image_path: str):
        if not self.image_model:
            return
            
        try:
            img = Image.open(image_path)
            embedding = self.image_model.encode(img).tolist()
            
            self.image_collection.add(
                embeddings=[embedding],
                metadatas=[{"file_id": file_id}],
                ids=[f"img_{file_id}"]
            )
        except Exception as e:
            print(f"Failed to embed image {file_id}: {e}")

    def search_similar(self, query: str, n_results: int = 5):
        query_embedding = self.generate_embedding(query)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        return results

    def search_images(self, query: str, n_results: int = 2):
        if not self.image_model:
            return None
        try:
            query_embedding = self.image_model.encode(query).tolist()
            results = self.image_collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results
            )
            return results
        except Exception as e:
            print(f"Image search failed: {e}")
            return None

embedding_service = EmbeddingService()
