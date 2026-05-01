import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import StatCard from '../components/StatCard';
import RevenueChart from '../components/RevenueChart';
import AppointmentCard from '../components/AppointmentCard';
import { api, StatsResponse, Appointment, Doctor, Patient } from '../services/api';
import { menuItems } from '../data/mockData';

type RootStackParamList = {
  Tabs: { screen?: 'Dashboard' | 'Appointments' | 'Profile' } | undefined;
  Patients: undefined;
  Doctors: undefined;
  Billing: undefined;
  Pharmacy: undefined;
  Calendar: undefined;
  Settings: undefined;
};

const pad = (n: number) => String(n).padStart(2, '0');
const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toDisplay = (s: string) => {
  const [y, m, d] = s.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[+m - 1]} ${d}, ${y}`;
};

type DateRange = { from: string; to: string };

const PRESETS = [
  { label: 'This month', getRange: (): DateRange => { const n = new Date(); return { from: toStr(new Date(n.getFullYear(), n.getMonth(), 1)), to: toStr(new Date(n.getFullYear(), n.getMonth() + 1, 0)) }; } },
  { label: 'Last month', getRange: (): DateRange => { const n = new Date(); return { from: toStr(new Date(n.getFullYear(), n.getMonth() - 1, 1)), to: toStr(new Date(n.getFullYear(), n.getMonth(), 0)) }; } },
  { label: 'Year to date', getRange: (): DateRange => { const n = new Date(); return { from: `${n.getFullYear()}-01-01`, to: toStr(n) }; } },
  { label: 'Last year', getRange: (): DateRange => { const y = new Date().getFullYear() - 1; return { from: `${y}-01-01`, to: `${y}-12-31` }; } },
];

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Mo','Tu','We','Th','Fr','Sa','Su'];

const parseDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

function CalendarPickerModal({ visible, title, current, onSelect, onClose }: { visible: boolean; title: string; current: string; onSelect: (d: string) => void; onClose: () => void; }) {
  const selected = parseDate(current);
  const [viewDate, setViewDate] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));

  useEffect(() => {
    if (visible) setViewDate(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [visible, current]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: React.ReactElement[] = [];

  for (let i = 0; i < firstOffset; i++) {
    cells.push(<View key={`empty-${i}`} style={dp.dayCell} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const value = toStr(new Date(year, month, day));
    const isSelected = value === current;
    cells.push(
      <TouchableOpacity
        key={value}
        style={[dp.dayCell, dp.dayButton, isSelected && dp.daySelected]}
        onPress={() => { onSelect(value); onClose(); }}
      >
        <Text style={[dp.dayText, isSelected && dp.dayTextSelected]}>{day}</Text>
      </TouchableOpacity>
    );
  }

  const shiftMonth = (amount: number) => {
    setViewDate((date) => new Date(date.getFullYear(), date.getMonth() + amount, 1));
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={dp.overlay}>
        <View style={dp.box}>
          <View style={dp.topRow}>
            <Text style={dp.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}><Text style={dp.closeText}>Close</Text></TouchableOpacity>
          </View>

          <View style={dp.monthRow}>
            <TouchableOpacity style={dp.navBtn} onPress={() => shiftMonth(-1)}>
              <Text style={dp.navText}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={dp.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
            <TouchableOpacity style={dp.navBtn} onPress={() => shiftMonth(1)}>
              <Text style={dp.navText}>{'>'}</Text>
            </TouchableOpacity>
          </View>

          <View style={dp.weekRow}>
            {DAY_NAMES.map((day) => (
              <View key={day} style={dp.dayCell}><Text style={dp.weekText}>{day}</Text></View>
            ))}
          </View>
          <View style={dp.grid}>{cells}</View>
        </View>
      </View>
    </Modal>
  );
}
const dp = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: '#fff', borderRadius: 16, padding: 18, width: 330 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  closeText: { fontSize: 13, color: '#2563EB', fontWeight: '700' },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  navBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  navText: { fontSize: 16, color: '#374151', fontWeight: '800' },
  monthTitle: { fontSize: 15, color: '#111827', fontWeight: '800' },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, height: 38, alignItems: 'center', justifyContent: 'center' },
  dayButton: { borderRadius: 10 },
  daySelected: { backgroundColor: '#2563EB' },
  weekText: { fontSize: 11, color: '#9CA3AF', fontWeight: '800' },
  dayText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  dayTextSelected: { color: '#fff', fontWeight: '900' },
});

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [menuOpen, setMenuOpen]       = useState(false);
  const [filterOpen, setFilterOpen]   = useState(false);
  const [pickingDate, setPickingDate] = useState<'from' | 'to' | null>(null);
  const [search, setSearch]           = useState('');
  const [activePreset, setActivePreset] = useState<string | null>('Year to date');
  const [dateRange, setDateRange]     = useState<DateRange>({ from: `${new Date().getFullYear()}-01-01`, to: toStr(new Date()) });
  const [pendingRange, setPendingRange] = useState<DateRange>(dateRange);
  const [stats, setStats]             = useState<StatsResponse | null>(null);
  const [todayAppts, setTodayAppts]   = useState<Appointment[]>([]);
  const [doctors, setDoctors]         = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors]   = useState<Doctor[]>([]);
  const [patients, setPatients]       = useState<Patient[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const today = toStr(new Date());
      const [statsData, apptData, docData, patientData] = await Promise.all([
        api.getStats({ date_from: dateRange.from, date_to: dateRange.to }),
        api.getAppointments({ date_from: today, date_to: today }),
        api.getDoctors(),
        api.getPatients(),
      ]);
      setStats(statsData);
      setTodayAppts(apptData);
      setAllDoctors(docData);
      setDoctors(docData.slice(0, 3));
      setPatients(patientData);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange.from, dateRange.to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleMenuNav = (label: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      if      (label === 'Dashboard') navigation.navigate('Tabs', { screen: 'Dashboard' });
      else if (label === 'Appointments') navigation.navigate('Tabs', { screen: 'Appointments' });
      else if (label === 'Patients') navigation.navigate('Patients');
      else if (label === 'Doctors')  navigation.navigate('Doctors');
      else if (label === 'Billing')  navigation.navigate('Billing');
      else if (label === 'Pharmacy') navigation.navigate('Pharmacy');
      else if (label === 'Calendar') navigation.navigate('Calendar');
      else if (label === 'Settings') navigation.navigate('Settings');
    }, 300);
  };

  const applyFilter = () => { setDateRange(pendingRange); setFilterOpen(false); };

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    const patientResults = patients
      .filter((patient) => `${patient.name} ${patient.phone ?? ''} ${patient.email ?? ''}`.toLowerCase().includes(q))
      .slice(0, 3)
      .map((patient) => ({
        id: `patient-${patient.id}`,
        type: 'Patient',
        title: patient.name,
        subtitle: patient.phone || patient.email || 'Patient record',
        route: 'Patients' as const,
      }));

    const doctorResults = allDoctors
      .filter((doctor) => `${doctor.name} ${doctor.specialty}`.toLowerCase().includes(q))
      .slice(0, 3)
      .map((doctor) => ({
        id: `doctor-${doctor.id}`,
        type: 'Doctor',
        title: doctor.name,
        subtitle: doctor.specialty,
        route: 'Doctors' as const,
      }));

    const appointmentResults = todayAppts
      .filter((appt) => `${appt.patient_name} ${appt.doctor_name} ${appt.specialty}`.toLowerCase().includes(q))
      .slice(0, 3)
      .map((appt) => ({
        id: `appt-${appt.id}`,
        type: 'Appointment',
        title: appt.patient_name,
        subtitle: `${appt.doctor_name} - ${appt.appointment_time}`,
        route: 'Appointments' as const,
      }));

    return [...patientResults, ...doctorResults, ...appointmentResults].slice(0, 6);
  }, [search, patients, allDoctors, todayAppts]);

  const openSearchResult = (route: 'Patients' | 'Doctors' | 'Appointments') => {
    setSearch('');
    if (route === 'Appointments') navigation.navigate('Tabs', { screen: 'Appointments' });
    else navigation.navigate(route);
  };

  const statCards = stats ? [
    { label: 'Total Revenue',   value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: '💰', color: '#2563EB', change: '+12%' },
    { label: 'Appointments',    value: String(stats.totalAppointments),                  icon: '📅', color: '#7C3AED', change: '+8%'  },
    { label: 'Active Patients', value: String(stats.totalPatients),                      icon: '🏥', color: '#059669', change: '+5%'  },
    { label: 'Active Doctors',  value: String(stats.activeDoctors),                      icon: '👨‍⚕️', color: '#DC2626', change: '+2%'  },
  ] : [];

  const todayLabel = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <SafeAreaView style={s.safe}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.hamburger} onPress={() => setMenuOpen(true)}>
          <View style={s.hLine} /><View style={s.hLine} /><View style={s.hLine} />
        </TouchableOpacity>
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput style={s.searchInput} value={search} onChangeText={setSearch} placeholder="Search patients, doctors..." placeholderTextColor="#9CA3AF" />
        </View>
        <TouchableOpacity style={s.avatarBtn}><Text style={{ fontSize: 20 }}>👤</Text></TouchableOpacity>
      </View>

      {search.trim().length > 0 && (
        <View style={s.searchPanel}>
          {searchResults.length === 0 ? (
            <Text style={s.noResults}>No matches found</Text>
          ) : (
            searchResults.map((result) => (
              <TouchableOpacity key={result.id} style={s.searchResult} onPress={() => openSearchResult(result.route)}>
                <View style={s.searchType}><Text style={s.searchTypeText}>{result.type}</Text></View>
                <View style={s.searchInfo}>
                  <Text style={s.searchTitle}>{result.title}</Text>
                  <Text style={s.searchSub}>{result.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* Hamburger drawer */}
      <Modal visible={menuOpen} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.drawer}>
            <View style={s.drawerHeader}>
              <View style={s.drawerAvatar}><Text style={{ fontSize: 28 }}>👨‍⚕️</Text></View>
              <View>
                <Text style={s.drawerName}>Admin Panel</Text>
                <Text style={s.drawerRole}>Healthcare Management</Text>
              </View>
            </View>
            <ScrollView>
              {menuItems.map((item) => (
                <TouchableOpacity key={item.id} style={s.menuItem} onPress={() => handleMenuNav(item.label)}>
                  <Text style={s.menuIcon}>{item.icon}</Text>
                  <Text style={s.menuLabel}>{item.label}</Text>
                  <Text style={s.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={s.logoutBtn} onPress={() => { setMenuOpen(false); Alert.alert('Logged out'); }}>
              <Text style={s.logoutText}>🚪  Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.closeBtn} onPress={() => setMenuOpen(false)}>
              <Text style={s.closeTxt}>✕ Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter sheet */}
      <Modal visible={filterOpen} transparent animationType="slide">
        <View style={f.overlay}>
          <View style={f.sheet}>
            <View style={f.handle} />
            <Text style={f.title}>Select Date Range</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={f.chipScroll}>
              {PRESETS.map((p) => (
                <TouchableOpacity key={p.label} style={[f.chip, activePreset === p.label && f.chipActive]} onPress={() => { setPendingRange(p.getRange()); setActivePreset(p.label); }}>
                  <Text style={[f.chipTxt, activePreset === p.label && f.chipTxtActive]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={f.label}>Custom range</Text>
            <View style={f.rangeRow}>
              <TouchableOpacity style={f.datePill} onPress={() => setPickingDate('from')}>
                <Text style={f.datePillLabel}>From</Text>
                <Text style={f.datePillValue}>{toDisplay(pendingRange.from)}</Text>
              </TouchableOpacity>
              <Text style={f.arrow}>→</Text>
              <TouchableOpacity style={f.datePill} onPress={() => setPickingDate('to')}>
                <Text style={f.datePillLabel}>To</Text>
                <Text style={f.datePillValue}>{toDisplay(pendingRange.to)}</Text>
              </TouchableOpacity>
            </View>
            <View style={f.preview}>
              <Text style={f.previewTxt}>📅  {toDisplay(pendingRange.from)}  –  {toDisplay(pendingRange.to)}</Text>
            </View>
            <View style={f.btnRow}>
              <TouchableOpacity style={f.cancelBtn} onPress={() => setFilterOpen(false)}><Text style={f.cancelTxt}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={f.applyBtn} onPress={applyFilter}><Text style={f.applyTxt}>Apply Filter</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {pickingDate && (
        <CalendarPickerModal
          visible title={pickingDate === 'from' ? 'Start Date' : 'End Date'}
          current={pickingDate === 'from' ? pendingRange.from : pendingRange.to}
          onSelect={(date) => { setActivePreset(null); if (pickingDate === 'from') setPendingRange(r => ({ ...r, from: date })); else setPendingRange(r => ({ ...r, to: date })); }}
          onClose={() => setPickingDate(null)}
        />
      )}

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}>
        <View style={s.greetRow}>
          <View>
            <Text style={s.greeting}>Good morning 👋</Text>
            <Text style={s.greetSub}>Here's what's happening today</Text>
          </View>
          <View style={s.dateBadge}><Text style={s.dateText}>📅 {todayLabel}</Text></View>
        </View>

        <TouchableOpacity style={s.filterBar} onPress={() => { setPendingRange(dateRange); setFilterOpen(true); }} activeOpacity={0.8}>
          <View style={s.filterLeft}>
            <Text style={s.filterIcon}>🗓️</Text>
            <View>
              <Text style={s.filterBarLabel}>Showing data for</Text>
              <Text style={s.filterBarRange}>{toDisplay(dateRange.from)}  –  {toDisplay(dateRange.to)}</Text>
            </View>
          </View>
          <View style={s.filterBtn}><Text style={s.filterBtnTxt}>Filter  ⌄</Text></View>
        </TouchableOpacity>

        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorTxt}>⚠️ {error}</Text>
            <TouchableOpacity onPress={fetchData}><Text style={s.retryTxt}>Retry</Text></TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={s.loadingTxt}>Loading dashboard...</Text>
          </View>
        ) : (
          <>
            <View style={s.statsGrid}>
              <View style={s.statsRow}>
                {statCards[0] && <StatCard item={statCards[0]} />}
                {statCards[1] && <StatCard item={statCards[1]} />}
              </View>
              <View style={s.statsRow}>
                {statCards[2] && <StatCard item={statCards[2]} />}
                {statCards[3] && <StatCard item={statCards[3]} />}
              </View>
            </View>

            <RevenueChart dateRange={dateRange} />

            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Today's Appointments</Text>
                <View style={s.countBadge}><Text style={s.countText}>{todayAppts.length}</Text></View>
              </View>
              {todayAppts.length === 0 ? (
                <View style={s.emptyBox}><Text style={s.emptyTxt}>No appointments today</Text></View>
              ) : (
                todayAppts.map((appt) => (
                  <AppointmentCard key={appt.id} item={{ id: appt.id, patient: appt.patient_name, doctor: appt.doctor_name, specialty: appt.specialty, date: appt.appointment_date, time: appt.appointment_time, status: appt.status }} />
                ))
              )}
            </View>

            <View style={s.section}>
              <Text style={s.sectionTitle}>Active Doctors</Text>
              {doctors.map((doc) => (
                <View key={doc.id} style={s.docCard}>
                  <View style={s.docAvatar}><Text style={{ fontSize: 24 }}>👨‍⚕️</Text></View>
                  <View style={s.docInfo}>
                    <Text style={s.docName}>{doc.name}</Text>
                    <Text style={s.docSpec}>{doc.specialty}</Text>
                    <Text style={s.docStats}>⭐ {doc.rating}  ·  👥 {doc.total_patients} patients</Text>
                  </View>
                  <View style={[s.availDot, { backgroundColor: doc.available ? '#10B981' : '#EF4444' }]} />
                </View>
              ))}
            </View>

            <TouchableOpacity style={s.calendarBtn} onPress={() => navigation.navigate('Calendar')}>
              <Text style={s.calendarBtnText}>📅  View Full Calendar</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const f = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  handle: { width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  chipScroll: { marginBottom: 20 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#DBEAFE', borderColor: '#2563EB' },
  chipTxt: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  chipTxtActive: { color: '#2563EB', fontWeight: '700' },
  label: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  datePill: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  datePillLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  datePillValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  arrow: { fontSize: 18, color: '#9CA3AF' },
  preview: { backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#BFDBFE' },
  previewTxt: { fontSize: 13, color: '#1D4ED8', fontWeight: '600', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
  cancelTxt: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  applyBtn: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center' },
  applyTxt: { fontSize: 15, color: '#fff', fontWeight: '700' },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  hamburger: { padding: 8, marginRight: 10 },
  hLine: { width: 22, height: 2.5, backgroundColor: '#374151', borderRadius: 2, marginVertical: 2 },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: '#111827' },
  avatarBtn: { marginLeft: 12, width: 38, height: 38, borderRadius: 19, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },
  searchPanel: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 8 },
  noResults: { color: '#6B7280', fontSize: 13, paddingVertical: 10, textAlign: 'center' },
  searchResult: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  searchType: { width: 82, paddingVertical: 4, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', marginRight: 10 },
  searchTypeText: { color: '#2563EB', fontSize: 11, fontWeight: '800' },
  searchInfo: { flex: 1 },
  searchTitle: { color: '#111827', fontSize: 14, fontWeight: '800' },
  searchSub: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row' },
  drawer: { width: '75%', backgroundColor: '#fff', paddingTop: 50, elevation: 10 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 8 },
  drawerAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },
  drawerName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  drawerRole: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  menuIcon: { fontSize: 20, width: 28 },
  menuLabel: { fontSize: 15, color: '#374151', fontWeight: '500', flex: 1 },
  menuArrow: { fontSize: 18, color: '#9CA3AF' },
  logoutBtn: { marginHorizontal: 20, marginTop: 8, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  logoutText: { fontSize: 15, color: '#DC2626', fontWeight: '600' },
  closeBtn: { alignItems: 'center', paddingVertical: 16 },
  closeTxt: { fontSize: 13, color: '#9CA3AF' },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  greetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  greeting: { fontSize: 20, fontWeight: '800', color: '#111827' },
  greetSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  dateBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  dateText: { fontSize: 12, color: '#1D4ED8', fontWeight: '600' },
  filterBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
  filterLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  filterIcon: { fontSize: 20 },
  filterBarLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  filterBarRange: { fontSize: 12, fontWeight: '700', color: '#1D4ED8', marginTop: 1 },
  filterBtn: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  filterBtnTxt: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorTxt: { fontSize: 13, color: '#991B1B', flex: 1 },
  retryTxt: { fontSize: 13, color: '#2563EB', fontWeight: '700', marginLeft: 8 },
  loadingBox: { alignItems: 'center', paddingVertical: 60 },
  loadingTxt: { fontSize: 14, color: '#6B7280', marginTop: 12 },
  statsGrid: { marginBottom: 16 },
  statsRow: { flexDirection: 'row' },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  countBadge: { backgroundColor: '#2563EB', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  countText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  emptyBox: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 20, alignItems: 'center' },
  emptyTxt: { fontSize: 13, color: '#9CA3AF' },
  docCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
  docAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  docInfo: { flex: 1 },
  docName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  docSpec: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  docStats: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  availDot: { width: 12, height: 12, borderRadius: 6 },
  calendarBtn: { backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#2563EB' },
  calendarBtnText: { color: '#2563EB', fontSize: 14, fontWeight: '700' },
});
