from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Index, Float
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from core.database import Base

class FileStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class MemoryFile(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # e.g. pdf, txt, image/png
    storage_path = Column(String, nullable=False)
    status = Column(Enum(FileStatus), default=FileStatus.PENDING)
    extracted_text = Column(Text, nullable=True) # Full extracted text
    search_vector = Column(TSVECTOR)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=True)
    importance_score = Column(Float, default=0.0)
    
    __table_args__ = (
        Index('ix_files_search_vector', 'search_vector', postgresql_using='gin'),
    )
    
    user = relationship("User")
    cluster = relationship("MemoryCluster", back_populates="files")
