import { useState } from 'react';
import { Bot, Check, ChevronRight, LoaderCircle, Send, Settings2, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { api, demoMode, unwrap } from '../services/api';
import { Button } from '../components/ui';

type Message = { role: 'user' | 'assistant'; content: string; at: string; failed?: boolean };
const prompts = ['Find today’s appointments', 'Show available dermatologists', 'Patients due for follow-up', 'Show today’s revenue'];

export function UtilityPage({ kind }: { kind: 'ai' | 'settings' }) {
  return kind === 'ai' ? <AssistantPage /> : <SettingsPage />;
}

function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Hi Meera! I’m your ClinicSaathi assistant. I can help with clinic tasks once the AI service is connected.', at: format(new Date(), 'h:mm a') }]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const send = async (content = input) => {
    const text = content.trim();
    if (!text || pending) return;
    setMessages((current) => [...current, { role: 'user', content: text, at: format(new Date(), 'h:mm a') }]);
    setInput('');
    setPending(true);
    try {
      if (demoMode) throw new Error('Connect the AI chat API to receive assistant responses. No demo response was generated.');
      const response = await api.post('/ai/chat', { message: text });
      const data = unwrap<{ message?: string; reply?: string }>(response);
      const answer = data.reply ?? data.message;
      if (!answer) throw new Error('The AI service returned an empty response.');
      setMessages((current) => [...current, { role: 'assistant', content: answer, at: format(new Date(), 'h:mm a') }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reach the AI service.';
      setMessages((current) => [...current, { role: 'assistant', content: message, at: format(new Date(), 'h:mm a'), failed: true }]);
    } finally {
      setPending(false);
    }
  };

  return <section className="mx-auto flex h-[calc(100vh-190px)] min-h-[520px] max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
    <header className="flex items-center gap-3 border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800"><span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"><Bot size={22} /></span><div className="flex-1"><h2 className="font-bold text-ink dark:text-white">AI Appointment Assistant</h2><p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> API connection required for responses</p></div><button aria-label="AI Appointment Assistant settings" className="icon-button" onClick={() => toast.info('Assistant settings are coming soon.')}><Settings2 size={17} /></button></header>
    <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-4 sm:p-6 dark:bg-slate-950/30">
      {messages.map((message, index) => <div key={`${index}-${message.at}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'rounded-br-sm bg-teal-600 text-white' : `rounded-bl-sm border bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200 ${message.failed ? 'border-amber-200 dark:border-amber-800' : 'border-slate-100 dark:border-slate-800'}`}`}><p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p><p className={`mt-2 text-[10px] ${message.role === 'user' ? 'text-teal-100' : 'text-slate-400'}`}>{message.at}{message.failed ? ' · Not sent to AI' : ''}</p></div></div>)}
      {pending && <div className="flex items-center gap-2 text-xs text-muted"><LoaderCircle size={15} className="animate-spin" /> Connecting to assistant…</div>}
    </div>
    <div className="border-t border-slate-100 p-3 sm:p-4 dark:border-slate-800">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">{prompts.map((prompt) => <button key={prompt} disabled={pending} onClick={() => void send(prompt)} className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-medium text-slate-600 hover:border-teal-300 hover:text-teal-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{prompt}</button>)}</div>
      <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); void send(); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about your clinic…" className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800" /><Button aria-label="Send message" disabled={!input.trim() || pending} className="h-11 w-11 justify-center px-0"><Send size={17} /></Button></form>
    </div>
  </section>;
}

function SettingsPage() {
  const [reminders, setReminders] = useState(localStorage.getItem('clinic-reminders') !== 'false');
  const [digest, setDigest] = useState(localStorage.getItem('clinic-digest') === 'true');
  const preferences = [
    { title: 'Appointment reminders', description: 'Keep your team informed before each visit.', value: reminders, change: (value: boolean) => { setReminders(value); localStorage.setItem('clinic-reminders', String(value)); } },
    { title: 'Weekly clinic summary', description: 'A weekly overview of activity and appointments.', value: digest, change: (value: boolean) => { setDigest(value); localStorage.setItem('clinic-digest', String(value)); } },
  ];
  return <div className="mx-auto max-w-4xl space-y-5">
    <header><p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">Workspace preferences</p><h2 className="mt-1 text-2xl font-extrabold text-ink dark:text-white">Settings</h2><p className="mt-1 text-sm text-muted">Make ClinicSaathi work the way your team does.</p></header>
    <section className="panel divide-y divide-slate-100 dark:divide-slate-800">
      <div className="p-5"><h3 className="font-bold text-ink dark:text-white">Notifications</h3><p className="mt-1 text-xs text-muted">These preferences are stored on this device.</p></div>
      {preferences.map((item) => <div className="flex items-center justify-between gap-4 p-5" key={item.title}><div><p className="text-sm font-semibold text-ink dark:text-white">{item.title}</p><p className="mt-1 text-xs text-muted">{item.description}</p></div><button aria-label={`${item.title} ${item.value ? 'enabled' : 'disabled'}`} role="switch" aria-checked={item.value} onClick={() => item.change(!item.value)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${item.value ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${item.value ? 'left-6' : 'left-1'}`} /></button></div>)}
    </section>
    <section className="panel p-5"><h3 className="font-bold text-ink dark:text-white">Clinic profile & team</h3><p className="mt-1 text-sm text-muted">Manage clinic profile, working hours, branches and team roles.</p><div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><div className="flex items-center gap-3"><ShieldCheck className="text-teal-700 dark:text-teal-300" size={20} /><div><p className="text-sm font-semibold text-ink dark:text-white">Profile management</p><p className="text-xs text-muted">Clinic API is not connected yet.</p></div></div><Button variant="outline" disabled>Coming soon <ChevronRight size={14} /></Button></div></section>
    <div className="flex items-center gap-2 text-xs text-muted"><Check size={14} className="text-teal-600" /> Preferences apply instantly on this device.</div>
  </div>;
}
