from fastapi import APIRouter, Query
from typing import Optional
from datetime import date
from database import get_pool

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

@router.get("/")
async def get_appointments(
    date_from: Optional[date] = Query(None),
    date_to:   Optional[date] = Query(None),
    status:    Optional[str]  = Query(None),
):
    pool = get_pool()
    query = """
        SELECT
            a.id,
            a.appointment_date::text,
            a.appointment_time::text,
            a.status,
            p.name AS patient_name,
            d.name AS doctor_name,
            d.specialty
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors  d ON a.doctor_id  = d.id
        WHERE 1=1
    """
    conditions = []
    params     = []
    idx        = 1

    if date_from:
        conditions.append(f"a.appointment_date >= ${idx}")
        params.append(date_from)
        idx += 1
    if date_to:
        conditions.append(f"a.appointment_date <= ${idx}")
        params.append(date_to)
        idx += 1
    if status:
        conditions.append(f"a.status = ${idx}")
        params.append(status)
        idx += 1

    if conditions:
        query += " AND " + " AND ".join(conditions)

    query += " ORDER BY a.appointment_date DESC, a.appointment_time ASC"

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
    return [dict(row) for row in rows]