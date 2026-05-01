from fastapi import APIRouter
from database import get_pool

router = APIRouter(prefix="/api/doctors", tags=["Doctors"])

@router.get("/")
async def get_doctors():
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT
                d.id,
                d.name,
                d.specialty,
                d.rating,
                d.available,
                COUNT(a.id) AS total_patients
            FROM doctors d
            LEFT JOIN appointments a ON d.id = a.doctor_id
            GROUP BY d.id
            ORDER BY d.rating DESC
        """)
    return [dict(row) for row in rows]