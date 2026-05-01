import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, MonthlyRevenue } from '../services/api';

const money = (value: number) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

export default function BillingScreen() {
  const navigation = useNavigation();
  const [rows, setRows] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = useMemo(() => rows.reduce((sum, item) => sum + Number(item.total || 0), 0), [rows]);

  const fetchRevenue = useCallback(async () => {
    try {
      setError(null);
      setRows(await api.getRevenue());
    } catch (e: any) {
      setError(e.message ?? 'Failed to load billing');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRevenue();
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Billing</Text>
      </View>

      {loading ? (
        <View style={s.body}><ActivityIndicator color="#2563EB" /></View>
      ) : (
        <ScrollView
          style={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
        >
          <View style={s.totalCard}>
            <Text style={s.totalLabel}>Total revenue</Text>
            <Text style={s.totalValue}>{money(total)}</Text>
          </View>
          {error && (
            <TouchableOpacity style={s.errorBox} onPress={fetchRevenue}>
              <Text style={s.errorText}>{error}. Tap to retry.</Text>
            </TouchableOpacity>
          )}
          {rows.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyText}>No billing data found</Text></View>
          ) : (
            rows.map((item) => (
              <View key={`${item.year}-${item.month_num}`} style={s.card}>
                <View style={s.rowTop}>
                  <Text style={s.month}>{item.month} {item.year}</Text>
                  <Text style={s.amount}>{money(item.total)}</Text>
                </View>
                <View style={s.breakdown}>
                  <Text style={s.meta}>Nursing: {money(item.nursing)}</Text>
                  <Text style={s.meta}>Pharmacy: {money(item.pharmacy)}</Text>
                  <Text style={s.meta}>Homecare: {money(item.homecare)}</Text>
                </View>
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
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1, padding: 16 },
  totalCard: { backgroundColor: '#111827', borderRadius: 12, padding: 16, marginBottom: 12 },
  totalLabel: { color: '#D1D5DB', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  totalValue: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 6 },
  errorBox: { padding: 12, borderRadius: 10, backgroundColor: '#FEE2E2', marginBottom: 12 },
  errorText: { color: '#991B1B', fontSize: 13, fontWeight: '600' },
  empty: { padding: 28, alignItems: 'center' },
  emptyText: { color: '#6B7280', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  month: { color: '#111827', fontSize: 15, fontWeight: '800' },
  amount: { color: '#2563EB', fontSize: 15, fontWeight: '900' },
  breakdown: { marginTop: 10, gap: 4 },
  meta: { color: '#6B7280', fontSize: 12 },
});
