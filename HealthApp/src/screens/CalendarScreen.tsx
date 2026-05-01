import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { api, Appointment, DailyRevenue } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOffset(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

// ─── Day detail modal ─────────────────────────────────────────────────────────
function DayDetailModal({
  visible, dateStr, appointments, dailyRevenue, loadingDay, onClose,
}: {
  visible: boolean;
  dateStr: string | null;
  appointments: Appointment[];
  dailyRevenue: DailyRevenue | null;
  loadingDay: boolean;
  onClose: () => void;
}) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-');
  const displayDate = new Date(+y, +m - 1, +d).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={dd.overlay}>
        <View style={dd.sheet}>
          <View style={dd.handle} />
          <Text style={dd.date}>{displayDate}</Text>

          {loadingDay ? (
            <View style={dd.loadingBox}>
              <ActivityIndicator color="#2563EB" />
            </View>
          ) : (
            <>
              {/* Revenue + stats summary */}
              <View style={dd.revRow}>
                <View style={dd.revCard}>
                  <Text style={dd.revLabel}>Day Revenue</Text>
                  <Text style={dd.revVal}>
                    ₹{(dailyRevenue?.total ?? 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={dd.revCard}>
                  <Text style={dd.revLabel}>Appointments</Text>
                  <Text style={dd.revVal}>{appointments.length}</Text>
                </View>
                <View style={dd.revCard}>
                  <Text style={dd.revLabel}>Confirmed</Text>
                  <Text style={[dd.revVal, { color: '#16A34A' }]}>
                    {appointments.filter(a => a.status === 'confirmed').length}
                  </Text>
                </View>
              </View>

              {/* Revenue breakdown */}
              {dailyRevenue && (
                <View style={dd.breakdownRow}>
                  {(['nursing','pharmacy','homecare'] as const).map((k) => (
                    <View key={k} style={dd.breakdownItem}>
                      <View style={[dd.breakdownDot, { backgroundColor: TYPE_COLOR[k.charAt(0).toUpperCase() + k.slice(1)] }]} />
                      <Text style={dd.breakdownLbl}>{k.charAt(0).toUpperCase() + k.slice(1)}</Text>
                      <Text style={dd.breakdownVal}>₹{(dailyRevenue[k] ?? 0).toLocaleString('en-IN')}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Appointment list */}
              {appointments.length === 0 ? (
                <View style={dd.emptyBox}>
                  <Text style={dd.emptyIcon}>📭</Text>
                  <Text style={dd.emptyTxt}>No appointments on this day</Text>
                </View>
              ) : (
                <>
                  <Text style={dd.listTitle}>Appointments</Text>
                  {appointments.map((appt) => {
                    const sc = STATUS_COLOR[appt.status] ?? STATUS_COLOR.pending;
                    const typeColor = TYPE_COLOR[appt.specialty] ?? '#6B7280';
                    return (
                      <View key={appt.id} style={dd.apptCard}>
                        <View style={[dd.typeBar, { backgroundColor: typeColor }]} />
                        <View style={dd.apptInfo}>
                          <Text style={dd.apptName}>{appt.patient_name}</Text>
                          <Text style={dd.apptMeta}>{appt.specialty}  ·  {appt.appointment_time}</Text>
                          <Text style={dd.apptDoctor}>{appt.doctor_name}</Text>
                        </View>
                        <View style={[dd.statusBadge, { backgroundColor: sc.bg }]}>
                          <Text style={[dd.statusTxt, { color: sc.text }]}>{appt.status}</Text>
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
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
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: '85%' },
  handle:       { width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  date:         { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 14 },
  loadingBox:   { alignItems: 'center', paddingVertical: 40 },
  revRow:       { flexDirection: 'row', gap: 8, marginBottom: 12 },
  revCard:      { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  revLabel:     { fontSize: 10, color: '#9CA3AF', marginBottom: 4 },
  revVal:       { fontSize: 16, fontWeight: '700', color: '#111827' },
  breakdownRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  breakdownItem:{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLbl: { fontSize: 10, color: '#6B7280', flex: 1 },
  breakdownVal: { fontSize: 11, fontWeight: '700', color: '#111827' },
  listTitle:    { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  apptCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 10, marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  typeBar:      { width: 4, alignSelf: 'stretch' },
  apptInfo:     { flex: 1, padding: 10 },
  apptName:     { fontSize: 14, fontWeight: '600', color: '#111827' },
  apptMeta:     { fontSize: 11, color: '#6B7280', marginTop: 2 },
  apptDoctor:   { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  statusBadge:  { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginRight: 10 },
  statusTxt:    { fontSize: 10, fontWeight: '600' },
  emptyBox:     { alignItems: 'center', paddingVertical: 24 },
  emptyIcon:    { fontSize: 32, marginBottom: 8 },
  emptyTxt:     { fontSize: 13, color: '#9CA3AF' },
  closeBtn:     { backgroundColor: '#2563EB', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  closeTxt:     { fontSize: 15, color: '#fff', fontWeight: '700' },
});

// ─── Month card ───────────────────────────────────────────────────────────────
function MonthCard({
  year, monthIndex, expanded, apptDates, revenueDates, onToggle, onDayPress,
}: {
  year: number;
  monthIndex: number;
  expanded: boolean;
  apptDates: Set<string>;
  revenueDates: Set<string>;
  onToggle: () => void;
  onDayPress: (key: string) => void;
}) {
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const offset = getFirstDayOffset(year, monthIndex);

  // Count appts and revenue for this month
  const monthAppts = [...apptDates].filter(k => k.startsWith(`${year}-${pad(monthIndex + 1)}`)).length;

  const cells: React.ReactElement[] = [];
  for (let i = 0; i < offset; i++) cells.push(<View key={`e${i}`} style={mc.cell} />);

  for (let d = 1; d <= daysInMonth; d++) {
    const dow     = new Date(year, monthIndex, d).getDay();
    const isWknd  = dow === 0 || dow === 6;
    const isToday = today.getFullYear() === year && today.getMonth() === monthIndex && today.getDate() === d;
    const key     = dateKey(year, monthIndex, d);
    const hasAppt = apptDates.has(key);
    const hasRev  = revenueDates.has(key);

    cells.push(
      <TouchableOpacity key={d} style={mc.cell} onPress={() => onDayPress(key)} activeOpacity={0.7}>
        <View style={[mc.dayInner, isToday && mc.todayInner, hasAppt && !isToday && mc.hasApptInner]}>
          <Text style={[mc.dayTxt, isWknd && mc.weekendTxt, isToday && mc.todayTxt, hasAppt && !isToday && mc.hasApptTxt]}>
            {d}
          </Text>
          {(hasAppt || hasRev) && <View style={[mc.dot, isToday && mc.dotWhite]} />}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={mc.card}>
      <TouchableOpacity style={mc.header} onPress={onToggle} activeOpacity={0.7}>
        <View style={mc.headerLeft}>
          <Text style={mc.monthName}>{MONTHS[monthIndex]}</Text>
          {monthAppts > 0 && (
            <View style={mc.apptBadge}>
              <Text style={mc.apptBadgeTxt}>{monthAppts} appt{monthAppts > 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>
        <Text style={mc.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <>
          <View style={mc.dayHeaderRow}>
            {DAY_LABELS.map(l => (
              <View key={l} style={mc.cell}><Text style={mc.dayHeaderTxt}>{l}</Text></View>
            ))}
          </View>
          <View style={mc.grid}>{cells}</View>
          <Text style={mc.hint}>Tap a date to see appointments & revenue</Text>
        </>
      )}
    </View>
  );
}

const mc = StyleSheet.create({
  card:         { backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#F9FAFB' },
  headerLeft:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthName:    { fontSize: 15, fontWeight: '700', color: '#111827' },
  apptBadge:    { backgroundColor: '#DBEAFE', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  apptBadgeTxt: { fontSize: 11, color: '#1D4ED8', fontWeight: '600' },
  chevron:      { fontSize: 11, color: '#9CA3AF' },
  dayHeaderRow: { flexDirection: 'row', paddingHorizontal: 8, paddingTop: 10 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingBottom: 8 },
  cell:         { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 },
  dayHeaderTxt: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  dayInner:     { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
  todayInner:   { backgroundColor: '#2563EB' },
  hasApptInner: { backgroundColor: '#DBEAFE' },
  dayTxt:       { fontSize: 12, color: '#374151' },
  weekendTxt:   { color: '#DC2626' },
  todayTxt:     { color: '#fff', fontWeight: '700' },
  hasApptTxt:   { color: '#1D4ED8', fontWeight: '600' },
  dot:          { width: 4, height: 4, borderRadius: 2, backgroundColor: '#2563EB', marginTop: 1 },
  dotWhite:     { backgroundColor: '#fff' },
  hint:         { fontSize: 10, color: '#9CA3AF', textAlign: 'center', paddingBottom: 8 },
});

// ─── Main CalendarScreen ──────────────────────────────────────────────────────
export default function CalendarScreen() {
  const navigation = useNavigation();
  const [year, setYear]               = useState(new Date().getFullYear());
  const [expandedMonths, setExpanded] = useState<Set<number>>(new Set([new Date().getMonth()]));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayModalOpen, setDayModal]   = useState(false);

  // Year-level data
  const [apptDates, setApptDates]     = useState<Set<string>>(new Set());
  const [revDates, setRevDates]       = useState<Set<string>>(new Set());
  const [yearStats, setYearStats]     = useState({ totalAppts: 0, totalRev: 0, confirmed: 0 });
  const [loadingYear, setLoadingYear] = useState(true);

  // Day-level data for modal
  const [dayAppts, setDayAppts]       = useState<Appointment[]>([]);
  const [dayRev, setDayRev]           = useState<DailyRevenue | null>(null);
  const [loadingDay, setLoadingDay]   = useState(false);

  // Fetch all appointments + revenue for the year
  const fetchYearData = useCallback(async (y: number) => {
    try {
      setLoadingYear(true);
      const [appts, ...monthRevArrays] = await Promise.all([
        api.getAppointments({ date_from: `${y}-01-01`, date_to: `${y}-12-31` }),
        ...Array.from({ length: 12 }, (_, m) => api.getDailyRevenue(y, m + 1)),
      ]);

      // Build appt date set
      const apptSet = new Set(appts.map(a => a.appointment_date.slice(0, 10)));
      setApptDates(apptSet);

      // Build revenue date set + totals
      const revSet = new Set<string>();
      let totalRev = 0;
      monthRevArrays.forEach((monthData) => {
        monthData.forEach((d) => { revSet.add(d.date.slice(0, 10)); totalRev += d.total; });
      });
      setRevDates(revSet);

      setYearStats({
        totalAppts: appts.length,
        totalRev,
        confirmed:  appts.filter(a => a.status === 'confirmed').length,
      });
    } catch (e) {
      console.error('Calendar year fetch error:', e);
    } finally {
      setLoadingYear(false);
    }
  }, []);

  useEffect(() => { fetchYearData(year); }, [year]);

  const handleDayPress = async (key: string) => {
    setSelectedDay(key);
    setDayModal(true);
    setLoadingDay(true);
    setDayAppts([]);
    setDayRev(null);
    try {
      const [y, m] = key.split('-');
      const [appts, revData] = await Promise.all([
        api.getAppointments({ date_from: key, date_to: key }),
        api.getDailyRevenue(+y, +m),
      ]);
      setDayAppts(appts);
      const dayRevEntry = revData.find(r => r.date.slice(0, 10) === key) ?? null;
      setDayRev(dayRevEntry);
    } catch (e) {
      console.error('Day fetch error:', e);
    } finally {
      setLoadingDay(false);
    }
  };

  const toggleMonth = (m: number) => {
    setExpanded(prev => { const next = new Set(prev); next.has(m) ? next.delete(m) : next.add(m); return next; });
  };

  return (
    <SafeAreaView style={cs.safe}>
      <View style={cs.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={cs.backBtn}>
          <Text style={cs.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={cs.title}>Calendar</Text>
        <View style={cs.yearNav}>
          <TouchableOpacity onPress={() => setYear(y => y - 1)} style={cs.navBtn}>
            <Text style={cs.navBtnTxt}>‹</Text>
          </TouchableOpacity>
          <Text style={cs.yearTxt}>{year}</Text>
          <TouchableOpacity onPress={() => setYear(y => y + 1)} style={cs.navBtn}>
            <Text style={cs.navBtnTxt}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={cs.scroll} contentContainerStyle={cs.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Year stats */}
        {loadingYear ? (
          <View style={cs.loadingBox}><ActivityIndicator color="#2563EB" /></View>
        ) : (
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
                <Text style={[cs.statVal, { color: '#16A34A' }]}>{yearStats.confirmed}</Text>
                <Text style={cs.statLbl}>Confirmed</Text>
              </View>
            </View>
          </View>
        )}

        {/* Legend */}
        <View style={cs.legend}>
          <View style={cs.legendItem}><View style={[cs.legendDot, { backgroundColor: '#2563EB' }]} /><Text style={cs.legendTxt}>Today</Text></View>
          <View style={cs.legendItem}><View style={[cs.legendDot, { backgroundColor: '#BFDBFE' }]} /><Text style={cs.legendTxt}>Has appointment</Text></View>
          <View style={cs.legendItem}><View style={[cs.legendDot, { backgroundColor: '#DC2626' }]} /><Text style={cs.legendTxt}>Weekend</Text></View>
        </View>

        {/* Expand/Collapse all */}
        <View style={cs.expandRow}>
          <TouchableOpacity onPress={() => setExpanded(new Set([0,1,2,3,4,5,6,7,8,9,10,11]))} style={cs.expandBtn}>
            <Text style={cs.expandBtnTxt}>Expand all</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setExpanded(new Set())} style={cs.expandBtn}>
            <Text style={cs.expandBtnTxt}>Collapse all</Text>
          </TouchableOpacity>
        </View>

        {Array.from({ length: 12 }, (_, i) => (
          <MonthCard
            key={i}
            year={year}
            monthIndex={i}
            expanded={expandedMonths.has(i)}
            apptDates={apptDates}
            revenueDates={revDates}
            onToggle={() => toggleMonth(i)}
            onDayPress={handleDayPress}
          />
        ))}

      </ScrollView>

      <DayDetailModal
        visible={dayModalOpen}
        dateStr={selectedDay}
        appointments={dayAppts}
        dailyRevenue={dayRev}
        loadingDay={loadingDay}
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
  scroll:       { flex: 1 },
  scrollContent:{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36 },
  loadingBox:   { alignItems: 'center', paddingVertical: 30 },
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
