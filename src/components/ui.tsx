import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { useStore } from '@/lib/store';

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] shadow-sm shadow-emerald-600/20',
  dark: 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]',
  outline: 'border border-slate-300 bg-white text-slate-800 hover:border-slate-400 active:scale-[0.98]',
  ghost: 'text-slate-700 hover:bg-slate-100 active:scale-[0.98]',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 ${className}`}>{children}</div>;
}

export function Badge({ children, tone = 'green', className = '' }: { children: ReactNode; tone?: 'green' | 'amber' | 'red' | 'slate' | 'blue'; className?: string }) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    red: 'bg-red-50 text-red-700 ring-red-600/20',
    slate: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-950/40 animate-fade-in" onClick={onClose} />
      <div className="relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl animate-slide-up sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PageHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-900/5 bg-white/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-1">
        {onBack && (
          <button onClick={onBack} className="rounded-full p-2 -ml-2 text-slate-700 hover:bg-slate-100">
            <ChevronLeft size={22} />
          </button>
        )}
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div className="pointer-events-auto rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl animate-slide-up">
        {toast}
      </div>
    </div>
  );
}

export function Stepper({ value, onChange, min = 1, max = 4 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="h-10 w-10 rounded-full border border-slate-300 text-lg font-semibold text-slate-700 disabled:opacity-30 hover:border-slate-400"
      >
        −
      </button>
      <span className="w-20 text-center text-base font-bold text-slate-900">{value} hr{value > 1 ? 's' : ''}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="h-10 w-10 rounded-full border border-slate-300 text-lg font-semibold text-slate-700 disabled:opacity-30 hover:border-slate-400"
      >
        +
      </button>
    </div>
  );
}

export function Stars({ value, onChange, size = 24 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={`transition-transform ${onChange ? 'hover:scale-110 active:scale-95' : ''}`}
          disabled={!onChange}
          aria-label={`${n} star`}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill={n <= value ? '#f59e0b' : '#e2e8f0'}>
            <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.2l7.1-.6L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
