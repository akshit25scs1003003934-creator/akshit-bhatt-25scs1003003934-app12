import { useMemo, useState } from 'react';
import {
  Home, ShowerHead, CookingPot, UtensilsCrossed, Shirt, ChefHat,
  Clock, MapPin, ShieldCheck, ChevronRight, Ticket, Receipt,
  History as HistoryIcon, Sparkles, BadgeCheck, CalendarClock, Zap,
} from 'lucide-react';
import type { Booking, ServiceId } from '@/lib/types';
import { useStore, INR } from '@/lib/store';
import { SERVICES, serviceById, ZONES } from '@/lib/data';
import { Badge, Button, Card, Sheet, Stars } from '@/components/ui';
import { AddressPill } from './Address';
import { TrackingScreen } from './Tracking';
import { CheckoutScreen } from './Checkout';
import type { ServiceCategory } from '@/lib/types';

const ICONS: Record<string, typeof Home> = {
  Home, ShowerHead, CookingPot, UtensilsCrossed, Shirt, ChefHat,
};

const STATUS_LABEL: Record<Booking['status'], string> = {
  searching: 'Finding expert',
  assigned: 'Expert assigned',
  arriving: 'Arriving ~10 min',
  otp: 'Arrived — share OTP',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

type Tab = 'book' | 'bookings' | 'account';

export function CustomerApp() {
  const { bookings, addresses, selectedAddressId } = useStore();
  const [tab, setTab] = useState<Tab>('book');
  const [service, setService] = useState<ServiceCategory | null>(null);
  const [tracking, setTracking] = useState<Booking | null>(null);

  const address = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];
  const live = useMemo(
    () => bookings.find((b) => ['searching', 'assigned', 'arriving', 'otp', 'in_progress'].includes(b.status)),
    [bookings]
  );

  if (tracking) {
    const fresh = bookings.find((b) => b.id === tracking.id);
    if (fresh && !['completed', 'cancelled'].includes(fresh.status)) {
      return <TrackingScreen booking={fresh} onBack={() => setTracking(null)} />;
    }
    if (fresh) {
      return <TrackingScreen booking={fresh} onBack={() => setTracking(null)} />;
    }
  }

  return (
    <div className="pb-28">
      {service ? (
        <CheckoutScreen
          service={service}
          onBack={() => setService(null)}
          onBooked={(b) => { setService(null); setTracking(bookings.find((x) => x.id === b.id) ?? b); }}
        />
      ) : (
        <>
          {/* Header */}
          <div className="bg-gradient-to-b from-emerald-700 to-emerald-600 px-4 pb-16 pt-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-100">Home help in 10 minutes</p>
                <div className="mt-1"><AddressPill /></div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                <ShieldCheck size={20} />
              </div>
            </div>
          </div>

          <div className="-mt-10 space-y-4 px-4">
            {live ? (
              <button onClick={() => setTracking(live)} className="block w-full text-left">
                <Card className="ring-2 ring-emerald-600/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge tone="green">{STATUS_LABEL[live.status]}</Badge>
                      <p className="mt-2 font-bold text-slate-900">{serviceById(live.serviceId).name}</p>
                      <p className="text-xs text-slate-500">{live.addressSnapshot.line1}</p>
                    </div>
                    <ChevronRight size={20} className="text-slate-400" />
                  </div>
                </Card>
              </button>
            ) : (
              <Card className="bg-gradient-to-br from-amber-50 to-white">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Zap size={20} /></span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">First booking? Get 50% off</p>
                    <p className="text-xs text-slate-500">Use code FIRST50 at checkout</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Services */}
            <div>
              <h3 className="mb-3 text-base font-bold text-slate-900">What do you need help with?</h3>
              <div className="grid grid-cols-2 gap-3">
                {SERVICES.map((s) => {
                  const Icon = ICONS[s.icon] ?? Home;
                  return (
                    <button key={s.id} onClick={() => setService(s)} className="text-left">
                      <Card className="h-full transition-all hover:ring-emerald-600/40 active:scale-[0.98]">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                          <Icon size={22} />
                        </span>
                        <p className="mt-3 text-sm font-bold leading-tight text-slate-900">{s.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{s.tagline}</p>
                        <p className="mt-2 text-sm font-extrabold text-slate-900">{INR(s.ratePerHour)}<span className="text-xs font-medium text-slate-500">/hr</span></p>
                      </Card>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Why trust us */}
            <Card>
              <p className="text-sm font-bold text-slate-900">Every expert is</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: BadgeCheck, label: 'ID verified' },
                  { icon: ShieldCheck, label: 'Background checked' },
                  { icon: Sparkles, label: 'Skill trained' },
                ].map((t) => (
                  <div key={t.label} className="rounded-2xl bg-slate-50 p-3">
                    <t.icon size={18} className="mx-auto text-emerald-600" />
                    <p className="mt-1.5 text-[11px] font-semibold leading-tight text-slate-700">{t.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Bottom nav */}
          <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-slate-900/5 bg-white/95 backdrop-blur safe-bottom">
            <div className="grid grid-cols-3">
              {([
                { id: 'book', label: 'Book', icon: Home },
                { id: 'bookings', label: 'Bookings', icon: HistoryIcon },
                { id: 'account', label: 'Account', icon: Ticket },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex flex-col items-center gap-0.5 py-3 text-[11px] font-semibold transition ${tab === t.id ? 'text-emerald-700' : 'text-slate-400'}`}
                >
                  <t.icon size={20} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tab === 'bookings' && (
            <Sheet open onClose={() => setTab('book')} title="Your bookings">
              <BookingHistory onTrack={setTracking} />
            </Sheet>
          )}
          {tab === 'account' && (
            <Sheet open onClose={() => setTab('book')} title="Offers & account">
              <div className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="font-bold text-emerald-800">Invite friends, earn ₹100</p>
                  <p className="mt-1 text-xs text-emerald-700">Share code SAHAJ-REF for ₹100 off their first booking.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-800">Payment methods</p>
                  <p className="mt-1 text-xs text-slate-500">UPI, cards, wallets & cash on completion supported.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-800">Safety centre</p>
                  <p className="mt-1 text-xs text-slate-500">24×7 SOS support during every session. Emergency contact: 112.</p>
                </div>
              </div>
            </Sheet>
          )}

          {/* default address zone notice */}
          {!ZONES.some((z) => z.pincode === address.pincode && z.active) && tab === 'book' && (
            <div className="fixed inset-x-4 bottom-24 z-30 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-600/20">
              <CalendarClock size={14} className="mr-1 inline" /> Instant service is not live in {address.pincode} yet — scheduled bookings are available.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BookingHistory({ onTrack }: { onTrack: (b: Booking) => void }) {
  const { bookings } = useStore();
  const [ratingFor, setRatingFor] = useState<Booking | null>(null);
  const [stars, setStars] = useState(5);

  if (bookings.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">No bookings yet — book your first service.</p>;
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => {
        const svc = serviceById(b.serviceId);
        return (
          <Card key={b.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{svc.name}</p>
                <p className="text-xs text-slate-500">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {b.hours} hr · {b.mode === 'instant' ? 'Instant' : b.scheduledFor}</p>
              </div>
              <Badge tone={b.status === 'completed' ? 'green' : b.status === 'cancelled' ? 'red' : 'amber'}>{STATUS_LABEL[b.status]}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">{INR(b.total)}</span>
              <div className="flex gap-2">
                {b.status === 'completed' && b.rating === null && (
                  <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => setRatingFor(b)}>Rate</Button>
                )}
                {!['cancelled'].includes(b.status) && (
                  <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => onTrack(b)}>
                    <Receipt size={14} className="mr-1" /> {b.status === 'completed' ? 'Invoice' : 'Track'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
      <Sheet open={!!ratingFor} onClose={() => setRatingFor(null)} title="Rate your expert">
        <div className="flex flex-col items-center">
          <Stars value={stars} onChange={setStars} size={36} />
          <Button className="mt-5 w-full" onClick={() => setRatingFor(null)}>Submit</Button>
        </div>
      </Sheet>
    </div>
  );
}
