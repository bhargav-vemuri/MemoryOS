from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class MemoryInteraction(Base):
    __tablename__ = "interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    interaction_type = Column(String, nullable=False) # e.g. "retrieved", "viewed", "modified"
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    file = relationship("MemoryFile")
