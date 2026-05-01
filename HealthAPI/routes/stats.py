from fastapi import APIRouter, Query
from typing import Optional
from datetime import date
from database import get_pool

router = APIRouter(prefix="/api/stats", tags=["Stats"])

@router.get("/")
async def get_stats(
    date_from: Optional[date] = Query(None),
    date_to:   Optional[date] = Query(None),
):
    pool = get_pool()
    async with pool.acquire() as conn:

        appt_query  = "SELECT COUNT(*) FROM appointments WHERE 1=1"
        appt_params = []
        idx = 1
        if date_from:
            appt_query += f" AND appointment_date >= ${idx}"
            appt_params.append(date_from)
            idx += 1
        if date_to:
            appt_query += f" AND appointment_date <= ${idx}"
            appt_params.append(date_to)
            idx += 1

        rev_query  = "SELECT COALESCE(SUM(amount), 0) AS total FROM revenue WHERE 1=1"
        rev_params = []
        idx2 = 1
        if date_from:
            rev_query += f" AND payment_date >= ${idx2}"
            rev_params.append(date_from)
            idx2 += 1
        if date_to:
            rev_query += f" AND payment_date <= ${idx2}"
            rev_params.append(date_to)
            idx2 += 1

        patient_query = "SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE 1=1"
        patient_params = []
        idx3 = 1
        if date_from:
            patient_query += f" AND appointment_date >= ${idx3}"
            patient_params.append(date_from)
            idx3 += 1
        if date_to:
            patient_query += f" AND appointment_date <= ${idx3}"
            patient_params.append(date_to)
            idx3 += 1

        doctor_query = """
            SELECT COUNT(DISTINCT a.doctor_id)
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            WHERE d.available = true
        """
        doctor_params = []
        idx4 = 1
        if date_from:
            doctor_query += f" AND a.appointment_date >= ${idx4}"
            doctor_params.append(date_from)
            idx4 += 1
        if date_to:
            doctor_query += f" AND a.appointment_date <= ${idx4}"
            doctor_params.append(date_to)
            idx4 += 1

        appt_count = await conn.fetchval(appt_query, *appt_params)
        pat_count  = await conn.fetchval(patient_query, *patient_params)
        doc_count  = await conn.fetchval(doctor_query, *doctor_params)
        total_rev  = await conn.fetchval(rev_query, *rev_params)

    return {
        "totalAppointments": int(appt_count),
        "totalPatients":     int(pat_count),
        "activeDoctors":     int(doc_count),
        "totalRevenue":      float(total_rev),
    }
