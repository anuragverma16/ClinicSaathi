import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarCheck2, CalendarPlus, Check, Clock3, CreditCard, MessageCircle, Plus, UserPlus, Users, Wallet } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { clinicService } from '../services/clinic.service';
import { demoMode } from '../services/api';
import { appointments } from '../services/mock';
import type { DashboardStats } from '../types';
import { Button, ErrorState, LoadingRows } from '../components/ui';

const chartData = [
  { day: 'Mon', patients: 24, revenue: 18500 }, { day: 'Tue', patients: 31, revenue: 22800 },
  { day: 'Wed', patients: 27, revenue: 19200 }, { day: 'Thu', patients: 38, revenue: 27600 },
  { day: 'Fri', patients: 34, revenue: 24100 }, { day: 'Sat', patients: 42, revenue: 31800 },
  { day: 'Sun', patients: 29, revenue: 28450 },
];

const formatMoney = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

function MetricCard({ label, value, icon: Icon, change, color, money = false }: { label: string; value: number; icon: typeof Users; change?: string; color: string; money?: boolean }) {
  return <article className="panel p-4 sm:p-5">
    <div className="flex items-start justify-between"><div><p className="text-xs font-medium text-muted sm:text-sm">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-[28px] dark:text-white">{money ? formatMoney(value) : value}</p></div><span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon size={19} /></span></div>
    {change && <p className="mt-3 flex items-center gap-1 text-[11px] text-muted"><ArrowUpRight size={13} className="text-teal-600" /><span className="font-semibold text-teal-700">{change}</span> vs last week</p>}
  </article>;
}

