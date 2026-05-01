from typing import Optional

from pydantic import BaseModel


class StatsResponse(BaseModel):
    totalAppointments: int
    totalPatients: int
    activeDoctors: int
    totalRevenue: float


class AppointmentResponse(BaseModel):
    id: str
    appointment_date: str
    appointment_time: str
    status: str
    patient_name: str
    doctor_name: str
    specialty: str


class DoctorResponse(BaseModel):
    id: str
    name: str
    specialty: str
    rating: float
    available: bool
    total_patients: int


class PatientResponse(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    created_at: Optional[str] = None


class RevenueMonthlyResponse(BaseModel):
    month: str
    month_num: int
    year: int
    nursing: float
    pharmacy: float
    homecare: float
    total: float


class RevenueDailyResponse(BaseModel):
    date: str
    total: float
    nursing: float
    pharmacy: float
    homecare: float


class PharmacyItemResponse(BaseModel):
    id: str
    medicine: str
    quantity: int
    price: float
