from fastapi import APIRouter
from database import get_pool

router = APIRouter(prefix="/api/pharmacy", tags=["Pharmacy"])

@router.get("/")
async def get_pharmacy():
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT * FROM pharmacy ORDER BY medicine ASC
        """)
    return [dict(row) for row in rows]