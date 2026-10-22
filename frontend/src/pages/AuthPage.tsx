import { forwardRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, HeartPulse, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';

const loginSchema = z.object({ email: z.string().email('Enter a valid email address.'), password: z.string().min(1, 'Password is required.') });
const registerSchema = z.object({
  clinicName: z.string().min(2, 'Clinic name must be at least 2 characters.'),
  name: z.string().min(2, 'Your name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().min(8, 'Enter a valid phone number.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
});

export function AuthPage({ mode, onModeChange }: { mode: 'login' | 'register'; onModeChange: (mode: 'login' | 'register') => void }) {
  const { login, register } = useAuth();
  const [pending, setPending] = useState(false);
  const isRegister = mode === 'register';
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: { clinicName: '', name: '', email: '', phone: '', password: '' },
  });

  const submit = async (values: z.infer<typeof registerSchema>) => {
    setPending(true);
    try {
      if (isRegister) await register(values);
      else await login(values.email, values.password);
      toast.success(isRegister ? 'Your clinic account is ready.' : 'Welcome back to ClinicSaathi.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in. Check your details and try again.');
    } finally {
      setPending(false);
    }
  };

  return <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr] dark:bg-slate-950">
    <aside className="relative hidden overflow-hidden bg-[#103d3b] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-24 -top-20 h-96 w-96 rounded-full border border-white/10" /><div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full border border-white/10" />
      <div className="relative flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15"><HeartPulse /></span><span className="text-lg font-bold">ClinicSaathi</span></div>
      <div className="relative max-w-lg"><span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs"><Sparkles size={14} /> Your clinic, in sync</span><h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight">More care.<br />Less chaos.</h1><p className="mt-5 max-w-md text-base leading-7 text-teal-100/80">The thoughtful workspace that gives your team more time for what matters most — your patients.</p>
        <div className="mt-10 grid grid-cols-3 gap-3">{[['One place', 'for your clinic'], ['Less admin', 'more patient care'], ['Built for', 'your team']].map(([a, b]) => <div className="rounded-xl border border-white/10 bg-white/5 p-3" key={a}><p className="text-sm font-semibold">{a}</p><p className="mt-1 text-[11px] text-teal-100/70">{b}</p></div>)}</div></div>
      <p className="relative text-xs text-teal-100/60">Smarter Clinics. Happier Patients.</p>
    </aside>
    <section className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-[420px]">
        <div className="mb-9 flex items-center gap-3 lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white"><HeartPulse /></span><span className="font-bold text-ink dark:text-white">ClinicSaathi</span></div>
        <button onClick={() => onModeChange(isRegister ? 'login' : 'register')} className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-teal-700"><ArrowLeft size={14} /> {isRegister ? 'Back to sign in' : 'Create a clinic account'}</button>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700 dark:text-teal-300">Welcome to ClinicSaathi</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink dark:text-white">{isRegister ? 'Set up your clinic' : 'Good to see you again'}</h2>
        <p className="mt-2 text-sm text-muted">{isRegister ? 'A calmer clinic starts with a few details.' : 'Sign in to your clinic workspace.'}</p>
        <form className="mt-7 space-y-4" onSubmit={form.handleSubmit(submit)}>
          {isRegister && <Field label="Clinic name" placeholder="e.g. Greenfield Family Clinic" error={form.formState.errors.clinicName?.message} {...form.register('clinicName')} onChange={(event) => form.setValue('clinicName', event.target.value, { shouldValidate: true })} />}
          {isRegister && <Field label="Your name" placeholder="Full name" error={form.formState.errors.name?.message} {...form.register('name')} onChange={(event) => form.setValue('name', event.target.value, { shouldValidate: true })} />}
          <Field label="Email address" type="email" placeholder="you@clinic.com" icon={<Mail size={16} />} error={form.formState.errors.email?.message} {...form.register('email')} onChange={(event) => form.setValue('email', event.target.value, { shouldValidate: true })} />
          {isRegister && <Field label="Phone number" type="tel" placeholder="+91 98765 43210" error={form.formState.errors.phone?.message} {...form.register('phone')} onChange={(event) => form.setValue('phone', event.target.value, { shouldValidate: true })} />}
          <Field label="Password" type="password" placeholder="At least 8 characters" icon={<LockKeyhole size={16} />} error={form.formState.errors.password?.message} {...form.register('password')} onChange={(event) => form.setValue('password', event.target.value, { shouldValidate: true })} />
          {!isRegister && <div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><input type="checkbox" className="accent-teal-600" /> Remember me</label><button type="button" className="font-semibold text-teal-700 hover:underline dark:text-teal-300" onClick={() => toast.info('Password reset is available when the email service is configured.')}>Forgot password?</button></div>}
          <Button className="mt-2 w-full justify-center py-3" disabled={pending} type="submit">{pending ? 'Please wait…' : isRegister ? 'Create clinic account' : 'Sign in to dashboard'}</Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted">{isRegister ? 'Already have an account?' : 'New to ClinicSaathi?'} <button className="font-semibold text-teal-700 hover:underline dark:text-teal-300" onClick={() => onModeChange(isRegister ? 'login' : 'register')}>{isRegister ? 'Sign in' : 'Create an account'}</button></p>
      </div>
    </section>
  </main>;
}

const Field = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; icon?: React.ReactNode }>(
  function Field({ label, error, icon, ...props }, ref) {
    return <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">{label}<span className="relative mt-1.5 block">{icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}<input ref={ref} className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 ${icon ? 'pl-10' : ''}`} {...props} /></span>{error && <span className="mt-1 block font-normal text-rose-600">{error}</span>}</label>;
  },
);
