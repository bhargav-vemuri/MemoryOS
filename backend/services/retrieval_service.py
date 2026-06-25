from sqlalchemy import text
from sqlalchemy.orm import Session
from sentence_transformers import CrossEncoder
from services.embedding_service import embedding_service
from models.file import MemoryFile
import os

class RetrievalService:
    def __init__(self):
        # We load a small, fast cross-encoder for re-ranking hybrid results
        # In a robust production environment, this might be loaded lazily or served separately
        try:
            self.cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
        except Exception as e:
            print(f"Warning: Could not load CrossEncoder. Re-ranking will be skipped. {e}")
            self.cross_encoder = None

    def hybrid_search(self, query: str, db: Session, n_results: int = 5):
        candidates = []
        seen_texts = set()

        # 1. Vector Search (ChromaDB)
        try:
            vector_results = embedding_service.search_similar(query, n_results=10)
            if vector_results and vector_results.get('documents') and len(vector_results['documents'][0]) > 0:
                for i in range(len(vector_results['documents'][0])):
                    chunk_text = vector_results['documents'][0][i]
                    if chunk_text not in seen_texts:
                        seen_texts.add(chunk_text)
                        file_id = vector_results['metadatas'][0][i]['file_id']
                        candidates.append({
                            "text": chunk_text,
                            "file_id": file_id,
                            "source": "vector"
                        })
        except Exception as e:
            print(f"Vector search failed: {e}")

        # 1.5 Image Search (CLIP Multimodal)
        try:
            image_results = embedding_service.search_images(query, n_results=2)
            if image_results and image_results.get('ids') and len(image_results['ids'][0]) > 0:
                for i in range(len(image_results['ids'][0])):
                    file_id = image_results['metadatas'][0][i]['file_id']
                    db_file = db.query(MemoryFile).filter(MemoryFile.id == file_id).first()
                    if db_file and db_file.extracted_text:
                        snippet = f"Image OCR Text ({db_file.filename}): {db_file.extracted_text[:1000]}"
                        if snippet not in seen_texts:
                            seen_texts.add(snippet)
                            candidates.append({
                                "text": snippet,
                                "file_id": file_id,
                                "source": "clip_image"
                            })
        except Exception as e:
            print(f"Image vector search failed: {e}")

        # 2. BM25 Search (PostgreSQL FTS)
        try:
            fts_query = text("""
                SELECT id, extracted_text 
                FROM files 
                WHERE search_vector @@ plainto_tsquery('english', :query)
                LIMIT 5
            """)
            fts_results = db.execute(fts_query, {"query": query}).fetchall()
            
            for row in fts_results:
                file_id = row.id
                text_content = row.extracted_text
                if text_content:
                    # Naive chunking: taking first 1000 chars of matching files for cross-encoder
                    snippet = text_content[:1000]
                    if snippet not in seen_texts:
                        seen_texts.add(snippet)
                        candidates.append({
                            "text": snippet,
                            "file_id": file_id,
                            "source": "bm25"
                        })
        except Exception as e:
            print(f"BM25 search failed: {e}")

        if not candidates:
            return []

        # 3. Re-ranking Layer
        if self.cross_encoder is not None:
            pairs = [[query, doc["text"]] for doc in candidates]
            scores = self.cross_encoder.predict(pairs)
            for i in range(len(candidates)):
                candidates[i]["score"] = float(scores[i])
            
            # Sort by CrossEncoder score descending
            candidates.sort(key=lambda x: x["score"], reverse=True)
        else:
            # Fallback if model didn't load
            for i in range(len(candidates)):
                candidates[i]["score"] = 0.0

        return candidates[:n_results]

retrieval_service = RetrievalService()
