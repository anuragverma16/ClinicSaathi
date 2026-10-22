import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, Bell, CalendarDays, ChevronDown, ClipboardPlus, CreditCard, HeartPulse, HelpCircle, LayoutDashboard, LogOut, Menu, MessageSquare, Moon, MoreHorizontal, Search, Settings, ShieldCheck, Sparkles, Stethoscope, Sun, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { demoMode } from '../services/api';

const navigation = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Online Appointment Booking', path: '/online-booking', icon: CalendarDays },
  { label: 'WhatsApp Booking Assistant', path: '/communications', icon: MessageSquare },
  { label: 'AI Appointment Assistant', path: '/ai', icon: Sparkles },
  { label: 'Appointment Management', path: '/appointments', icon: CalendarDays },
  { label: 'Digital Queue Management', path: '/queue', icon: Activity },
  { label: 'Patient CRM', path: '/patients', icon: Users },
  { label: 'Doctor Dashboard', path: '/doctors', icon: Stethoscope },
  { label: 'Prescription & Reports', path: '/prescriptions', icon: ClipboardPlus },
  { label: 'Billing & Payments', path: '/billing', icon: CreditCard },
  { label: 'Automated WhatsApp Communication', path: '/automated-whatsapp', icon: MessageSquare },
  { label: 'Reviews', path: '/reviews', icon: HeartPulse },
  { label: 'Campaigns', path: '/campaigns', icon: MoreHorizontal },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('clinic-theme') === 'dark');
  const active = navigation.find((item) => location.pathname.startsWith(item.path));

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('clinic-theme', next ? 'dark' : 'light');
  };

  const signOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      toast.error('Unable to sign out. Please try again.');
    }
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => <aside className={`flex h-full w-[250px] shrink-0 flex-col border-r border-slate-100 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 ${mobile ? '' : 'fixed inset-y-0 left-0 z-20 hidden lg:flex'}`}>
    <div className="mb-8 flex items-center gap-3 px-2">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white"><HeartPulse size={22} /></div>
      <div><p className="font-extrabold tracking-tight text-ink dark:text-white">ClinicSaathi</p><p className="text-[11px] text-muted">Smarter clinics, together</p></div>
      {mobile && <button className="icon-button ml-auto" aria-label="Close menu" onClick={() => setDrawer(false)}><X size={19} /></button>}
    </div>
    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</p>
    <nav className="flex-1 space-y-1 overflow-y-auto">
      {navigation.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} onClick={() => setDrawer(false)} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{path === '/queue' && <span className="ml-auto h-2 w-2 rounded-full bg-teal-500" />}</NavLink>)}
    </nav>
    <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
      <NavLink to="/settings" onClick={() => setDrawer(false)} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}><Settings size={17} /><span>Settings</span></NavLink>
      <button className="nav-item w-full" onClick={() => toast.info('Help center coming soon.')}><HelpCircle size={17} /><span>Help center</span></button>
      <button className="nav-item w-full text-rose-600 hover:bg-rose-50" onClick={signOut}><LogOut size={17} /><span>Sign out</span></button>
    </div>
    <div className="mt-4 rounded-xl bg-teal-50 p-3 dark:bg-slate-800"><div className="flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-300"><ShieldCheck size={15} /> Your clinic is in good hands</div><p className="mt-1 text-[11px] leading-relaxed text-slate-500">Patient-first care starts with a calmer workflow.</p></div>
  </aside>;

  return <div className="min-h-screen bg-canvas text-ink dark:bg-slate-950 dark:text-slate-100">
    <Sidebar />
    {drawer && <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setDrawer(false)}><div className="h-full" onClick={(event) => event.stopPropagation()}><Sidebar mobile /></div></div>}
    <div className="min-h-screen lg:pl-[250px]">
      <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur sm:px-7 dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-center gap-3">
          <button className="icon-button lg:hidden" aria-label="Open navigation" onClick={() => setDrawer(true)}><Menu size={20} /></button>
          <div><p className="hidden text-xs text-muted sm:block">Clinic workspace</p><h1 className="text-base font-bold text-ink dark:text-white">{active?.label ?? 'ClinicSaathi'}</h1></div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:flex dark:border-slate-700 dark:bg-slate-800"><Search size={16} className="text-muted" /><input className="w-36 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search anything..." aria-label="Search" onKeyDown={(event) => { if (event.key === 'Enter') toast.info('Use search within each section to find records.'); }} /><kbd className="rounded border border-slate-200 px-1 text-[10px] text-slate-400">⌘ K</kbd></label>
          <button className="icon-button relative" aria-label="Notifications" onClick={() => toast.info('You’re all caught up.')}>
            <Bell size={18} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
          <button className="icon-button" aria-label="Toggle theme" onClick={toggleTheme}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button className="flex items-center gap-2 rounded-xl p-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => toast.info(`${user?.email ?? ''} · ${user?.role ?? ''}`)}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e9a891] text-xs font-bold text-white">{user?.name.split(' ').map((part) => part[0]).slice(-2).join('') ?? 'CS'}</span>
            <span className="hidden sm:block"><span className="block text-xs font-semibold text-ink dark:text-white">{user?.name}</span><span className="block text-[10px] text-muted">{user?.role}</span></span>
            <ChevronDown size={14} className="hidden text-muted sm:block" />
          </button>
        </div>
      </header>
      {demoMode && <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800 sm:px-7 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Demo mode is on — changes use sample data in this browser session.</div>}
      <main className="mx-auto max-w-[1500px] p-4 sm:p-7"><Outlet /></main>
      <footer className="px-7 pb-6 text-center text-[11px] text-slate-400">ClinicSaathi · Care flows better together</footer>
    </div>
  </div>;
}
