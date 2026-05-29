import os
import pdfplumber
import docx
from core.celery_app import celery_app
from core.database import SessionLocal
from models.file import MemoryFile, FileStatus
from models.user import User
from services.ocr_service import ocr_service
from services.embedding_service import embedding_service
from services.graph_service import graph_service

def extract_text(file_path: str, file_type: str) -> str:
    if file_type == "application/pdf":
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text
    elif file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        doc = docx.Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    elif file_type.startswith("image/"):
        return ocr_service.extract_text_from_image(file_path)
    elif file_type == "text/plain":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    return ""

def chunk_text(text: str, chunk_size: int = 500) -> list[str]:
    words = text.split()
    return [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

@celery_app.task
def process_file_task(file_id: int):
    db = SessionLocal()
    file_record = db.query(MemoryFile).filter(MemoryFile.id == file_id).first()
    
    if not file_record:
        db.close()
        return

    try:
        file_record.status = FileStatus.PROCESSING
        db.commit()

        # 1. Extract Text
        text = extract_text(file_record.storage_path, file_record.file_type)
        file_record.extracted_text = text
        db.commit()

        if text.strip():
            # 2. Chunk Text
            chunks = chunk_text(text)
            
            # 3. Generate Embeddings & Store in Chroma
            embedding_service.add_chunks_to_chroma(file_id, chunks)
            
            # 4. Generate Graph Relationships
            graph_service.create_file_node(file_id, file_record.filename, file_record.file_type)
            graph_service.extract_and_create_entities(file_id, text)

        file_record.status = FileStatus.COMPLETED
        db.commit()

    except Exception as e:
        print(f"Error processing file {file_id}: {e}")
        file_record.status = FileStatus.FAILED
        db.commit()
    finally:
        db.close()
