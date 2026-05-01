import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { api, Appointment } from '../services/api';

const statusColors: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: '#D1FAE5', text: '#065F46' },
  pending: { bg: '#FEF3C7', text: '#92400E' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const toDisplayDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function AppointmentsScreen() {
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setError(null);
      setAppointments(await api.getAppointments());
    } catch (e: any) {
      setError(e.message ?? 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments.filter((item) => {
      const matchesStatus = status === 'all' || item.status === status;
      const haystack = `${item.patient_name} ${item.doctor_name} ${item.specialty} ${item.appointment_date}`.toLowerCase();
      return matchesStatus && (!q || haystack.includes(q));
    });
  }, [appointments, search, status]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('Dashboard' as never)}>
          <Text style={s.backText}>Back</Text>
        </TouchableOpacity>
        <View style={s.titleBlock}>
          <Text style={s.title}>Appointments</Text>
          <Text style={s.subtitle}>{appointments.length} total records</Text>
        </View>
        <TouchableOpacity style={s.refreshBtn} onPress={fetchAppointments}>
          <Text style={s.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>Search</Text>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="patients, doctors, specialty..."
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={s.filters}>
        {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((item) => (
          <TouchableOpacity
            key={item}
            style={[s.chip, status === item && s.chipActive]}
            onPress={() => setStatus(item)}
          >
            <Text style={[s.chipText, status === item && s.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color="#2563EB" /></View>
      ) : (
        <ScrollView
          style={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
        >
          {error && (
            <TouchableOpacity style={s.errorBox} onPress={fetchAppointments}>
              <Text style={s.errorText}>{error}. Tap to retry.</Text>
            </TouchableOpacity>
          )}

          {filtered.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyText}>No appointments found</Text></View>
          ) : (
            filtered.map((item) => {
              const color = statusColors[item.status] ?? statusColors.pending;
              return (
                <View key={item.id} style={s.card}>
                  <View style={s.avatar}><Text style={s.avatarText}>{item.patient_name.charAt(0)}</Text></View>
                  <View style={s.info}>
                    <Text style={s.name}>{item.patient_name}</Text>
                    <Text style={s.meta}>{item.doctor_name} - {item.specialty}</Text>
                    <Text style={s.sub}>{toDisplayDate(item.appointment_date)} at {item.appointment_time}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: color.bg }]}>
                    <Text style={[s.badgeText, { color: color.text }]}>{item.status}</Text>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 88 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { marginRight: 12 },
  backText: { fontSize: 14, color: '#2563EB', fontWeight: '800' },
  titleBlock: { flex: 1 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  refreshBtn: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  refreshText: { color: '#2563EB', fontSize: 12, fontWeight: '800' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 10, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  searchIcon: { color: '#6B7280', fontSize: 12, fontWeight: '700', marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: '#111827' },
  filters: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#DBEAFE', borderColor: '#2563EB' },
  chipText: { fontSize: 12, color: '#6B7280', fontWeight: '700', textTransform: 'capitalize' },
  chipTextActive: { color: '#1D4ED8' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  errorBox: { padding: 12, borderRadius: 10, backgroundColor: '#FEE2E2', marginBottom: 12 },
  errorText: { color: '#991B1B', fontSize: 13, fontWeight: '600' },
  empty: { padding: 28, alignItems: 'center' },
  emptyText: { color: '#6B7280', fontSize: 14 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#2563EB', fontSize: 18, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 15, color: '#111827', fontWeight: '800' },
  meta: { fontSize: 12, color: '#4B5563', marginTop: 3 },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  badge: { borderRadius: 14, paddingHorizontal: 9, paddingVertical: 4, marginLeft: 8 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'capitalize' },
});
