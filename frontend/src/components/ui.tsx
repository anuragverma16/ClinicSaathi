import { useEffect } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { AlertCircle, LoaderCircle, Search, X } from 'lucide-react';

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' }) {
  const classes = variant === 'primary' ? 'button-primary' : variant === 'outline' ? 'button-outline' : 'button-ghost';
  return <button className={`${classes} ${className}`} {...props}>{children}</button>;
}

export function LoadingScreen() {
  return <div className="grid min-h-screen place-items-center bg-canvas dark:bg-slate-950"><LoaderCircle className="animate-spin text-teal-600" size={30} /></div>;
}

export function LoadingRows() {
  return <div className="space-y-3 p-5" aria-label="Loading records">{[1, 2, 3, 4].map((item) => <div className="skeleton h-12" key={item} />)}</div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="grid min-h-52 place-items-center p-8 text-center"><div><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Search size={20} /></div><h3 className="mt-4 font-semibold text-ink dark:text-white">{title}</h3><p className="mt-1 text-sm text-muted">{description}</p></div></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="grid min-h-52 place-items-center p-8 text-center"><div><AlertCircle className="mx-auto text-rose-500" size={26} /><h3 className="mt-3 font-semibold text-ink dark:text-white">We couldn't load this view</h3><p className="mt-1 text-sm text-muted">{message}</p><Button className="mt-4" onClick={onRetry}>Try again</Button></div></div>;
}

export function Modal({ title, onClose, children, className = '', titleClassName = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string; titleClassName?: string }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={`w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 ${className}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <header className="mb-5 flex items-center justify-between"><h2 id="modal-title" className={`text-lg font-bold text-ink dark:text-white ${titleClassName}`}>{title}</h2><button className="icon-button" aria-label="Close" onClick={onClose}><X size={18} /></button></header>
      {children}
    </section>
  </div>;
}
