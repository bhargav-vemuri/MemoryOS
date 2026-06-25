from sklearn.cluster import HDBSCAN
from services.embedding_service import embedding_service
from services.llm_service import llm_service
from models.cluster import MemoryCluster
from models.file import MemoryFile
from sqlalchemy.orm import Session
import numpy as np

class ClusteringService:
    def cluster_memories(self, db: Session):
        files = db.query(MemoryFile).all()
        if len(files) < 3:
            return # Too few files to cluster
            
        file_ids = []
        embeddings = []
        
        for f in files:
            if f.extracted_text:
                file_ids.append(f.id)
                # Re-embed the first chunk for doc-level clustering
                embeddings.append(embedding_service.generate_embedding(f.extracted_text[:3000]))
                
        if len(embeddings) < 3:
            return
            
        # Run HDBSCAN
        # min_cluster_size is set small for testing purposes
        hdbscan = HDBSCAN(min_cluster_size=2)
        labels = hdbscan.fit_predict(np.array(embeddings))
        
        clusters_dict = {}
        for idx, label in enumerate(labels):
            if label == -1: # Noise / Outlier
                continue
            if label not in clusters_dict:
                clusters_dict[label] = []
            clusters_dict[label].append(files[file_ids[idx]])
            
        # Save Clusters
        for label, cluster_files in clusters_dict.items():
            snippets = "\n".join([f.extracted_text[:200] for f in cluster_files if f.extracted_text])
            prompt = f"Based on these text snippets, generate a 2-4 word concise title representing this category of memories:\n{snippets}"
            system_prompt = "You are a clustering AI. Output ONLY the short title."
            
            name = llm_service.generate(prompt, system_prompt=system_prompt).strip()
            
            # Simple approach: create new cluster and assign files
            # In a robust system, we would match against existing clusters
            cluster = MemoryCluster(name=name, summary=f"Automatically generated cluster with {len(cluster_files)} memories.")
            db.add(cluster)
            db.commit()
            db.refresh(cluster)
            
            for f in cluster_files:
                f.cluster_id = cluster.id
            db.commit()
            print(f"Generated Cluster: {name} with {len(cluster_files)} items.")

clustering_service = ClusteringService()
