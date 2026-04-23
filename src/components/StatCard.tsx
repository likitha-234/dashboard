import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatItem } from '../types';

interface Props {
  item: StatItem;
}

export default function StatCard({ item }: Props) {
  const isPositive = item.change.startsWith('+');

  return (
    <View style={styles.card}>
      {/* Top row: icon + change badge */}
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: item.color + '18' }]}>
          <Text style={styles.icon}>{item.icon}</Text>
        </View>
        <View style={[
          styles.changeBadge,
          { backgroundColor: isPositive ? '#D1FAE5' : '#FEE2E2' },
        ]}>
          <Text style={[
            styles.changeTxt,
            { color: isPositive ? '#065F46' : '#991B1B' },
          ]}>
            {item.change}
          </Text>
        </View>
      </View>

      {/* Value */}
      <Text style={[styles.value, { color: item.color }]}>{item.value}</Text>

      {/* Label */}
      <Text style={styles.label}>{item.label}</Text>

      {/* Bottom accent line */}
      <View style={[styles.accent, { backgroundColor: item.color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card:        {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flex: 1,
    margin: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  topRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconWrap:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  icon:        { fontSize: 18 },
  changeBadge: { borderRadius: 20, paddingHorizontal: 7, paddingVertical: 3 },
  changeTxt:   { fontSize: 11, fontWeight: '700' },
  value:       { fontSize: 22, fontWeight: '800', marginBottom: 3 },
  label:       { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  accent:      { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
});