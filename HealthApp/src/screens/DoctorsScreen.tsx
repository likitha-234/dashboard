import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, Doctor } from '../services/api';

export default function DoctorsScreen() {
  const navigation = useNavigation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState<'all' | 'available' | 'offline'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    try {
      setError(null);
      setDoctors(await api.getDoctors());
    } catch (e: any) {
      setError(e.message ?? 'Failed to load doctors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesSearch = !q || `${doctor.name} ${doctor.specialty}`.toLowerCase().includes(q);
      const matchesAvailability =
        availability === 'all' ||
        (availability === 'available' && doctor.available) ||
        (availability === 'offline' && !doctor.available);
      return matchesSearch && matchesAvailability;
    });
  }, [doctors, search, availability]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDoctors();
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>Back</Text></TouchableOpacity>
        <View style={s.titleBlock}>
          <Text style={s.title}>Doctors</Text>
          <Text style={s.subtitle}>{doctors.length} total records</Text>
        </View>
      </View>

      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>Search</Text>
        <TextInput style={s.searchInput} value={search} onChangeText={setSearch} placeholder="Search doctors, specialty..." placeholderTextColor="#9CA3AF" />
      </View>

      <View style={s.filters}>
        {(['all', 'available', 'offline'] as const).map((item) => (
          <TouchableOpacity key={item} style={[s.chip, availability === item && s.chipActive]} onPress={() => setAvailability(item)}>
            <Text style={[s.chipText, availability === item && s.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.body}><ActivityIndicator color="#2563EB" /></View>
      ) : (
        <ScrollView style={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}>
          {error && (
            <TouchableOpacity style={s.errorBox} onPress={fetchDoctors}>
              <Text style={s.errorText}>{error}. Tap to retry.</Text>
            </TouchableOpacity>
          )}
          {filtered.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyText}>No doctors found</Text></View>
          ) : (
            filtered.map((doctor) => (
              <View key={doctor.id} style={s.card}>
                <View style={s.avatar}><Text style={s.avatarText}>{doctor.name.replace('Dr. ', '').charAt(0)}</Text></View>
                <View style={s.info}>
                  <Text style={s.name}>{doctor.name}</Text>
                  <Text style={s.meta}>{doctor.specialty}</Text>
                  <Text style={s.sub}>Rating {doctor.rating} - {doctor.total_patients} patients</Text>
                </View>
                <View style={[s.dot, { backgroundColor: doctor.available ? '#10B981' : '#EF4444' }]} />
              </View>
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  back: { fontSize: 14, color: '#2563EB', fontWeight: '700' },
  titleBlock: { flex: 1 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 10, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  searchIcon: { color: '#6B7280', fontSize: 12, fontWeight: '700', marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: '#111827' },
  filters: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#DBEAFE', borderColor: '#2563EB' },
  chipText: { fontSize: 12, color: '#6B7280', fontWeight: '700', textTransform: 'capitalize' },
  chipTextActive: { color: '#1D4ED8' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  errorBox: { padding: 12, borderRadius: 10, backgroundColor: '#FEE2E2', marginBottom: 12 },
  errorText: { color: '#991B1B', fontSize: 13, fontWeight: '600' },
  empty: { padding: 28, alignItems: 'center' },
  emptyText: { color: '#6B7280', fontSize: 14 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#DC2626', fontSize: 18, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 15, color: '#111827', fontWeight: '800' },
  meta: { fontSize: 12, color: '#4B5563', marginTop: 3 },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  dot: { width: 12, height: 12, borderRadius: 6, marginLeft: 8 },
});
