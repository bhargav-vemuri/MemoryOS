from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
