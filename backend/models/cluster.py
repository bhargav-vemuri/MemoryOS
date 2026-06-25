from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class MemoryCluster(Base):
    __tablename__ = "clusters"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    files = relationship("MemoryFile", back_populates="cluster")
