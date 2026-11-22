import { useMemo, useState } from 'react';
import {
  MapPin, IndianRupee, Users, Activity, ShieldCheck, ShieldX,
  BadgeCheck, GraduationCap, Power, Clock,
} from 'lucide-react';
import { useStore, INR } from '@/lib/store';
import { SERVICES, serviceById } from '@/lib/data';
import { Badge, Button, Card, Sheet, Stars } from '@/components/ui';

type Tab = 'live' | 'zones' | 'pricing' | 'experts';

const TABS = [
  { id: 'live', label: 'Live bookings', icon: Activity },
  { id: 'zones', label: 'Zones', icon: MapPin },
  { id: 'pricing', label: 'Pricing', icon: IndianRupee },
  { id: 'experts', label: 'Experts', icon: Users },
] as const;

const STATUS_TONE = {
  searching: 'amber', assigned: 'blue', arriving: 'blue', otp: 'amber',
  in_progress: 'green', completed: 'slate', cancelled: 'red',
} as const;

export function AdminApp() {
  const [tab, setTab] = useState<Tab>('live');
  const { bookings, experts, zones } = useStore();

  const stats = useMemo(() => ({
    live: bookings.filter((b) => !['completed', 'cancelled'].includes(b.status)).length,
    online: experts.filter((e) => e.online).length,
    revenue: bookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + b.total, 0),
    zones: zones.filter((z) => z.active).length,
  }), [bookings, experts, zones]);

  return (
    <div className="pb-8">
      <div className="bg-slate-900 px-4 pb-5 pt-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Sahaj Operations</p>
            <h1 className="text-xl font-extrabold">Admin Console</h1>
          </div>
          <Badge tone="green"><span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live</Badge>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            { v: stats.live, l: 'Live jobs' },
            { v: stats.online, l: 'Experts online' },
            { v: INR(stats.revenue), l: 'GMV today' },
            { v: stats.zones, l: 'Active zones' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-white/10 p-2.5">
              <p className="text-sm font-extrabold">{s.v}</p>
              <p className="text-[10px] leading-tight text-slate-300">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky top-0 z-30 flex border-b border-slate-900/5 bg-white/95 backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold transition ${tab === t.id ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-400'}`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'live' && <LiveBookings />}
        {tab === 'zones' && <ZonesTab />}
        {tab === 'pricing' && <PricingTab />}
        {tab === 'experts' && <ExpertsTab />}
      </div>
    </div>
  );
}

function LiveBookings() {
  const { bookings } = useStore();
  if (bookings.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500">No bookings yet. Place one from the customer view to see it stream in live.</p>;
  }
  return (
    <div className="space-y-3">
      {bookings.map((b) => {
        const svc = serviceById(b.serviceId);
        return (
          <Card key={b.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{b.id} · {svc.name}</p>
                <p className="text-xs text-slate-500">{b.addressSnapshot.line1} — {b.addressSnapshot.pincode}</p>
              </div>
              <Badge tone={STATUS_TONE[b.status]}>{b.status.replace('_', ' ')}</Badge>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1"><Clock size={12} /> {b.mode === 'instant' ? 'Instant' : b.scheduledFor} · {b.hours}hr</span>
              <span className="font-bold text-slate-900">{INR(b.total)}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function ZonesTab() {
  const { zones, toggleZone, setZoneEta, showToast } = useStore();
  return (
    <div className="space-y-3">
      {zones.map((z) => (
        <Card key={z.id}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">{z.name}</p>
              <p className="text-xs text-slate-500">Pincodes: {z.pincodes}</p>
            </div>
            <button
              onClick={() => { toggleZone(z.id); showToast(`${z.name} zone ${z.active ? 'paused' : 'activated'}`); }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${z.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
            >
              <Power size={12} /> {z.active ? 'ACTIVE' : 'PAUSED'}
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Avg ETA</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={z.avgEtaMins}
                onChange={(e) => setZoneEta(z.id, Math.max(5, Math.min(60, Number(e.target.value) || 10)))}
                className="w-16 rounded-xl border border-slate-200 px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-600"
              />
              <span className="text-xs text-slate-500">min</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function PricingTab() {
  const [rates, setRates] = useState(() => Object.fromEntries(SERVICES.map((s) => [s.id, s.ratePerHour])));
  const { showToast } = useStore();
  return (
    <div className="space-y-3">
      {SERVICES.map((s) => (
        <Card key={s.id}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{s.name}</p>
              <p className="text-xs text-slate-500">Current: {INR(rates[s.id])}/hr</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-slate-500">₹</span>
              <input
                type="number"
                value={rates[s.id]}
                onChange={(e) => setRates((prev) => ({ ...prev, [s.id]: Math.max(99, Number(e.target.value) || 99) }))}
                className="w-20 rounded-xl border border-slate-200 px-2 py-1.5 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </Card>
      ))}
      <Button className="w-full" onClick={() => showToast('New hourly rates published to all live zones')}>
        Save & publish rates
      </Button>
      <p className="text-center text-xs text-slate-400">Demo: rate edits are local to this session. Fees (6%) and GST (18%) apply on top automatically.</p>
    </div>
  );
}

function ExpertsTab() {
  const { experts, toggleExpertOnline, showToast } = useStore();
  const [detail, setDetail] = useState<string | null>(null);
  const e = experts.find((x) => x.id === detail);

  return (
    <div className="space-y-3">
      {experts.map((x) => (
        <Card key={x.id}>
          <div className="flex items-center gap-3">
            <img src={x.photoUrl} alt={x.name} className="h-11 w-11 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-bold text-slate-900">{x.name}</p>
                {x.online && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
              </div>
              <p className="text-xs text-slate-500">★ {x.rating} · {x.jobsDone.toLocaleString('en-IN')} jobs · {INR(x.todayEarnings)} today</p>
            </div>
            <button onClick={() => setDetail(x.id)} className="text-xs font-semibold text-emerald-700">Manage</button>
          </div>
        </Card>
      ))}

      <Sheet open={!!e} onClose={() => setDetail(null)} title={e?.name ?? ''}>
        {e && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={e.photoUrl} alt={e.name} className="h-16 w-16 rounded-2xl object-cover" />
              <div>
                <div className="flex justify-center sm:justify-start"><Stars value={Math.round(e.rating)} size={18} /></div>
                <p className="mt-1 text-xs text-slate-500">{e.jobsDone.toLocaleString('en-IN')} jobs · {e.yearsExp} yrs · {e.languages.join(', ')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <VerifRow label="ID (Aadhaar) verification" ok={e.idVerified} />
              <VerifRow label="Police background check" ok={e.backgroundChecked} />
              <VerifRow label="Skill training completed" ok={e.trainedOn.length >= 2} />
            </div>

            <div className="flex flex-col gap-2">
              {(!e.idVerified || !e.backgroundChecked) && (
                <Button
                  className="w-full"
                  onClick={() => { showToast(`${e.name}'s pending verifications marked approved`); setDetail(null); }}
                >
                  <ShieldCheck size={16} /> Approve pending verifications
                </Button>
              )}
              <Button
                variant={e.online ? 'outline' : 'primary'}
                className="w-full"
                onClick={() => { toggleExpertOnline(e.id); showToast(`${e.name} set ${e.online ? 'offline' : 'online'}`); }}
              >
                {e.online ? <><ShieldX size={16} /> Suspend & set offline</> : <><BadgeCheck size={16} /> Set online</>}
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function VerifRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-700">{label}</span>
      {ok ? <Badge tone="green"><BadgeCheck size={12} /> Verified</Badge> : <Badge tone="amber"><GraduationCap size={12} /> Pending</Badge>}
    </div>
  );
}
