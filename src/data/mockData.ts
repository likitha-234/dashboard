import { StatItem, Appointment, RevenueData, Doctor } from '../types';

export const stats: StatItem[] = [
  { label: 'Total Revenue',    value: '₹4,28,500', icon: '💰', color: '#2563EB', change: '+12%' },
  { label: 'Appointments',     value: '284',        icon: '📅', color: '#7C3AED', change: '+8%'  },
  { label: 'Active Patients',  value: '1,240',      icon: '🏥', color: '#059669', change: '+5%'  },
  { label: 'Staff on Duty',    value: '38',         icon: '👨‍⚕️', color: '#DC2626', change: '-2%'  },
];

export const revenueData: RevenueData[] = [
  { month: 'Jan', nursing: 42000, pharmacy: 31000, homecare: 18000 },
  { month: 'Feb', nursing: 48000, pharmacy: 35000, homecare: 22000 },
  { month: 'Mar', nursing: 45000, pharmacy: 38000, homecare: 25000 },
  { month: 'Apr', nursing: 53000, pharmacy: 42000, homecare: 28000 },
  { month: 'May', nursing: 58000, pharmacy: 45000, homecare: 32000 },
  { month: 'Jun', nursing: 62000, pharmacy: 48000, homecare: 35000 },
];

export const appointments: Appointment[] = [
  { id: '1', patient: 'Arjun Kumar',    doctor: 'Dr. Priya Sharma', specialty: 'Cardiology',   date: '2024-01-18', time: '09:00 AM', status: 'confirmed' },
  { id: '2', patient: 'Meena Rao',      doctor: 'Dr. Rajan Mehta',  specialty: 'Neurology',    date: '2024-01-18', time: '10:30 AM', status: 'pending'   },
  { id: '3', patient: 'Suresh Patil',   doctor: 'Dr. Anita Rao',    specialty: 'Dermatology',  date: '2024-01-18', time: '11:00 AM', status: 'confirmed' },
  { id: '4', patient: 'Kavya Nair',     doctor: 'Dr. Priya Sharma', specialty: 'Cardiology',   date: '2024-01-18', time: '02:00 PM', status: 'cancelled' },
  { id: '5', patient: 'Rohit Verma',    doctor: 'Dr. Rajan Mehta',  specialty: 'Neurology',    date: '2024-01-19', time: '09:30 AM', status: 'confirmed' },
];

export const doctors: Doctor[] = [
  { id: '1', name: 'Dr. Priya Sharma', specialty: 'Cardiologist',  rating: 4.9, patients: 128, available: true  },
  { id: '2', name: 'Dr. Rajan Mehta',  specialty: 'Neurologist',   rating: 4.7, patients: 95,  available: true  },
  { id: '3', name: 'Dr. Anita Rao',    specialty: 'Dermatologist', rating: 4.8, patients: 110, available: false },
];

export const menuItems = [
    { id: '1', label: 'Dashboard', icon: '🏠' },
    { id: '2', label: 'Appointments', icon: '📅' },
    { id: '3', label: 'Patients', icon: '👥' },
    { id: '4', label: 'Doctors', icon: '👨‍⚕️' },
    { id: '5', label: 'Reports', icon: '📊' },
    { id: '6', label: 'Calendar', icon: '🗓️' },   // ← ADD THIS
    { id: '7', label: 'Billing', icon: '💳' },
    { id: '8', label: 'Pharmacy', icon: '💊' },
    { id: '9', label: 'Settings', icon: '⚙️' },
  ];