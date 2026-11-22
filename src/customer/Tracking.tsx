import { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck, GraduationCap, Phone, MessageSquare, Siren, Timer,
  CheckCircle2, Star, RefreshCcw, BadgeCheck, Navigation, KeyRound,
} from 'lucide-react';
import type { Booking } from '@/lib/types';
import { useStore, INR } from '@/lib/store';
import { serviceById } from '@/lib/data';
import { Badge, Button, Card, Stars } from '@/components/ui';
import { FEEDBACK_TAGS } from '@/lib/data';

const STEPS: { key: Booking['status']; label: string; desc: string }[] = [
  { key: 'searching', label: 'Finding your expert', desc: 'Matching with trained experts near you' },
  { key: 'assigned', label: 'Expert assigned', desc: 'Your expert is preparing to head over' },
  { key: 'arriving', label: 'Arriving in ~10 mins', desc: 'Track them on the map live' },
  { key: 'otp', label: 'Share OTP to start', desc: 'Expert has arrived at your door' },
  { key: 'in_progress', label: 'Service in progress', desc: 'Session timer is running' },
  { key: 'completed', label: 'Completed', desc: 'Hope everything went well' },
];

const ORDER: Booking['status'][] = ['searching', 'assigned', 'arriving', 'otp', 'in_progress', 'completed'];

function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ExpertCard({ expertId }: { expertId: string }) {
  const { experts } = useStore();
  const e = experts.find((x) => x.id === expertId);
  if (!e) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
      <img src={e.photoUrl} alt={e.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-500/40" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-bold text-slate-900">{e.name}</p>
          {e.idVerified && <BadgeCheck size={15} className="shrink-0 text-emerald-600" />}
        </div>
        <p className="text-xs text-slate-500">
          ★ {e.rating} · {e.jobsDone.toLocaleString('en-IN')} jobs · {e.yearsExp} yrs exp
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {e.idVerified && <Badge tone="green"><ShieldCheck size={11} /> ID verified</Badge>}
          {e.backgroundChecked && <Badge tone="blue"><ShieldCheck size={11} /> Police verified</Badge>}
          <Badge tone="amber"><GraduationCap size={11} /> Trained</Badge>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white" aria-label="Call"><Phone size={17} /></button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-600" aria-label="Chat"><MessageSquare size={17} /></button>
      </div>
    </div>
  );
}

