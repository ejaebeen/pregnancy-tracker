from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import SessionLocal

router = APIRouter(prefix="/diary", tags=["diary"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=list[schemas.DiaryRead])
def list_diary(db: Session = Depends(get_db)) -> list[schemas.DiaryRead]:
    return crud.list_diary(db)


@router.post("", response_model=schemas.DiaryRead, status_code=status.HTTP_201_CREATED)
def create_diary(payload: schemas.DiaryCreate, db: Session = Depends(get_db)) -> schemas.DiaryRead:
    return crud.create_diary(db, payload)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_diary(entry_id: str, db: Session = Depends(get_db)) -> Response:
    if crud.get_diary(db, entry_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diary entry not found")
    crud.delete_diary(db, entry_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
