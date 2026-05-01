import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, PharmacyItem } from '../services/api';

const money = (value: number) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

export default function PharmacyScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState<PharmacyItem[]>([]);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'ok'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setError(null);
      setItems(await api.getPharmacy());
    } catch (e: any) {
      setError(e.message ?? 'Failed to load pharmacy');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !q || item.medicine.toLowerCase().includes(q);
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'low' && item.quantity <= 10) ||
        (stockFilter === 'ok' && item.quantity > 10);
      return matchesSearch && matchesStock;
    });
  }, [items, search, stockFilter]);

  const inventoryValue = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0), [items]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>Back</Text></TouchableOpacity>
        <View style={s.titleBlock}>
          <Text style={s.title}>Pharmacy</Text>
          <Text style={s.subtitle}>{items.length} medicines - {money(inventoryValue)} value</Text>
        </View>
      </View>

      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>Search</Text>
        <TextInput style={s.searchInput} value={search} onChangeText={setSearch} placeholder="Search medicines..." placeholderTextColor="#9CA3AF" />
      </View>

      <View style={s.filters}>
        {(['all', 'low', 'ok'] as const).map((item) => (
          <TouchableOpacity key={item} style={[s.chip, stockFilter === item && s.chipActive]} onPress={() => setStockFilter(item)}>
            <Text style={[s.chipText, stockFilter === item && s.chipTextActive]}>{item === 'ok' ? 'in stock' : item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.body}><ActivityIndicator color="#2563EB" /></View>
      ) : (
        <ScrollView style={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}>
          {error && (
            <TouchableOpacity style={s.errorBox} onPress={fetchItems}>
              <Text style={s.errorText}>{error}. Tap to retry.</Text>
            </TouchableOpacity>
          )}
          {filtered.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyText}>No pharmacy items found</Text></View>
          ) : (
            filtered.map((item) => {
              const low = item.quantity <= 10;
              return (
                <View key={item.id} style={s.card}>
                  <View style={s.info}>
                    <Text style={s.name}>{item.medicine}</Text>
                    <Text style={s.meta}>Price: {money(item.price)}</Text>
                    <Text style={s.sub}>Inventory value: {money(Number(item.price || 0) * Number(item.quantity || 0))}</Text>
                  </View>
                  <View style={[s.stockBadge, low && s.stockLow]}>
                    <Text style={[s.stockText, low && s.stockLowText]}>{item.quantity}</Text>
                    <Text style={[s.stockLabel, low && s.stockLowText]}>qty</Text>
                  </View>
                </View>
              );
            })
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
  info: { flex: 1 },
  name: { fontSize: 15, color: '#111827', fontWeight: '800' },
  meta: { fontSize: 12, color: '#4B5563', marginTop: 3 },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  stockBadge: { minWidth: 52, borderRadius: 12, paddingVertical: 8, alignItems: 'center', backgroundColor: '#D1FAE5', marginLeft: 12 },
  stockLow: { backgroundColor: '#FEE2E2' },
  stockText: { color: '#047857', fontSize: 16, fontWeight: '900' },
  stockLabel: { color: '#047857', fontSize: 10, fontWeight: '700' },
  stockLowText: { color: '#991B1B' },
});