export function TrackingScreen({ booking, onBack }: { booking: Booking; onBack: () => void }) {
  const { now, startService, completeBooking, extendSession, rateBooking, raiseIssue, cancelBooking, showToast } = useStore();
  const [otpInput, setOtpInput] = useState('');
  const [showRate, setShowRate] = useState(false);
  const [stars, setStars] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const svc = serviceById(booking.serviceId);
  const stepIdx = ORDER.indexOf(booking.status);
  const otp = booking.otp ?? '';

  const remainingMs = booking.endsAt ? booking.endsAt - now : 0;
  const overtimeMs = remainingMs < 0 ? -remainingMs : 0;

  useEffect(() => {
    if (booking.status === 'in_progress' && remainingMs <= 0 && booking.endsAt) {
      // auto-prompt completion when the hour is up (handled in UI, expert confirms)
    }
  }, [booking.status, remainingMs, booking.endsAt]);

  const progress = useMemo(() => {
    if (booking.status === 'in_progress' && booking.startedAt && booking.endsAt) {
      const pct = 1 - (booking.endsAt - now) / (booking.endsAt - booking.startedAt);
      return Math.min(1, Math.max(0, pct));
    }
    return stepIdx >= 0 ? (stepIdx + 1) / STEPS.length : 0;
  }, [booking, now, stepIdx]);

  if (booking.status === 'completed') {
    return (
      <div className="p-4 pt-6">
        <div className="text-center">
          <CheckCircle2 size={56} className="mx-auto text-emerald-600" />
          <h2 className="mt-3 text-xl font-bold text-slate-900">Service completed</h2>
          <p className="mt-1 text-sm text-slate-500">{svc.name} · {booking.hours} hr{booking.hours > 1 ? 's' : ''} · {INR(booking.total)} paid</p>
        </div>

        {booking.issueType !== 'none' && (
          <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-600/20">
            {booking.issueType === 'reservice'
              ? 'Re-service requested. A free revisit will be scheduled shortly.'
              : 'Refund requested. Our support team will call you within 2 hours.'}
          </div>
        )}

        {booking.rating === null ? (
          <Card className="mt-5">
            <p className="text-center text-sm font-bold text-slate-900">How was {booking.expertId ? 'your expert' : 'the service'}?</p>
            <div className="mt-3 flex justify-center"><Stars value={stars} onChange={setStars} size={34} /></div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {FEEDBACK_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${tags.includes(t) ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Button className="mt-4 w-full" onClick={() => { rateBooking(booking.id, stars, tags); setShowRate(true); }}>
              Submit rating
            </Button>
          </Card>
        ) : (
          <Card className="mt-5 text-center">
            <div className="flex justify-center"><Stars value={booking.rating} size={28} /></div>
            {booking.feedbackTags.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">{booking.feedbackTags.join(' · ')}</p>
            )}
          </Card>
        )}

        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => showToast('Invoice downloaded to your email')}>
              <RefreshCcw size={16} /> Invoice
            </Button>
            <Button variant="outline" onClick={() => showToast('Re-booking created — same service, same address')}>
              Book again
            </Button>
          </div>
          <Button variant="ghost" className="w-full" onClick={onBack}>Back to home</Button>
        </div>
        {showRate && null}
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Progress bar */}
      <div className="sticky top-0 z-30 bg-white/95 px-4 pb-3 pt-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">{STEPS[stepIdx]?.label ?? booking.status}</h2>
          <button onClick={() => cancelBooking(booking.id)} className="text-xs font-semibold text-red-600 hover:underline">Cancel</button>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-emerald-600 transition-all duration-700" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">{STEPS[stepIdx]?.desc}</p>
      </div>

      <div className="space-y-4 p-4">
        {booking.expertId && <ExpertCard expertId={booking.expertId} />}

        {booking.status === 'searching' && (
          <Card className="text-center">
            <div className="relative mx-auto h-20 w-20">
              <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-pulse-ring" />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-emerald-600 text-white"><Navigation size={28} /></span>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-900">Matching you with nearby experts…</p>
            <p className="mt-1 text-xs text-slate-500">Usually takes less than a minute</p>
          </Card>
        )}

        {booking.status === 'arriving' && (
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white"><Navigation size={22} /></div>
              <div>
                <p className="text-sm font-bold text-slate-900">{booking.expertId ? 'Your expert is on the way' : 'Arriving'}</p>
                <p className="text-xs text-slate-500">Live ETA · about 10 minutes</p>
              </div>
            </div>
            <div className="mt-3 h-28 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 ring-1 ring-slate-900/5">
              <div className="flex h-full items-center justify-center">
                <span className="flex items-center gap-2 text-sm font-medium text-emerald-800"><Navigation size={16} /> 1.2 km away · via main road</span>
              </div>
            </div>
          </Card>
        )}

        {booking.status === 'otp' && (
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><KeyRound size={22} /></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Your start OTP</p>
                <p className="text-xs text-slate-500">Share only after the expert arrives</p>
              </div>
            </div>
            <div className="mt-3 flex justify-center gap-3">
              {otp.split('').map((d, i) => (
                <span key={i} className="flex h-14 w-12 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-extrabold text-white">{d}</span>
              ))}
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-400">Demo: auto-shown. In production this reaches your SMS &amp; app.</p>
          </Card>
        )}

        {booking.status === 'in_progress' && (
          <>
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600"><Timer size={18} /><span className="text-sm font-medium">Session time</span></div>
                {overtimeMs > 0 ? (
                  <Badge tone="amber">Overtime</Badge>
                ) : (
                  <span className="text-sm font-bold text-slate-900">{formatClock(remainingMs)}</span>
                )}
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progress * 100}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {overtimeMs > 0
                  ? `Extra ${Math.ceil(overtimeMs / 60000)} min — you can extend the session or let it end.`
                  : `${svc.name} · ends at ${new Date(booking.endsAt ?? 0).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => extendSession(booking.id, 30, Math.round(svc.ratePerHour / 2))}>
                  Extend +30 min ({INR(Math.round(svc.ratePerHour / 2))})
                </Button>
                <Button onClick={() => completeBooking(booking.id)}>Mark done</Button>
              </div>
            </Card>

            <button
              onClick={() => showToast('Safety team notified — we are calling you now')}
              className="flex w-full items-center justify-center gap-2 rounded-3xl bg-red-600 py-4 font-bold text-white shadow-lg shadow-red-600/25 transition active:scale-[0.98]"
            >
              <Siren size={20} /> SOS — Emergency safety button
            </button>
            <p className="text-center text-xs text-slate-500">Connects to our 24×7 safety team &amp; local emergency services</p>
          </>
        )}

        {(booking.status === 'assigned' || booking.status === 'arriving' || booking.status === 'otp') && (
          <Card>
            <p className="text-sm font-bold text-slate-900">Booking details</p>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p>{svc.name} · {booking.hours} hr{booking.hours > 1 ? 's' : ''}</p>
              <p>{booking.addressSnapshot.line1}, {booking.addressSnapshot.society}</p>
              <p className="font-semibold text-slate-900">{INR(booking.total)} · {booking.paymentMethod.toUpperCase()}</p>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}

export { STEPS };
