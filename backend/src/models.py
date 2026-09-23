from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    text: Mapped[str] = mapped_column(Text)


class DoctorQuestion(Base):
    __tablename__ = "doctor_questions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    text: Mapped[str] = mapped_column(Text)
    is_answered: Mapped[bool] = mapped_column(Boolean, default=False)
