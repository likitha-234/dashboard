const BASE_URL = 'http://192.168.29.4:3000';

export interface StatsResponse {
  totalAppointments: number;
  totalPatients: number;
  activeDoctors: number;
  totalRevenue: number;
}

export interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  patient_name: string;
  doctor_name: string;
  specialty: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  available: boolean;
  total_patients: number;
}

export interface Patient {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  blood_group?: string | null;
  created_at?: string | null;
}

export interface MonthlyRevenue {
  month: string;
  month_num: number;
  year: number;
  nursing: number;
  pharmacy: number;
  homecare: number;
  total: number;
}

export type RevenuePoint = MonthlyRevenue;

export interface DailyRevenue {
  date: string;
  total: number;
  nursing: number;
  pharmacy: number;
  homecare: number;
}

export interface PharmacyItem {
  id: string;
  medicine: string;
  quantity: number;
  price: number;
}

export const api = {

  getStats: async (filters?: {
    date_from?: string;
    date_to?: string;
  }): Promise<StatsResponse> => {
    const params = filters
      ? '?' + new URLSearchParams(filters as any).toString()
      : '';
    const res = await fetch(`${BASE_URL}/api/stats/${params}`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  getAppointments: async (filters?: {
    date_from?: string;
    date_to?: string;
    status?: string;
  }): Promise<Appointment[]> => {
    const params = filters
      ? '?' + new URLSearchParams(filters as any).toString()
      : '';
    const res = await fetch(`${BASE_URL}/api/appointments/${params}`);
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  getDoctors: async (): Promise<Doctor[]> => {
    const res = await fetch(`${BASE_URL}/api/doctors/`);
    if (!res.ok) throw new Error('Failed to fetch doctors');
    return res.json();
  },

  getPatients: async (): Promise<Patient[]> => {
    const res = await fetch(`${BASE_URL}/api/patients/`);
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
  },

  getRevenue: async (filters?: {
    date_from?: string;
    date_to?: string;
  }): Promise<MonthlyRevenue[]> => {
    const params = filters
      ? '?' + new URLSearchParams(filters as any).toString()
      : '';
    const res = await fetch(`${BASE_URL}/api/revenue/${params}`);
    if (!res.ok) throw new Error('Failed to fetch revenue');
    return res.json();
  },

  getDailyRevenue: async (year: number, month: number): Promise<DailyRevenue[]> => {
    const res = await fetch(
      `${BASE_URL}/api/revenue/daily?year=${year}&month=${month}`
    );
    if (!res.ok) throw new Error('Failed to fetch daily revenue');
    return res.json();
  },

  getPharmacy: async (): Promise<PharmacyItem[]> => {
    const res = await fetch(`${BASE_URL}/api/pharmacy/`);
    if (!res.ok) throw new Error('Failed to fetch pharmacy');
    return res.json();
  },
};
