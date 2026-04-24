const BASE_URL = 'http://192.168.1.35:3001';

export const api = {

  getStats: async () => {
    const res = await fetch(`${BASE_URL}/api/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  getAppointments: async (filters?: {
    date_from?: string;
    date_to?: string;
    status?: string;
  }) => {
    const params = filters
      ? '?' + new URLSearchParams(filters as any).toString()
      : '';
    const res = await fetch(`${BASE_URL}/api/appointments${params}`);
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  getDoctors: async () => {
    const res = await fetch(`${BASE_URL}/api/doctors`);
    if (!res.ok) throw new Error('Failed to fetch doctors');
    return res.json();
  },

  getPatients: async () => {
    const res = await fetch(`${BASE_URL}/api/patients`);
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
  },

  getRevenue: async (filters?: {
    date_from?: string;
    date_to?: string;
  }) => {
    const params = filters
      ? '?' + new URLSearchParams(filters as any).toString()
      : '';
    const res = await fetch(`${BASE_URL}/api/revenue${params}`);
    if (!res.ok) throw new Error('Failed to fetch revenue');
    return res.json();
  },

  getDailyRevenue: async (year: number, month: number) => {
    const res = await fetch(
      `${BASE_URL}/api/revenue/daily?year=${year}&month=${month}`
    );
    if (!res.ok) throw new Error('Failed to fetch daily revenue');
    return res.json();
  },
};