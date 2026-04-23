import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { api, RevenuePoint } from '../services/api';

const SCREEN_W = Dimensions.get('window').width;
const CHART_W  = SCREEN_W - 64;
const CHART_H  = 200;
const PAD_LEFT = 44;
const PAD_BTM  = 28;
const PAD_TOP  = 16;

type ServiceKey = 'nursing' | 'pharmacy' | 'homecare';

interface Props {
  dateRange?: { from: string; to: string };
}

const SERVICE_COLORS: Record<ServiceKey, { line: string; fill: string }> = {
  nursing:  { line: '#F97316', fill: '#FED7AA' },
  pharmacy: { line: '#14B8A6', fill: '#99F6E4' },
  homecare: { line: '#8B5CF6', fill: '#DDD6FE' },
};

// ─── Donut data derived from revenue ─────────────────────────────────────────
function buildDonutData(data: RevenuePoint[]) {
  const totals = { nursing: 0, pharmacy: 0, homecare: 0 };
  data.forEach(d => { totals.nursing += d.nursing; totals.pharmacy += d.pharmacy; totals.homecare += d.homecare; });
  const total = totals.nursing + totals.pharmacy + totals.homecare || 1;
  return [
    { label: 'Nursing',  color: '#F97316', pct: Math.round((totals.nursing  / total) * 100) },
    { label: 'Pharmacy', color: '#14B8A6', pct: Math.round((totals.pharmacy / total) * 100) },
    { label: 'Homecare', color: '#8B5CF6', pct: Math.round((totals.homecare / total) * 100) },
  ];
}

