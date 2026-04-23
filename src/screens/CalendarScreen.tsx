import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Appointment {
  id: string;
  patientName: string;
  type: 'Nursing' | 'Pharmacy' | 'Homecare';
  status: 'confirmed' | 'pending' | 'cancelled';
  time: string;
  revenue: number;
}

interface DayData {
  appointments: Appointment[];
}

// ─── Mock data (replace with your real data source) ───────────────────────────
const APPOINTMENTS_BY_DATE: Record<string, DayData> = {
  '2024-01-18': {
    appointments: [
      { id: 'a1', patientName: 'Arjun Kumar',  type: 'Nursing',   status: 'confirmed', time: '09:00 AM', revenue: 2500 },
      { id: 'a2', patientName: 'Priya Sharma', type: 'Homecare',  status: 'pending',   time: '11:30 AM', revenue: 1800 },
    ],
  },
  '2024-01-19': {
    appointments: [
      { id: 'a3', patientName: 'Meena Rao',    type: 'Pharmacy',  status: 'confirmed', time: '10:00 AM', revenue: 900  },
    ],
  },
  '2024-01-25': {
    appointments: [
      { id: 'a4', patientName: 'Suresh B.',    type: 'Nursing',   status: 'confirmed', time: '02:00 PM', revenue: 3200 },
    ],
  },
  '2024-02-12': {
    appointments: [
      { id: 'a5', patientName: 'Raj Verma',    type: 'Nursing',   status: 'confirmed', time: '08:30 AM', revenue: 3000 },
      { id: 'a6', patientName: 'Kavya D.',     type: 'Homecare',  status: 'pending',   time: '03:00 PM', revenue: 1500 },
    ],
  },
  '2024-02-14': {
    appointments: [
      { id: 'a7', patientName: 'Sunita P.',    type: 'Homecare',  status: 'pending',   time: '01:00 PM', revenue: 2200 },
    ],
  },
  '2024-03-07': {
    appointments: [
      { id: 'a8', patientName: 'Vikram S.',    type: 'Pharmacy',  status: 'confirmed', time: '11:00 AM', revenue: 750  },
    ],
  },
  '2024-03-25': {
    appointments: [
      { id: 'a9', patientName: 'Kiran B.',     type: 'Pharmacy',  status: 'confirmed', time: '09:30 AM', revenue: 1100 },
    ],
  },
  '2024-04-28': {
    appointments: [
      { id: 'a10', patientName: 'Lakshmi T.', type: 'Nursing',   status: 'confirmed', time: '10:00 AM', revenue: 4000 },
      { id: 'a11', patientName: 'Ravi M.',    type: 'Homecare',  status: 'confirmed', time: '04:00 PM', revenue: 1600 },
    ],
  },
};

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Monday-based first-day offset (0 = Mon, 6 = Sun) */
function getFirstDayOffset(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

function getMonthStats(year: number, month: number) {
  const days = getDaysInMonth(year, month);
  let totalRev = 0, totalAppts = 0;
  for (let d = 1; d <= days; d++) {
    const key = dateKey(year, month, d);
    if (APPOINTMENTS_BY_DATE[key]) {
      const dayAppts = APPOINTMENTS_BY_DATE[key].appointments;
      totalAppts += dayAppts.length;
      totalRev   += dayAppts.reduce((s, a) => s + a.revenue, 0);
    }
  }
  return { totalRev, totalAppts };
}

function getYearStats(year: number) {
  let totalRev = 0, totalAppts = 0;
  for (let m = 0; m < 12; m++) {
    const s = getMonthStats(year, m);
    totalRev    += s.totalRev;
    totalAppts  += s.totalAppts;
  }
  return { totalRev, totalAppts };
}

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: '#D1FAE5', text: '#065F46' },
  pending:   { bg: '#FEF9C3', text: '#854D0E' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const TYPE_COLOR: Record<string, string> = {
  Nursing:  '#2563EB',
  Pharmacy: '#7C3AED',
  Homecare: '#16A34A',
};

// ─── Day detail modal ─────────────────────────────────────────────────────────
function DayDetailModal({
  visible,
  dateStr,
  onClose,
}: {
  visible: boolean;
  dateStr: string | null;
  onClose: () => void;
}) {
  if (!dateStr) return null;
  const dayData = APPOINTMENTS_BY_DATE[dateStr];
  const [y, m, d] = dateStr.split('-');
  const displayDate = new Date(+y, +m - 1, +d).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const totalRev = dayData?.appointments.reduce((s, a) => s + a.revenue, 0) ?? 0;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={dd.overlay}>
        <View style={dd.sheet}>
          <View style={dd.handle} />
          <Text style={dd.date}>{displayDate}</Text>

          {!dayData || dayData.appointments.length === 0 ? (
            <View style={dd.emptyBox}>
              <Text style={dd.emptyIcon}>📭</Text>
              <Text style={dd.emptyTxt}>No appointments on this day</Text>
            </View>
          ) : (
            <>
              {/* Revenue summary */}
              <View style={dd.revRow}>
                <View style={dd.revCard}>
                  <Text style={dd.revLabel}>Day Revenue</Text>
                  <Text style={dd.revVal}>₹{totalRev.toLocaleString('en-IN')}</Text>
                </View>
                <View style={dd.revCard}>
                  <Text style={dd.revLabel}>Appointments</Text>
                  <Text style={dd.revVal}>{dayData.appointments.length}</Text>
                </View>
                <View style={dd.revCard}>
                  <Text style={dd.revLabel}>Confirmed</Text>
                  <Text style={[dd.revVal, { color: '#16A34A' }]}>
                    {dayData.appointments.filter(a => a.status === 'confirmed').length}
                  </Text>
                </View>
              </View>

              {/* Appointment list */}
              <Text style={dd.listTitle}>Appointments</Text>
              {dayData.appointments.map((appt) => {
                const sc = STATUS_COLOR[appt.status];
                return (
                  <View key={appt.id} style={dd.apptCard}>
                    <View style={[dd.typeBar, { backgroundColor: TYPE_COLOR[appt.type] }]} />
                    <View style={dd.apptInfo}>
                      <Text style={dd.apptName}>{appt.patientName}</Text>
                      <Text style={dd.apptMeta}>{appt.type}  ·  {appt.time}</Text>
                    </View>
                    <View style={dd.apptRight}>
                      <Text style={dd.apptRev}>₹{appt.revenue.toLocaleString('en-IN')}</Text>
                      <View style={[dd.statusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[dd.statusTxt, { color: sc.text }]}>{appt.status}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </>
          )}

          <TouchableOpacity style={dd.closeBtn} onPress={onClose}>
            <Text style={dd.closeTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const dd = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: '85%' },
  handle:      { width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  date:        { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 14 },
  emptyBox:    { alignItems: 'center', paddingVertical: 32 },
  emptyIcon:   { fontSize: 36, marginBottom: 8 },
  emptyTxt:    { fontSize: 14, color: '#9CA3AF' },
  revRow:      { flexDirection: 'row', gap: 8, marginBottom: 16 },
  revCard:     { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  revLabel:    { fontSize: 10, color: '#9CA3AF', marginBottom: 4 },
  revVal:      { fontSize: 16, fontWeight: '700', color: '#111827' },
  listTitle:   { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  apptCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 10, marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  typeBar:     { width: 4, alignSelf: 'stretch' },
  apptInfo:    { flex: 1, padding: 10 },
  apptName:    { fontSize: 14, fontWeight: '600', color: '#111827' },
  apptMeta:    { fontSize: 11, color: '#6B7280', marginTop: 2 },
  apptRight:   { paddingRight: 10, alignItems: 'flex-end', gap: 4 },
  apptRev:     { fontSize: 13, fontWeight: '700', color: '#16A34A' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  statusTxt:   { fontSize: 10, fontWeight: '600' },
  closeBtn:    { backgroundColor: '#2563EB', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  closeTxt:    { fontSize: 15, color: '#fff', fontWeight: '700' },
});

// ─── Month card ───────────────────────────────────────────────────────────────
function MonthCard({
  year,
  monthIndex,
  expanded,
  onToggle,
  onDayPress,
}: {
  year: number;
  monthIndex: number;
  expanded: boolean;
  onToggle: () => void;
  onDayPress: (key: string) => void;
}) {
  const today = new Date();
  const stats = getMonthStats(year, monthIndex);
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const offset = getFirstDayOffset(year, monthIndex);

  // Build day cells
  const cells: JSX.Element[] = [];
  for (let i = 0; i < offset; i++) {
    cells.push(<View key={`e${i}`} style={mc.cell} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dow     = new Date(year, monthIndex, d).getDay();
    const isWknd  = dow === 0 || dow === 6;
    const isToday = today.getFullYear() === year && today.getMonth() === monthIndex && today.getDate() === d;
    const key     = dateKey(year, monthIndex, d);
    const hasAppt = !!APPOINTMENTS_BY_DATE[key];

    cells.push(
      <TouchableOpacity
        key={d}
        style={mc.cell}
        onPress={() => onDayPress(key)}
        activeOpacity={hasAppt ? 0.6 : 0.9}
      >
        <View style={[
          mc.dayInner,
          isToday  && mc.todayInner,
          hasAppt  && !isToday && mc.hasApptInner,
        ]}>
          <Text style={[
            mc.dayTxt,
            isWknd   && mc.weekendTxt,
            isToday  && mc.todayTxt,
            hasAppt  && !isToday && mc.hasApptTxt,
          ]}>
            {d}
          </Text>
          {hasAppt && (
            <View style={[mc.dot, isToday && mc.dotWhite]} />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={mc.card}>
      {/* Header */}
      <TouchableOpacity style={mc.header} onPress={onToggle} activeOpacity={0.7}>
        <View style={mc.headerLeft}>
          <Text style={mc.monthName}>{MONTHS[monthIndex]}</Text>
          {stats.totalAppts > 0 && (
            <View style={mc.apptBadge}>
              <Text style={mc.apptBadgeTxt}>{stats.totalAppts} appt{stats.totalAppts > 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>
        <View style={mc.headerRight}>
          {stats.totalRev > 0 && (
            <Text style={mc.revTxt}>₹{stats.totalRev.toLocaleString('en-IN')}</Text>
          )}
          <Text style={mc.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {/* Calendar grid — only when expanded */}
      {expanded && (
        <>
          {/* Day headers */}
          <View style={mc.dayHeaderRow}>
            {DAY_LABELS.map((l) => (
              <View key={l} style={mc.cell}>
                <Text style={mc.dayHeaderTxt}>{l}</Text>
              </View>
            ))}
          </View>

          {/* Day cells */}
          <View style={mc.grid}>{cells}</View>

          {/* Hint */}
          <Text style={mc.hint}>Tap a date to see appointments</Text>
        </>
      )}
    </View>
  );
}

const mc = StyleSheet.create({
  card:          { backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#F9FAFB', borderBottomWidth: 0 },
  headerLeft:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  monthName:     { fontSize: 15, fontWeight: '700', color: '#111827' },
  apptBadge:     { backgroundColor: '#DBEAFE', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  apptBadgeTxt:  { fontSize: 11, color: '#1D4ED8', fontWeight: '600' },
  revTxt:        { fontSize: 12, fontWeight: '700', color: '#16A34A' },
  chevron:       { fontSize: 11, color: '#9CA3AF' },
  dayHeaderRow:  { flexDirection: 'row', paddingHorizontal: 8, paddingTop: 10 },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingBottom: 8 },
  cell:          { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 },
  dayHeaderTxt:  { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  dayInner:      { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
  todayInner:    { backgroundColor: '#2563EB' },
  hasApptInner:  { backgroundColor: '#DBEAFE' },
  dayTxt:        { fontSize: 12, color: '#374151' },
  weekendTxt:    { color: '#DC2626' },
  todayTxt:      { color: '#fff', fontWeight: '700' },
  hasApptTxt:    { color: '#1D4ED8', fontWeight: '600' },
  dot:           { width: 4, height: 4, borderRadius: 2, backgroundColor: '#2563EB', marginTop: 1 },
  dotWhite:      { backgroundColor: '#fff' },
  hint:          { fontSize: 10, color: '#9CA3AF', textAlign: 'center', paddingBottom: 8 },
});

// ─── Main CalendarScreen ──────────────────────────────────────────────────────
export default function CalendarScreen() {
  const navigation = useNavigation();
  const currentYear = new Date().getFullYear();
  const [year, setYear]               = useState(currentYear);
  const [expandedMonths, setExpanded] = useState<Set<number>>(new Set([new Date().getMonth()]));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayModalOpen, setDayModal]   = useState(false);

  const yearStats = getYearStats(year);

  const toggleMonth = (m: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });
  };

  const handleDayPress = (key: string) => {
    setSelectedDay(key);
    setDayModal(true);
  };

  const expandAll   = () => setExpanded(new Set([0,1,2,3,4,5,6,7,8,9,10,11]));
  const collapseAll = () => setExpanded(new Set());

  return (
    <SafeAreaView style={{flex:1}}>
      {/* Header */}
      <View style={cs.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={cs.backBtn}>
          <Text style={cs.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={cs.title}>Calendar</Text>
        <View style={cs.yearNav}>
          <TouchableOpacity onPress={() => { setYear(y => y - 1); setExpanded(new Set()); }} style={cs.navBtn}>
            <Text style={cs.navBtnTxt}>‹</Text>
          </TouchableOpacity>
          <Text style={cs.yearTxt}>{year}</Text>
          <TouchableOpacity onPress={() => { setYear(y => y + 1); setExpanded(new Set()); }} style={cs.navBtn}>
            <Text style={cs.navBtnTxt}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={{ paddingBottom: 200 }}
  showsVerticalScrollIndicator={false}
>

        {/* Stats row */}
        <View style={cs.statsRow}>
          <View style={cs.statItem}>
            <Text style={cs.statIcon}>💰</Text>
            <View>
              <Text style={cs.statVal}>₹{(yearStats.totalRev / 100000).toFixed(1)}L</Text>
              <Text style={cs.statLbl}>Total Revenue</Text>
            </View>
          </View>
          <View style={cs.statItem}>
            <Text style={cs.statIcon}>📅</Text>
            <View>
              <Text style={cs.statVal}>{yearStats.totalAppts}</Text>
              <Text style={cs.statLbl}>Appointments</Text>
            </View>
          </View>
          <View style={cs.statItem}>
            <Text style={cs.statIcon}>✅</Text>
            <View>
              <Text style={[cs.statVal, { color: '#16A34A' }]}>
                {Object.values(APPOINTMENTS_BY_DATE)
                  .flatMap(d => d.appointments)
                  .filter(a => a.status === 'confirmed').length}
              </Text>
              <Text style={cs.statLbl}>Confirmed</Text>
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={cs.legend}>
          <View style={cs.legendItem}><View style={[cs.legendDot, { backgroundColor: '#2563EB' }]} /><Text style={cs.legendTxt}>Today</Text></View>
          <View style={cs.legendItem}><View style={[cs.legendDot, { backgroundColor: '#BFDBFE' }]} /><Text style={cs.legendTxt}>Has appointment</Text></View>
          <View style={cs.legendItem}><View style={[cs.legendDot, { backgroundColor: '#DC2626' }]} /><Text style={cs.legendTxt}>Weekend</Text></View>
        </View>

        {/* Expand / Collapse all */}
        <View style={cs.expandRow}>
          <TouchableOpacity onPress={expandAll} style={cs.expandBtn}>
            <Text style={cs.expandBtnTxt}>Expand all</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={collapseAll} style={cs.expandBtn}>
            <Text style={cs.expandBtnTxt}>Collapse all</Text>
          </TouchableOpacity>
        </View>

        {/* Month cards */}
        {Array.from({ length: 12 }, (_, i) => (
          <MonthCard
            key={i}
            year={year}
            monthIndex={i}
            expanded={expandedMonths.has(i)}
            onToggle={() => toggleMonth(i)}
            onDayPress={handleDayPress}
          />
        ))}

        
      </ScrollView>

      {/* Day detail modal */}
      <DayDetailModal
        visible={dayModalOpen}
        dateStr={selectedDay}
        onClose={() => setDayModal(false)}
      />
    </SafeAreaView>
  );
}

const cs = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#F1F5F9' },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn:      { marginRight: 10 },
  backTxt:      { fontSize: 14, color: '#2563EB', fontWeight: '600' },
  title:        { fontSize: 17, fontWeight: '700', color: '#111827', flex: 1 },
  yearNav:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBtn:       { width: 30, height: 30, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  navBtnTxt:    { fontSize: 16, color: '#374151', fontWeight: '600' },
  yearTxt:      { fontSize: 15, fontWeight: '700', color: '#111827', minWidth: 40, textAlign: 'center' },
  scroll:       {
  flex: 1,
  paddingHorizontal: 16,
  paddingTop: 16
},
  statsRow:     { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  statItem:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  statIcon:     { fontSize: 20 },
  statVal:      { fontSize: 15, fontWeight: '700', color: '#111827' },
  statLbl:      { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  legend:       { flexDirection: 'row', gap: 14, marginBottom: 12 },
  legendItem:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:    { width: 10, height: 10, borderRadius: 5 },
  legendTxt:    { fontSize: 11, color: '#6B7280' },
  expandRow:    { flexDirection: 'row', gap: 8, marginBottom: 12, justifyContent: 'flex-end' },
  expandBtn:    { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  expandBtnTxt: { fontSize: 12, color: '#374151', fontWeight: '500' },
});