export function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['dashboard'], queryFn: clinicService.getDashboard });
  const stats: DashboardStats | undefined = data;
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  if (isError) return <div className="panel"><ErrorState message={error instanceof Error ? error.message : 'Unable to load dashboard data.'} onRetry={() => { void refetch(); }} /></div>;

  return <div className="space-y-6">
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-sm font-medium text-teal-700 dark:text-teal-300">Good morning, {demoMode ? 'Meera' : 'Doctor'} <span aria-hidden="true">☀️</span></p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-[30px] dark:text-white">Here’s your clinic today</h2><p className="mt-1 text-sm text-muted">{today}</p></div>
      <Link to="/appointments"><Button><Plus size={16} /> Book appointment</Button></Link>
    </section>

    <section className="panel p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><MessageCircle size={20} /></span>
        <div><h3 className="font-bold text-ink dark:text-white">WhatsApp Booking Assistant</h3><p className="mt-1 text-sm text-muted">Patients can start a conversation with a simple message.</p></div>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <p className="text-xs font-semibold text-muted">Patients simply message:</p>
          <p className="mt-2 inline-flex rounded-2xl rounded-bl-sm bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">Hi</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted">The AI assistant responds:</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {['Book Appointment', 'Reschedule', 'Cancel Appointment', 'Check Doctor Availability', 'Clinic Location', 'Consultation Fees', 'Emergency Contact'].map((option) => <li key={option} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">{option}</li>)}
          </ul>
        </div>
      </div>
    </section>

    {isLoading ? <div className="panel"><LoadingRows /></div> : <>
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Appointments today" value={stats?.todaysAppointments ?? 0} icon={CalendarCheck2} change="+12.5%" color="bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300" />
        <MetricCard label="Completed visits" value={stats?.completed ?? 0} icon={Check} change="+8.2%" color="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" />
        <MetricCard label="Waiting now" value={stats?.waiting ?? 0} icon={Clock3} color="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" />
        <MetricCard label="Today's revenue" value={stats?.todaysRevenue ?? 0} icon={Wallet} change="+14.8%" color="bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300" money />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <article className="panel min-w-0 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between"><div><h3 className="font-bold text-ink dark:text-white">Clinic activity</h3><p className="mt-1 text-xs text-muted">Patient visits & revenue this week</p></div><span className="rounded-lg bg-teal-50 px-2.5 py-1.5 text-[11px] font-semibold text-teal-700 dark:bg-slate-800 dark:text-teal-300">Last 7 days</span></div>
          {demoMode ? <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#20ab91" stopOpacity={0.18} /><stop offset="95%" stopColor="#20ab91" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="#e9eff0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8a9ba0', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a9ba0', fontSize: 10 }} />
              <Tooltip contentStyle={{ border: '1px solid #e6eeee', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#16a085" strokeWidth={2.5} fill="url(#revenueFill)" />
              <Area type="monotone" dataKey="patients" name="Patients" stroke="#78aee8" strokeWidth={2} fill="transparent" />
            </AreaChart></ResponsiveContainer>
          </div> : <div className="grid h-[230px] place-items-center text-sm text-muted">Detailed analytics are coming soon with the analytics API.</div>}
          <div className="mt-3 flex gap-5 border-t border-slate-100 pt-3 text-xs dark:border-slate-800"><span className="flex items-center gap-2 text-muted"><i className="h-2 w-2 rounded-full bg-teal-600" /> Revenue</span><span className="flex items-center gap-2 text-muted"><i className="h-2 w-2 rounded-full bg-blue-400" /> Patients</span></div>
        </article>
        <article className="panel p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between"><div><h3 className="font-bold text-ink dark:text-white">Today at a glance</h3><p className="mt-1 text-xs text-muted">Your team's progress</p></div><CalendarCheck2 size={18} className="text-teal-600" /></div>
          <div className="space-y-5">
            <Progress label="Appointments completed" current={stats?.completed ?? 0} total={stats?.todaysAppointments ?? 0} color="bg-teal-500" />
            <Progress label="New patients" current={stats?.newPatients ?? 0} total={Math.max(stats?.newPatients ?? 0, 12)} color="bg-blue-400" />
            <Progress label="Returning patients" current={stats?.returningPatients ?? 0} total={Math.max(stats?.returningPatients ?? 0, 20)} color="bg-violet-400" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800"><MiniStat label="Cancelled" value={stats?.cancelled ?? 0} icon={ArrowDownRight} /><MiniStat label="No-shows" value={stats?.noShows ?? 0} icon={ArrowDownRight} /></div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <article className="panel overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-5"><div><h3 className="font-bold text-ink dark:text-white">Upcoming appointments</h3><p className="mt-1 text-xs text-muted">Your next patient visits</p></div><Link to="/appointments" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline">View schedule <ArrowRight size={14} /></Link></div>
          {demoMode ? <div className="divide-y divide-slate-100 dark:divide-slate-800">{appointments.slice(0, 4).map((item, index) => <div className="flex items-center gap-3 px-4 py-3 sm:px-5" key={item.id}><span className={`avatar avatar-${item.tone}`}>{item.initials}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink dark:text-white">{item.name}</p><p className="truncate text-xs text-muted">{item.detail}</p></div><div className="text-right"><p className="text-xs font-semibold text-ink dark:text-slate-200">{`${9 + index}:00 ${index > 2 ? 'PM' : 'AM'}`}</p><StatusBadge status={item.status} /></div></div>)}</div> : <div className="p-5 text-sm text-muted">Appointments are available once the appointments API is connected.</div>}
        </article>
        <article className="panel p-4 sm:p-5">
          <h3 className="font-bold text-ink dark:text-white">Quick actions</h3><p className="mt-1 text-xs text-muted">Common tasks, one click away</p>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <QuickAction label="New patient" path="/patients" icon={UserPlus} />
            <QuickAction label="Appointment" path="/appointments" icon={CalendarPlus} />
            <QuickAction label="Add doctor" path="/doctors" icon={Users} />
            <QuickAction label="Create invoice" path="/billing" icon={CreditCard} />
          </div>
        </article>
      </section>
    </>}
  </div>;
}

function Progress({ label, current, total, color }: { label: string; current: number; total: number; color: string }) {
  const percent = total ? Math.min(100, Math.round(current / total * 100)) : 0;
  return <div><div className="mb-2 flex justify-between text-xs"><span className="font-medium text-slate-600 dark:text-slate-300">{label}</span><span className="text-muted">{current} / {total}</span></div><div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} /></div></div>;
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof ArrowDownRight }) {
  return <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800"><span className="text-xs text-muted">{label}</span><span className="flex items-center gap-1 text-sm font-bold text-ink dark:text-white"><Icon size={14} className="text-rose-400" />{value}</span></div>;
}

function StatusBadge({ status }: { status: string }) {
  const color = status.toLowerCase().includes('complete') || status.toLowerCase() === 'paid' || status.toLowerCase() === 'available' ? 'badge-green' : status.toLowerCase().includes('wait') || status.toLowerCase().includes('pending') ? 'badge-amber' : 'badge-blue';
  return <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}>{status}</span>;
}

function QuickAction({ label, path, icon: Icon }: { label: string; path: string; icon: typeof Users }) {
  return <Link to={path} className="flex min-h-[76px] flex-col justify-between rounded-xl border border-slate-100 p-3 transition hover:border-teal-200 hover:bg-teal-50/60 dark:border-slate-700 dark:hover:bg-slate-800"><Icon size={18} className="text-teal-700 dark:text-teal-300" /><span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{label}</span></Link>;
}