function donutSlices(data: { label: string; color: string; pct: number }[], cx: number, cy: number, r: number, innerR: number) {
  const total = data.reduce((s, d) => s + d.pct, 0);
  let startAngle = -Math.PI / 2;
  return data.map((seg) => {
    const angle = (seg.pct / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`;
    startAngle = endAngle;
    return { path, color: seg.color, label: seg.label, pct: seg.pct };
  });
}

function buildAreaPath(points: { x: number; y: number }[], chartH: number, close = false): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cx = (points[i - 1].x + points[i].x) / 2;
    d += ` C ${cx} ${points[i - 1].y}, ${cx} ${points[i].y}, ${points[i].x} ${points[i].y}`;
  }
  if (close) {
    d += ` L ${points[points.length - 1].x} ${chartH - PAD_BTM}`;
    d += ` L ${points[0].x} ${chartH - PAD_BTM} Z`;
  }
  return d;
}

function AreaChart({ data }: { data: RevenuePoint[] }) {
  const w = CHART_W, h = CHART_H;
  const plotW = w - PAD_LEFT - 8;
  const plotH = h - PAD_BTM - PAD_TOP;
  const maxVal = Math.max(...data.map(d => d.nursing + d.pharmacy + d.homecare), 1);
  const yMax = Math.ceil(maxVal / 10000) * 10000;
  const yTicks = [0, Math.round(yMax * 0.33 / 1000), Math.round(yMax * 0.66 / 1000), Math.round(yMax / 1000)];
  const xStep = plotW / Math.max(data.length - 1, 1);
  const yScale = (v: number) => PAD_TOP + plotH - (v / yMax) * plotH;
  const pts = (key: ServiceKey) => data.map((d, i) => ({ x: PAD_LEFT + i * xStep, y: yScale(d[key]) }));

  return (
    <Svg width={w} height={h}>
      <Defs>
        {(['nursing', 'pharmacy', 'homecare'] as ServiceKey[]).map((k) => (
          <LinearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={SERVICE_COLORS[k].fill} stopOpacity="0.85" />
            <Stop offset="1" stopColor={SERVICE_COLORS[k].fill} stopOpacity="0.1" />
          </LinearGradient>
        ))}
      </Defs>
      {yTicks.map((t, i) => {
        const y = yScale(t * 1000);
        return (
          <G key={i}>
            <Path d={`M ${PAD_LEFT} ${y} H ${w - 8}`} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
            <SvgText x={PAD_LEFT - 4} y={y + 4} fontSize="9" fill="#9CA3AF" textAnchor="end">
              {t === 0 ? '₹0' : `₹${t}k`}
            </SvgText>
          </G>
        );
      })}
      {(['homecare', 'pharmacy', 'nursing'] as ServiceKey[]).map((k) => (
        <Path key={`fill_${k}`} d={buildAreaPath(pts(k), h, true)} fill={`url(#grad_${k})`} strokeWidth="0" />
      ))}
      {(['homecare', 'pharmacy', 'nursing'] as ServiceKey[]).map((k) => (
        <Path key={`line_${k}`} d={buildAreaPath(pts(k), h, false)} fill="none" stroke={SERVICE_COLORS[k].line} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {data.map((d, i) => (
        <SvgText key={i} x={PAD_LEFT + i * xStep} y={h - 6} fontSize="9" fill="#9CA3AF" textAnchor="middle">{d.month}</SvgText>
      ))}
      {pts('nursing').map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill={SERVICE_COLORS.nursing.line} />
      ))}
    </Svg>
  );
}

function DonutChart({ data }: { data: RevenuePoint[] }) {
  const size = 160, cx = 80, cy = 80, r = 62, innerR = 38;
  const donutData = buildDonutData(data);
  const slices = donutSlices(donutData, cx, cy, r, innerR);
  const totalRev = data.reduce((s, d) => s + d.total, 0);

  return (
    <View style={dc.wrap}>
      <Svg width={size} height={size}>
        {slices.map((sl, i) => <Path key={i} d={sl.path} fill={sl.color} />)}
        <SvgText x={cx} y={cy - 6} textAnchor="middle" fontSize="10" fill="#6B7280">Revenue</SvgText>
        <SvgText x={cx} y={cy + 8} textAnchor="middle" fontSize="10" fill="#111827" fontWeight="700">Split</SvgText>
      </Svg>
      <View style={dc.legend}>
        {donutData.map((seg) => (
          <View key={seg.label} style={dc.legendItem}>
            <View style={[dc.dot, { backgroundColor: seg.color }]} />
            <Text style={dc.legendTxt}>{seg.label}  {seg.pct}%</Text>
          </View>
        ))}
      </View>
      <Text style={dc.total}>Total  ₹{totalRev.toLocaleString('en-IN')}</Text>
    </View>
  );
}

const dc = StyleSheet.create({
  wrap:       { alignItems: 'center', paddingVertical: 8 },
  legend:     { flexDirection: 'row', gap: 16, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot:        { width: 9, height: 9, borderRadius: 5 },
  legendTxt:  { fontSize: 12, color: '#6B7280' },
  total:      { fontSize: 13, fontWeight: '700', color: '#111827', marginTop: 8 },
});

// ─── Main export ──────────────────────────────────────────────────────────────
export default function RevenueChart({ dateRange }: Props) {
  const [chartPage, setChartPage] = useState<0 | 1>(0);
  const [data, setData]           = useState<RevenuePoint[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getRevenue(
          dateRange ? { date_from: dateRange.from, date_to: dateRange.to } : undefined
        );
        setData(result);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load revenue');
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, [dateRange?.from, dateRange?.to]);

  const totalRevenue = data.reduce((s, d) => s + d.total, 0);

  return (
    <View style={styles.card}>
      {/* Nav dots */}
      <View style={styles.pageDotsRow}>
        <TouchableOpacity onPress={() => setChartPage(0)} style={styles.navBtn}>
          <Text style={styles.navBtnTxt}>‹</Text>
        </TouchableOpacity>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, chartPage === 0 && styles.dotActive]} />
          <View style={[styles.dot, chartPage === 1 && styles.dotActive]} />
        </View>
        <TouchableOpacity onPress={() => setChartPage(1)} style={styles.navBtn}>
          <Text style={styles.navBtnTxt}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{chartPage === 0 ? 'Revenue Overview' : 'Statistics'}</Text>
          <Text style={styles.total}>
            {chartPage === 0
              ? `₹${totalRevenue.toLocaleString('en-IN')} total`
              : 'Revenue by service type'}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.loadingTxt}>Loading revenue data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTxt}>⚠️ {error}</Text>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.loadingBox}>
          <Text style={styles.loadingTxt}>No revenue data for this period</Text>
        </View>
      ) : (
        <>
          {chartPage === 0 && <AreaChart data={data} />}
          {chartPage === 1 && <DonutChart data={data} />}

          {chartPage === 0 && (
            <View style={styles.legendRow}>
              {(['nursing', 'pharmacy', 'homecare'] as ServiceKey[]).map((k) => (
                <View key={k} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: SERVICE_COLORS[k].line }]} />
                  <Text style={styles.legendTxt}>{k.charAt(0).toUpperCase() + k.slice(1)}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card:        { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  pageDotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 4, gap: 8 },
  dotsRow:     { flexDirection: 'row', gap: 5 },
  dot:         { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D1D5DB' },
  dotActive:   { backgroundColor: '#2563EB', width: 18 },
  navBtn:      { padding: 4 },
  navBtnTxt:   { fontSize: 18, color: '#9CA3AF', fontWeight: '700' },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title:       { fontSize: 15, fontWeight: '700', color: '#111827' },
  total:       { fontSize: 12, color: '#6B7280', marginTop: 2 },
  loadingBox:  { alignItems: 'center', paddingVertical: 40 },
  loadingTxt:  { fontSize: 13, color: '#9CA3AF', marginTop: 8 },
  errorBox:    { backgroundColor: '#FEF2F2', borderRadius: 8, padding: 12 },
  errorTxt:    { fontSize: 13, color: '#991B1B' },
  legendRow:   { flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 10 },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:   { width: 10, height: 10, borderRadius: 5 },
  legendTxt:   { fontSize: 12, color: '#6B7280' },
});
