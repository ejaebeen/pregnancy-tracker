from datetime import datetime, timezone
from typing import Annotated

from pydantic import BaseModel, Field, field_serializer


def _iso_utc(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


class DiaryRead(BaseModel):
    id: str
    created_at: datetime
    text: str

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return _iso_utc(value)


class DiaryCreate(BaseModel):
    text: Annotated[str, Field(min_length=1)]


class QuestionRead(BaseModel):
    id: str
    created_at: datetime
    text: str
    is_answered: bool

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return _iso_utc(value)


class QuestionCreate(BaseModel):
    text: Annotated[str, Field(min_length=1)]


class QuestionUpdate(BaseModel):
    is_answered: bool
