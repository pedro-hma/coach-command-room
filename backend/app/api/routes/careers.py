from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db import get_db
from app.models import Career, CareerStatus, User
from app.schemas import CareerCreate, CareerResponse

router = APIRouter()


@router.post("", response_model=CareerResponse, status_code=201)
async def create_career(
    payload: CareerCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Career:
    active = await db.scalar(
        select(Career).where(
            Career.user_id == user.id,
            Career.status == CareerStatus.ATIVA,
        )
    )
    if active:
        raise HTTPException(status_code=409, detail="Já existe uma carreira ativa.")

    career = Career(
        user_id=user.id,
        name=payload.name,
        start_date=payload.start_date,
        season=payload.season,
        status=CareerStatus.CONFIGURACAO,
    )
    db.add(career)
    await db.commit()
    await db.refresh(career)
    return career


@router.get("", response_model=list[CareerResponse])
async def list_careers(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[Career]:
    result = await db.scalars(
        select(Career)
        .where(Career.user_id == user.id)
        .order_by(Career.created_at.desc())
    )
    return list(result.all())


@router.delete("/{career_id}", status_code=204)
async def delete_career(
    career_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    career = await db.scalar(
        select(Career).where(
            Career.id == career_id,
            Career.user_id == user.id,
        )
    )
    if not career:
        raise HTTPException(status_code=404, detail="Carreira não encontrada.")

    await db.execute(
        delete(Career).where(
            Career.id == career.id,
            Career.user_id == user.id,
        )
    )
    await db.commit()


@router.post("/{career_id}/start", response_model=CareerResponse)
async def start_career(
    career_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Career:
    career = await db.scalar(
        select(Career).where(
            Career.id == career_id,
            Career.user_id == user.id,
        )
    )
    if not career:
        raise HTTPException(status_code=404, detail="Carreira não encontrada.")

    active = await db.scalar(
        select(Career).where(
            Career.user_id == user.id,
            Career.status == CareerStatus.ATIVA,
        )
    )
    if active and active.id != career.id:
        raise HTTPException(
            status_code=409,
            detail="Finalize a carreira ativa antes de iniciar outra.",
        )

    career.status = CareerStatus.ATIVA
    await db.commit()
    await db.refresh(career)
    return career
