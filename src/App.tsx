import { useState } from 'react';
import { UserRound, HardHat, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { CustomerApp } from '@/customer/CustomerApp';
import { ExpertApp } from '@/expert/ExpertApp';
import { AdminApp } from '@/admin/AdminApp';
import { Toast } from '@/components/ui';

const ROLES = [
  { id: 'customer', label: 'Customer', icon: UserRound, hint: 'Book home help' },
  { id: 'expert', label: 'Expert', icon: HardHat, hint: 'Partner app' },
  { id: 'admin', label: 'Admin', icon: ShieldCheck, hint: 'Ops console' },
];

export default function App() {
  const { role, setRole } = useStore();
  const [picked, setPicked] = useState(false);

  if (!picked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 via-stone-100 to-stone-100 p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12l9-8 9 8" /><path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Sahaj</h1>
            <p className="mt-1 text-sm text-slate-600">10-minute home help &amp; cleaning, at your door</p>
          </div>
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Choose a demo view</p>
          <div className="space-y-3">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => { setRole(r.id); setPicked(true); }}
                className="flex w-full items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-900/5 transition-all hover:ring-emerald-600/40 hover:shadow-md active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <r.icon size={24} />
                </span>
                <span>
                  <span className="block font-bold text-slate-900">{r.label}</span>
                  <span className="block text-sm text-slate-500">{r.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-stone-100 shadow-xl sm:my-0">
      {role === 'customer' && <CustomerApp />}
      {role === 'expert' && <ExpertApp />}
      {role === 'admin' && <AdminApp />}
      <Toast />
      <button
        onClick={() => setPicked(false)}
        className="fixed bottom-4 right-4 z-[70] rounded-full bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-white shadow-lg backdrop-blur transition hover:bg-slate-900"
      >
        Switch view
      </button>
    </div>
  );
}
