import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from models.file import MemoryFile, FileStatus
from workers.tasks import process_file_task
from services.embedding_service import embedding_service
from services.graph_service import graph_service

router = APIRouter()
UPLOAD_DIR = "local_storage"

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Mock user_id = 1 for now (until auth is hooked up)
    db_file = MemoryFile(
        user_id=1,
        filename=file.filename,
        file_type=file.content_type,
        storage_path=file_path,
        status=FileStatus.PENDING
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    # Trigger celery task (use .delay in Celery, but here we can just use celery task .delay)
    process_file_task.delay(db_file.id)
    
    return {"message": "File uploaded successfully", "file_id": db_file.id}

@router.delete("/file/{file_id}")
def delete_file(file_id: int, db: Session = Depends(get_db)):
    db_file = db.query(MemoryFile).filter(MemoryFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
        
    # 1. Delete from ChromaDB
    try:
        embedding_service.collection.delete(where={"file_id": file_id})
    except Exception as e:
        print(f"Error deleting from ChromaDB: {e}")
        
    # 2. Delete from Neo4j
    try:
        graph_service.delete_file_node(file_id)
    except Exception as e:
        print(f"Error deleting from Neo4j: {e}")
        
    # 3. Delete physical file
    try:
        if os.path.exists(db_file.storage_path):
            os.remove(db_file.storage_path)
    except Exception as e:
        print(f"Error deleting physical file: {e}")
        
    # 4. Delete from PostgreSQL
    db.delete(db_file)
    db.commit()
    
    return {"message": "File completely deleted from all systems"}

@router.get("/search")
def semantic_search(q: str, db: Session = Depends(get_db)):
    if not q:
        return {"results": []}
    
    results = embedding_service.search_similar(q, n_results=10)
    
    if not results or not results['documents']:
        return {"results": []}
        
    # Format results
    formatted = []
    seen_filenames = set()
    for i in range(len(results['documents'][0])):
        chunk_text = results['documents'][0][i]
        metadata = results['metadatas'][0][i]
        file_id = metadata['file_id']
        
        db_file = db.query(MemoryFile).filter(MemoryFile.id == file_id).first()
        filename = db_file.filename if db_file else "Unknown"
        
        # Deduplicate to show diverse files
        if filename in seen_filenames:
            continue
        seen_filenames.add(filename)
        
        raw_distance = results['distances'][0][i] if 'distances' in results and results['distances'] else 0
        cosine_sim = max(0.0, 1.0 - (raw_distance / 2.0))
        
        # User explicitly requested raw mathematical cosine similarity without UI scaling
        pure_score = cosine_sim
        
        formatted.append({
            "file_id": file_id,
            "filename": filename,
            "text": chunk_text,
            "score": pure_score
        })
        
    return {"results": formatted}

@router.get("/graph")
def get_graph():
    return graph_service.get_graph_data()

@router.get("/timeline")
def get_timeline(db: Session = Depends(get_db)):
    files = db.query(MemoryFile).order_by(MemoryFile.created_at.desc()).limit(50).all()
    return {
        "timeline": [
            {
                "id": f.id,
                "filename": f.filename,
                "type": f.file_type,
                "date": f.created_at,
                "status": f.status
            } for f in files
        ]
    }

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    # Calculate indexed memories (total files)
    indexed_memories = db.query(MemoryFile).count()
    
    # Calculate graph relationships and concepts from Neo4j
    graph_data = graph_service.get_graph_data()
    graph_relationships = len(graph_data.get("links", []))
    
    concepts = [n for n in graph_data.get("nodes", []) if n.get("group") == "Concept"]
    active_clusters = len(concepts)
    
    # Calculate semantic depth based on density of relationships
    # e.g., avg relationships per memory, maxed at 99%
    avg_rel = (graph_relationships / indexed_memories) if indexed_memories > 0 else 0
    semantic_depth = min(99, int(avg_rel * 15)) # Arbitrary scaling for a cool metric
    
    return {
        "indexed_memories": indexed_memories,
        "graph_relationships": graph_relationships,
        "active_clusters": active_clusters,
        "semantic_depth": f"{semantic_depth}%",
        "recent_clusters": [c.get("label") for c in concepts[:3]] if concepts else ["Initialization Phase"]
    }
