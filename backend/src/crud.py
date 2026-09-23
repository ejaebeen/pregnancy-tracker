from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models, schemas


def list_diary(db: Session) -> list[models.DiaryEntry]:
    stmt = select(models.DiaryEntry).order_by(models.DiaryEntry.created_at.desc(), models.DiaryEntry.id.desc())
    return list(db.scalars(stmt))


def get_diary(db: Session, entry_id: str) -> models.DiaryEntry | None:
    return db.get(models.DiaryEntry, entry_id)


def create_diary(db: Session, payload: schemas.DiaryCreate) -> models.DiaryEntry:
    entry = models.DiaryEntry(text=payload.text)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def delete_diary(db: Session, entry_id: str) -> None:
    entry = db.get(models.DiaryEntry, entry_id)
    if entry is not None:
        db.delete(entry)
        db.commit()


def list_questions(db: Session) -> list[models.DoctorQuestion]:
    stmt = select(models.DoctorQuestion).order_by(models.DoctorQuestion.created_at.desc(), models.DoctorQuestion.id.desc())
    return list(db.scalars(stmt))


def get_question(db: Session, question_id: str) -> models.DoctorQuestion | None:
    return db.get(models.DoctorQuestion, question_id)


def create_question(db: Session, payload: schemas.QuestionCreate) -> models.DoctorQuestion:
    question = models.DoctorQuestion(text=payload.text, is_answered=False)
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


def update_question(
    db: Session, question_id: str, payload: schemas.QuestionUpdate
) -> models.DoctorQuestion | None:
    question = db.get(models.DoctorQuestion, question_id)
    if question is None:
        return None
    question.is_answered = payload.is_answered
    db.commit()
    db.refresh(question)
    return question


def delete_question(db: Session, question_id: str) -> None:
    question = db.get(models.DoctorQuestion, question_id)
    if question is not None:
        db.delete(question)
        db.commit()
