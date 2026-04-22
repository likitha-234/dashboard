import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Appointment } from '../types';

interface Props {
  item: Appointment;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: '#D1FAE5', text: '#065F46' },
  pending:   { bg: '#FEF3C7', text: '#92400E' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function AppointmentCard({ item }: Props) {
  const color = statusColors[item.status];
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{item.patient.charAt(0)}</Text>
        </View>
      </View>
      <View style={styles.middle}>
        <Text style={styles.patient}>{item.patient}</Text>
        <Text style={styles.doctor}>{item.doctor} · {item.specialty}</Text>
        <Text style={styles.time}>🕐 {item.time}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: color.bg }]}>
        <Text style={[styles.badgeText, { color: color.text }]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
  left:         { marginRight: 12 },
  avatarCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 18, fontWeight: '700', color: '#2563EB' },
  middle:       { flex: 1 },
  patient:      { fontSize: 14, fontWeight: '700', color: '#111827' },
  doctor:       { fontSize: 12, color: '#6B7280', marginTop: 2 },
  time:         { fontSize: 12, color: '#2563EB', marginTop: 4 },
  badge:        { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
});