import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SETTINGS = [
  { id: 'profile', title: 'Profile', detail: 'Admin account and contact details' },
  { id: 'notifications', title: 'Notifications', detail: 'Appointment alerts and billing reminders' },
  { id: 'security', title: 'Security', detail: 'Password, sessions, and access control' },
  { id: 'database', title: 'Database', detail: 'Connection and backup preferences' },
  { id: 'reports', title: 'Reports', detail: 'Export defaults and dashboard summaries' },
  { id: 'support', title: 'Support', detail: 'Help desk and system information' },
];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SETTINGS;
    return SETTINGS.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(q));
  }, [search]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>Back</Text></TouchableOpacity>
        <View style={s.titleBlock}>
          <Text style={s.title}>Settings</Text>
          <Text style={s.subtitle}>System preferences</Text>
        </View>
      </View>

      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>Search</Text>
        <TextInput style={s.searchInput} value={search} onChangeText={setSearch} placeholder="Search settings..." placeholderTextColor="#9CA3AF" />
      </View>

      <ScrollView style={s.scroll}>
        <View style={s.summary}>
          <Text style={s.summaryLabel}>HealthApp</Text>
          <Text style={s.summaryTitle}>Admin settings</Text>
          <Text style={s.summaryText}>Manage account, notifications, security, and reporting preferences.</Text>
        </View>

        {filtered.map((item) => (
          <TouchableOpacity key={item.id} style={s.card} activeOpacity={0.75}>
            <View style={s.info}>
              <Text style={s.name}>{item.title}</Text>
              <Text style={s.meta}>{item.detail}</Text>
            </View>
            <Text style={s.chevron}>{'>'}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
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
  scroll: { flex: 1, paddingHorizontal: 16 },
  summary: { backgroundColor: '#111827', borderRadius: 12, padding: 16, marginBottom: 12 },
  summaryLabel: { color: '#BFDBFE', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  summaryTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 6 },
  summaryText: { color: '#D1D5DB', fontSize: 13, marginTop: 6, lineHeight: 18 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  info: { flex: 1 },
  name: { fontSize: 15, color: '#111827', fontWeight: '800' },
  meta: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  chevron: { color: '#9CA3AF', fontSize: 22, fontWeight: '700', marginLeft: 10 },
});
