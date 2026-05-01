from fastapi import APIRouter
from database import get_pool

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.get("/")
async def get_patients():
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT
                id,
                name,
                email,
                phone,
                date_of_birth::text,
                blood_group,
                created_at::text
            FROM patients
            ORDER BY created_at DESC
        """)
    return [dict(row) for row in rows]