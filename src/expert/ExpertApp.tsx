import { useMemo, useState } from 'react';
import {
  Power, MapPin, Clock, Wallet, Timer, LogOut, Phone, Navigation,
  BadgeCheck, GraduationCap, Star, ShieldAlert, ChevronRight,
} from 'lucide-react';
import type { Booking } from '@/lib/types';
import { useStore, INR } from '@/lib/store';
import { serviceById, ZONES } from '@/lib/data';
import { Badge, Button, Card, Sheet } from '@/components/ui';

const ME = 'e1'; // demo: we are Lakshmi

export function ExpertApp() {
  const { experts, bookings, expertEarnings, toggleExpertOnline, assignExpert, startService, completeBooking, now, showToast } = useStore();
  const me = experts.find((e) => e.id === ME)!;
  const earn = expertEarnings[ME] ?? { today: 0, shiftMinutes: 0 };
  const [otpFor, setOtpFor] = useState<Booking | null>(null);
  const [otpInput, setOtpInput] = useState('');

  // Jobs relevant to me: unassigned instant bookings (requests) + mine
  const requests = useMemo(
    () => bookings.filter((b) => b.mode === 'instant' && b.status === 'searching' && !b.expertId),
    [bookings]
  );
  const myJobs = useMemo(
    () => bookings.filter((b) => b.expertId === ME && ['assigned', 'arriving', 'otp', 'in_progress'].includes(b.status)),
    [bookings]
  );
  const doneToday = useMemo(
    () => bookings.filter((b) => b.expertId === ME && b.status === 'completed'),
    [bookings]
  );

  const hours = Math.floor(earn.shiftMinutes / 60);
  const mins = earn.shiftMinutes % 60;

  return (
    <div className="pb-8">
      {/* Header with online toggle */}
      <div className={`${me.online ? 'bg-gradient-to-b from-emerald-700 to-emerald-600' : 'bg-gradient-to-b from-slate-700 to-slate-600'} px-4 pb-6 pt-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={me.photoUrl} alt={me.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-white/40" />
            <div>
              <p className="font-bold">{me.name}</p>
              <p className="text-xs text-emerald-100">★ {me.rating} · {ZONES.find((z) => z.id === me.zoneId)?.name}</p>
            </div>
          </div>
          <button
            onClick={() => { toggleExpertOnline(ME); showToast(me.online ? 'You are now offline' : 'You are online — receiving jobs'); }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${me.online ? 'bg-white text-emerald-700' : 'bg-emerald-500 text-white'}`}
          >
            <Power size={14} /> {me.online ? 'ONLINE' : 'OFFLINE'}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-lg font-extrabold">{INR(earn.today)}</p>
            <p className="text-[11px] text-emerald-100">Today's earnings</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-lg font-extrabold">{myJobs.length}</p>
            <p className="text-[11px] text-emerald-100">Active jobs</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-lg font-extrabold">{hours}h {mins}m</p>
            <p className="text-[11px] text-emerald-100">Shift time</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* New job requests */}
        {me.online && requests.map((b) => {
          const svc = serviceById(b.serviceId);
          return (
            <Card key={b.id} className="ring-2 ring-amber-500/40">
              <div className="flex items-center justify-between">
                <Badge tone="amber"><Clock size={11} /> New request · respond fast</Badge>
                <span className="text-xs font-semibold text-slate-500">{Math.max(0, 30 - Math.floor((now - b.createdAt) / 1000))}s</span>
              </div>
              <p className="mt-2 font-bold text-slate-900">{svc.name} · {b.hours} hr</p>
              <p className="text-xs text-slate-500">{b.addressSnapshot.line1}, {b.addressSnapshot.society}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <MapPin size={13} /> ~{ZONES.find((z) => z.pincode === b.addressSnapshot.pincode)?.avgEtaMins ?? 10} min away ·
                <span className="font-bold text-emerald-700"> earn {INR(Math.round(b.total * 0.8))}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-10 text-sm" onClick={() => showToast('Request declined')}>Decline</Button>
                <Button className="h-10 text-sm" onClick={() => { assignExpert(b.id, ME); showToast('Job accepted — head to the address'); }}>Accept</Button>
              </div>
            </Card>
          );
        })}

        {/* My active jobs */}
        {myJobs.map((b) => {
          const svc = serviceById(b.serviceId);
          return (
            <Card key={b.id}>
              <div className="flex items-center justify-between">
                <Badge tone={b.status === 'in_progress' ? 'green' : 'blue'}>{b.status === 'in_progress' ? 'In progress' : b.status === 'otp' ? 'Arrived — verify OTP' : b.status === 'arriving' ? 'On the way' : 'Accepted'}</Badge>
                {b.mode === 'scheduled' && <span className="text-xs font-semibold text-slate-500">{b.scheduledFor}</span>}
              </div>
              <p className="mt-2 font-bold text-slate-900">{svc.name} · {b.hours} hr{b.hours > 1 ? 's' : ''}</p>
              <p className="text-xs text-slate-500">{b.addressSnapshot.line1}, {b.addressSnapshot.society} — {b.addressSnapshot.pincode}</p>

              {b.status === 'in_progress' ? (
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-emerald-50 p-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><Timer size={16} /> Session running</span>
                  <Button variant="dark" className="h-9 px-4 text-xs" onClick={() => completeBooking(b.id)}>End & complete</Button>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button onClick={() => showToast('Opening navigation…')} className="flex h-10 items-center justify-center rounded-2xl border border-slate-300 text-slate-700"><Navigation size={16} /></button>
                  <button onClick={() => showToast('Calling customer…')} className="flex h-10 items-center justify-center rounded-2xl border border-slate-300 text-slate-700"><Phone size={16} /></button>
                  <Button className="h-10 text-sm" onClick={() => { setOtpFor(b); setOtpInput(''); }}>
                    {b.status === 'otp' || b.status === 'arriving' ? 'Verify OTP' : 'Start OTP'}
                  </Button>
                </div>
              )}
            </Card>
          );
        })}

        {/* Safety */}
        <button onClick={() => showToast('Safety helpline connecting… stay calm, help is on the way')} className="flex w-full items-center justify-center gap-2 rounded-3xl bg-red-600 py-4 font-bold text-white shadow-lg shadow-red-600/25 active:scale-[0.98]">
          <ShieldAlert size={20} /> SOS — Safety helpline
        </button>

        {/* Earnings breakdown */}
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">Today's summary</p>
            <Wallet size={18} className="text-emerald-600" />
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600"><span>Jobs completed</span><span className="font-semibold text-slate-900">{doneToday.length}</span></div>
            <div className="flex justify-between text-slate-600"><span>Earnings (80% share)</span><span className="font-semibold text-slate-900">{INR(earn.today)}</span></div>
            <div className="flex justify-between text-slate-600"><span>Shift duration</span><span className="font-semibold text-slate-900">{hours}h {mins}m</span></div>
          </div>
          <Button variant="outline" className="mt-3 w-full" onClick={() => showToast('Weekly payout every Monday to your bank account')}>
            <LogOut size={16} /> Withdraw earnings
          </Button>
        </Card>

        {/* Verification status */}
        <Card>
          <p className="text-sm font-bold text-slate-900">Your verifications</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {me.idVerified && <Badge tone="green"><BadgeCheck size={12} /> Aadhaar / ID verified</Badge>}
            {me.backgroundChecked && <Badge tone="blue"><BadgeCheck size={12} /> Police background check</Badge>}
            <Badge tone="amber"><GraduationCap size={12} /> Skill trained ({me.trainedOn.length} services)</Badge>
            <Badge tone="slate"><Star size={12} /> {me.rating} rating</Badge>
          </div>
        </Card>
      </div>

      {/* OTP verify sheet */}
      <Sheet open={!!otpFor} onClose={() => setOtpFor(null)} title="Verify start OTP">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Ask the customer for the 4-digit start code shown in their app.</p>
          <div className="flex justify-center gap-3">
            {otpFor?.otp?.split('').map((d, i) => (
              <span key={`hint-${i}`} className="flex h-14 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-extrabold text-slate-900">{d}</span>
            ))}
          </div>
          <p className="text-center text-[11px] text-slate-400">(Demo hint: the correct code is shown above)</p>
          <input
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="Enter OTP"
            inputMode="numeric"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-center text-xl font-bold tracking-[0.4em] outline-none focus:border-emerald-600"
          />
          <Button
            className="w-full"
            disabled={otpInput.length !== 4 || !otpFor}
            onClick={() => {
              if (otpFor && startService(otpFor.id, otpInput)) {
                setOtpFor(null);
              } else {
                showToast('Wrong OTP — check with the customer again');
              }
            }}
          >
            Verify & start service
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
