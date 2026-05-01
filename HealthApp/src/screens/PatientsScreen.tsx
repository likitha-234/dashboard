import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, Patient } from '../services/api';

export default function PatientsScreen() {
  const navigation = useNavigation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      setError(null);
      setPatients(await api.getPatients());
    } catch (e: any) {
      setError(e.message ?? 'Failed to load patients');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((patient) =>
      `${patient.name} ${patient.phone ?? ''} ${patient.email ?? ''} ${patient.blood_group ?? ''}`.toLowerCase().includes(q)
    );
  }, [patients, search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPatients();
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>Back</Text></TouchableOpacity>
        <View style={s.titleBlock}>
          <Text style={s.title}>Patients</Text>
          <Text style={s.subtitle}>{patients.length} total records</Text>
        </View>
      </View>

      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>Search</Text>
        <TextInput style={s.searchInput} value={search} onChangeText={setSearch} placeholder=" name, phone, email..." placeholderTextColor="#9CA3AF" />
      </View>

      {loading ? (
        <View style={s.body}><ActivityIndicator color="#2563EB" /></View>
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
        >
          {error && (
            <TouchableOpacity style={s.errorBox} onPress={fetchPatients}>
              <Text style={s.errorText}>{error}. Tap to retry.</Text>
            </TouchableOpacity>
          )}
          {filtered.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyText}>No patients found</Text></View>
          ) : (
            filtered.map((patient) => (
              <View key={patient.id} style={s.card}>
                <View style={s.avatar}><Text style={s.avatarText}>{patient.name.charAt(0)}</Text></View>
                <View style={s.info}>
                  <Text style={s.name}>{patient.name}</Text>
                  <Text style={s.meta}>{patient.phone || 'No phone'} - {patient.email || 'No email'}</Text>
                  <Text style={s.sub}>DOB: {patient.date_of_birth || 'Not added'}</Text>
                </View>
                <View style={s.bloodBadge}>
                  <Text style={s.bloodText}>{patient.blood_group || 'NA'}</Text>
                </View>
              </View>
            ))
          )}
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
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
  errorBox: { padding: 12, borderRadius: 10, backgroundColor: '#FEE2E2', marginBottom: 12 },
  errorText: { color: '#991B1B', fontSize: 13, fontWeight: '600' },
  empty: { padding: 28, alignItems: 'center' },
  emptyText: { color: '#6B7280', fontSize: 14 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#047857', fontSize: 18, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 15, color: '#111827', fontWeight: '800' },
  meta: { fontSize: 12, color: '#4B5563', marginTop: 3 },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  bloodBadge: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginLeft: 10, borderWidth: 1, borderColor: '#FCA5A5' },
  bloodText: { color: '#991B1B', fontSize: 12, fontWeight: '900' },
});
