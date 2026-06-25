from sqlalchemy.orm import Session
from sqlalchemy import func
from models.file import MemoryFile
from models.interaction import MemoryInteraction
from services.graph_service import graph_service
from datetime import datetime, timezone

class ScoringService:
    def update_importance_scores(self, db: Session):
        """
        Calculates and updates importance scores for all memories based on:
        1. Recency (newer = higher score)
        2. Frequency of retrieval (from interactions)
        3. Graph Centrality (how connected the concepts in this file are)
        """
        files = db.query(MemoryFile).all()
        now = datetime.now(timezone.utc)
        
        # Get centrality map
        centrality_data = graph_service.calculate_centrality()
        centrality_map = {item["name"]: item["score"] for item in centrality_data}
        
        for f in files:
            score = 0.0
            
            # 1. Recency Score (max 40 pts, decays over 365 days)
            age_days = (now - f.created_at).days if f.created_at and f.created_at.tzinfo else 0
            recency_score = max(0, 40 - (age_days * (40/365)))
            score += recency_score
            
            # 2. Retrieval Frequency (max 30 pts)
            interactions = db.query(func.count(MemoryInteraction.id)).filter(
                MemoryInteraction.file_id == f.id,
                MemoryInteraction.interaction_type == "retrieved"
            ).scalar() or 0
            frequency_score = min(30, interactions * 5)
            score += frequency_score
            
            # 3. Graph Centrality Proxy (max 30 pts)
            # In a real implementation we would fetch the exact concepts linked to this file
            # For simplicity, if the file's cluster or content matches top concepts, boost it
            # We'll assign a flat 15 points if it's clustered for now as a proxy
            graph_score = 15 if f.cluster_id else 0
            score += graph_score
            
            f.importance_score = min(100.0, score)
            
        db.commit()

scoring_service = ScoringService()
