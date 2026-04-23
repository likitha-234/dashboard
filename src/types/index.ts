export interface StatItem {
  label: string;
  value: string;
  icon: string;
  color: string;
  change: string;
}

export interface Appointment {
  id: string;
  patient: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface RevenueData {
  month: string;
  nursing: number;
  pharmacy: number;
  homecare: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  patients: number;
  available: boolean;
}