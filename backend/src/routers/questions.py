from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import SessionLocal

router = APIRouter(prefix="/questions", tags=["questions"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=list[schemas.QuestionRead])
def list_questions(db: Session = Depends(get_db)) -> list[schemas.QuestionRead]:
    return crud.list_questions(db)


@router.post("", response_model=schemas.QuestionRead, status_code=status.HTTP_201_CREATED)
def create_question(payload: schemas.QuestionCreate, db: Session = Depends(get_db)) -> schemas.QuestionRead:
    return crud.create_question(db, payload)


@router.patch("/{question_id}", response_model=schemas.QuestionRead)
def update_question(
    question_id: str, payload: schemas.QuestionUpdate, db: Session = Depends(get_db)
) -> schemas.QuestionRead:
    updated = crud.update_question(db, question_id, payload)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return updated


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: str, db: Session = Depends(get_db)) -> Response:
    if crud.get_question(db, question_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    crud.delete_question(db, question_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
