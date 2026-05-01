from fastapi import APIRouter, Query
from typing import Optional
from datetime import date
from database import get_pool

router = APIRouter(prefix="/api/revenue", tags=["Revenue"])

@router.get("/daily")
async def get_daily_revenue(
    year:  int = Query(...),
    month: int = Query(...),
):
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT
                payment_date::text AS date,
                SUM(amount) AS total,
                SUM(CASE WHEN service_type = 'nursing'  THEN amount ELSE 0 END) AS nursing,
                SUM(CASE WHEN service_type = 'pharmacy' THEN amount ELSE 0 END) AS pharmacy,
                SUM(CASE WHEN service_type = 'homecare' THEN amount ELSE 0 END) AS homecare
            FROM revenue
            WHERE EXTRACT(YEAR  FROM payment_date) = $1
              AND EXTRACT(MONTH FROM payment_date) = $2
            GROUP BY payment_date
            ORDER BY payment_date
        """, year, month)
    return [dict(row) for row in rows]

@router.get("/")
async def get_revenue(
    date_from: Optional[date] = Query(None),
    date_to:   Optional[date] = Query(None),
):
    pool = get_pool()
    query = """
        SELECT
            TO_CHAR(payment_date, 'Mon')        AS month,
            EXTRACT(MONTH FROM payment_date)    AS month_num,
            EXTRACT(YEAR  FROM payment_date)    AS year,
            SUM(CASE WHEN service_type = 'nursing'  THEN amount ELSE 0 END) AS nursing,
            SUM(CASE WHEN service_type = 'pharmacy' THEN amount ELSE 0 END) AS pharmacy,
            SUM(CASE WHEN service_type = 'homecare' THEN amount ELSE 0 END) AS homecare,
            SUM(amount) AS total
        FROM revenue
        WHERE 1=1
    """
    conditions = []
    params     = []
    idx        = 1

    if date_from:
        conditions.append(f"payment_date >= ${idx}")
        params.append(date_from)
        idx += 1
    if date_to:
        conditions.append(f"payment_date <= ${idx}")
        params.append(date_to)
        idx += 1

    if conditions:
        query += " AND " + " AND ".join(conditions)

    query += " GROUP BY month, month_num, year ORDER BY year, month_num"

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
    return [dict(row) for row in rows]