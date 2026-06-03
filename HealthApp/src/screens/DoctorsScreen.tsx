import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { api } from '../services/api';

export default function DoctorsScreen() {
  const navigation = useNavigation();
  const [doctors,  setDoctors]  = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [showAvail, setShowAvail] = useState(false);

  useEffect(() => { fetchDoctors(); }, []);

  useEffect(() => {
    let result = doctors;
    if (showAvail) result = result.filter((d) => d.available);
    if (search)    result = result.filter((d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, showAvail, doctors]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await api.getDoctors();
      setDoctors(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const specialtyColors: Record<string, string> = {
    'Cardiologist':  '#EF4444',
    'Neurologist':   '#8B5CF6',
    'Dermatologist': '#F59E0B',
    'Orthopedic':    '#10B981',
    'Pediatrician':  '#3B82F6',
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Doctors</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={fetchDoctors}>
          <Text>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Summary bar */}
      <View style={s.summaryBar}>
        <Text style={s.summaryTxt}>
          Total: <Text style={s.summaryNum}>{doctors.length}</Text>  ·  Available: <Text style={[s.summaryNum, { color: '#059669' }]}>{doctors.filter((d) => d.available).length}</Text>
        </Text>
      </View>

      {/* Search + filter */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search by name or specialty..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <View style={s.filterRow}>
        <TouchableOpacity
          style={[s.filterBtn, showAvail && s.filterBtnActive]}
          onPress={() => setShowAvail(!showAvail)}
        >
          <Text style={[s.filterTxt, showAvail && s.filterTxtActive]}>
            ✅ Available only
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={s.loadingTxt}>Loading doctors...</Text>
        </View>
      ) : (
        <ScrollView
          style={[s.scroll, { minHeight: '100%' }]}
          scrollEnabled={true}
          contentContainerStyle={[s.scrollContent, { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filtered.map((doc) => (
            <View key={doc.id} style={s.card}>
              <View style={s.avatar}>
                <Text style={{ fontSize: 28 }}>👨‍⚕️</Text>
              </View>
              <View style={s.info}>
                <Text style={s.name}>{doc.name}</Text>
                <View style={s.specRow}>
                  <View style={[s.specBadge, { backgroundColor: specialtyColors[doc.specialty] ?? '#6B7280' }]}>
                    <Text style={s.specTxt}>{doc.specialty}</Text>
                  </View>
                </View>
                <Text style={s.sub}>
                  ⭐ {Number(doc.rating).toFixed(1)}  ·  👥 {doc.total_patients} patients
                </Text>
              </View>
              <View style={s.rightCol}>
                <View style={[s.availBadge, { backgroundColor: doc.available ? '#D1FAE5' : '#FEE2E2' }]}>
                  <Text style={[s.availTxt, { color: doc.available ? '#065F46' : '#991B1B' }]}>
                    {doc.available ? 'Available' : 'Busy'}
                  </Text>
                </View>
                <View style={[s.dot, { backgroundColor: doc.available ? '#10B981' : '#EF4444' }]} />
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, minHeight: '100%', backgroundColor: '#F1F5F9' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  back:           { fontSize: 20, color: '#2563EB', fontWeight: '600' },
  title:          { fontSize: 18, fontWeight: '700', color: '#111827' },
  refreshBtn:     { padding: 4 },
  summaryBar:     { backgroundColor: '#EFF6FF', paddingHorizontal: 16, paddingVertical: 10 },
  summaryTxt:     { fontSize: 13, color: '#374151' },
  summaryNum:     { fontWeight: '700', color: '#2563EB' },
  searchWrap:     { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  searchIcon:     { fontSize: 14, marginRight: 8 },
  searchInput:    { flex: 1, fontSize: 13, color: '#111827' },
  filterRow:      { paddingHorizontal: 16, marginBottom: 12 },
  filterBtn:      { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6' },
  filterBtnActive:{ backgroundColor: '#2563EB' },
  filterTxt:      { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  filterTxtActive:{ color: '#fff' },
  scroll:         { flex: 1 },
  scrollContent:  { paddingHorizontal: 16, paddingBottom: 40 },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt:     { fontSize: 14, color: '#6B7280' },
  card:           { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
  avatar:         { width: 52, height: 52, borderRadius: 26, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info:           { flex: 1 },
  name:           { fontSize: 15, fontWeight: '700', color: '#111827' },
  specRow:        { flexDirection: 'row', marginTop: 4 },
  specBadge:      { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  specTxt:        { fontSize: 10, color: '#fff', fontWeight: '700' },
  sub:            { fontSize: 12, color: '#6B7280', marginTop: 4 },
  rightCol:       { alignItems: 'center', gap: 6 },
  availBadge:     { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  availTxt:       { fontSize: 10, fontWeight: '700' },
  dot:            { width: 10, height: 10, borderRadius: 5 },
});