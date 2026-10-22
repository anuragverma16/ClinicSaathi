import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, demoMode, unwrap } from '../services/api';
import { ErrorState, LoadingRows } from '../components/ui';
import { ArrowUpRight, CalendarDays, Users, Wallet } from 'lucide-react';

const sample = [
  { day: 'Mon', revenue: 18500, appointments: 24, patients: 18 },
  { day: 'Tue', revenue: 22800, appointments: 31, patients: 22 },
  { day: 'Wed', revenue: 19200, appointments: 27, patients: 19 },
  { day: 'Thu', revenue: 27600, appointments: 38, patients: 26 },
  { day: 'Fri', revenue: 24100, appointments: 34, patients: 24 },
  { day: 'Sat', revenue: 31800, appointments: 42, patients: 31 },
  { day: 'Sun', revenue: 28450, appointments: 29, patients: 20 },
];
type Analytics = typeof sample;

export function AnalyticsPage() {
  const [range, setRange] = useState('7 Days');
  const query = useQuery({
    queryKey: ['analytics', range],
    queryFn: async (): Promise<Analytics> => {
      if (demoMode) return sample;
      return unwrap<Analytics>(await api.get('/analytics', { params: { range } }));
    },
  });
  return <div className="space-y-5">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">Clinic performance</p><h2 className="mt-1 text-2xl font-extrabold text-ink dark:text-white">Analytics</h2><p className="mt-1 text-sm text-muted">Understand your clinic’s activity and growth.</p></div><div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">{['Today', '7 Days', '30 Days', '3 Months', '1 Year'].map((item) => <button className={`rounded-lg px-2.5 py-2 text-[11px] font-semibold ${item === range ? 'bg-teal-600 text-white' : 'text-muted hover:bg-slate-50 dark:hover:bg-slate-800'}`} key={item} onClick={() => setRange(item)}>{item}</button>)}</div></header>
    {demoMode && <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">Preview analytics use sample data. Connect the analytics API for clinic-specific reporting.</div>}
    {query.isLoading ? <div className="panel"><LoadingRows /></div> : query.isError ? <div className="panel"><ErrorState message={query.error instanceof Error ? query.error.message : 'Unable to load analytics.'} onRetry={() => { void query.refetch(); }} /></div> : <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3"><AnalyticsMetric label="Revenue" value="₹1,72,450" trend="+14.8%" icon={Wallet} /><AnalyticsMetric label="Appointments" value="225" trend="+8.2%" icon={CalendarDays} /><AnalyticsMetric label="Patients served" value="160" trend="+11.4%" icon={Users} /></section>
      <section className="grid gap-4 xl:grid-cols-2"><Chart title="Revenue overview" subtitle="Daily revenue performance" data={query.data ?? sample} dataKey="revenue" color="#16a085" money /><Chart title="Appointment trends" subtitle="Appointments by day" data={query.data ?? sample} dataKey="appointments" color="#6d9fe8" /></section>
    </>}
  </div>;
}

function AnalyticsMetric({ label, value, trend, icon: Icon }: { label: string; value: string; trend: string; icon: typeof Users }) {
  return <article className="panel flex items-center gap-4 p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"><Icon size={20} /></span><div className="flex-1"><p className="text-xs text-muted">{label}</p><p className="mt-1 text-xl font-bold text-ink dark:text-white">{value}</p></div><span className="flex items-center text-xs font-semibold text-teal-700 dark:text-teal-300"><ArrowUpRight size={14} />{trend}</span></article>;
}

function Chart({ title, subtitle, data, dataKey, color, money = false }: { title: string; subtitle: string; data: Analytics; dataKey: 'revenue' | 'appointments'; color: string; money?: boolean }) {
  return <article className="panel min-w-0 p-4 sm:p-5"><div className="mb-4"><h3 className="font-bold text-ink dark:text-white">{title}</h3><p className="mt-1 text-xs text-muted">{subtitle}</p></div><div className="h-[270px]"><ResponsiveContainer width="100%" height="100%">{dataKey === 'revenue' ? <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.2} /><stop offset="95%" stopColor={color} stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#e9eff0" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8a9ba0', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a9ba0', fontSize: 10 }} /><Tooltip formatter={(value) => money ? [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue'] : [value, 'Appointments']} contentStyle={{ border: '1px solid #e6eeee', borderRadius: 12, fontSize: 12 }} /><Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill="url(#analyticsFill)" /></AreaChart> : <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#e9eff0" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8a9ba0', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a9ba0', fontSize: 10 }} /><Tooltip contentStyle={{ border: '1px solid #e6eeee', borderRadius: 12, fontSize: 12 }} /><Bar dataKey={dataKey} fill={color} radius={[5, 5, 0, 0]} /></BarChart>}</ResponsiveContainer></div></article>;
}
