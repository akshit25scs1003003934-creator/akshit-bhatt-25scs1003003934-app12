import { useMemo, useState } from 'react';
import { Check, X, Tag, ShieldCheck, Clock } from 'lucide-react';
import type { ServiceCategory } from '@/lib/types';
import { useStore, INR, calcPricing } from '@/lib/store';
import { PAYMENT_METHODS, PROMOS, SLOT_TIMES } from '@/lib/data';
import { Badge, Button, Card, PageHeader, Sheet, Stepper } from '@/components/ui';
import { ModePicker } from './Address';
import type { Booking } from '@/lib/types';

export function CheckoutScreen({ service, onBack, onBooked }: { service: ServiceCategory; onBack: () => void; onBooked: (b: Booking) => void }) {
  const { addresses, selectedAddressId, createBooking, showToast, zones } = useStore();
  const [hours, setHours] = useState(2);
  const [mode, setMode] = useState<'instant' | 'scheduled'>('instant');
  const [slot, setSlot] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState(PAYMENT_METHODS[0].id);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [showWhat, setShowWhat] = useState(false);

  const address = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];
  const pricing = useMemo(() => calcPricing(service.id, hours, promoCode), [service.id, hours, promoCode]);
  const addrZone = zones.find((z) => z.pincode === address.pincode);
  const served = addrZone?.active;

  const book = () => {
    if (mode === 'scheduled' && !slot) return;
    const id = createBooking({
      serviceId: service.id,
      hours,
      mode,
      scheduledFor: mode === 'scheduled' ? slot : null,
      addressId: address.id,
      addressSnapshot: address,
      paymentMethod: payMethod,
      promoCode,
      promoDiscount: pricing.promoDiscount,
      priceSubtotal: pricing.subtotal,
      fees: pricing.fees,
      tax: pricing.tax,
      total: pricing.total,
    });
    showToast(mode === 'instant' ? 'Booking placed — finding your expert' : 'Slot reserved — expert will be assigned');
    onBooked({ id, status: mode === 'instant' ? 'searching' : 'assigned' } as Booking);
  };

  return (
    <div className="pb-32">
      <PageHeader title="Book service" onBack={onBack} />

      <div className="space-y-4 p-4">
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Clock size={22} /></span>
            <div>
              <p className="font-bold text-slate-900">{service.name}</p>
              <p className="text-xs text-slate-500">{service.tagline}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</p>
            <div className="flex items-center justify-between">
              <Stepper value={hours} onChange={setHours} min={1} max={4} />
              <span className="text-sm font-semibold text-slate-900">{INR(service.ratePerHour)}/hr</span>
            </div>
          </div>
        </Card>

        <Card>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">When do you need help?</p>
          <ModePicker mode={mode} onChange={setMode} />
          {mode === 'instant' && (
            <div className={`mt-3 rounded-2xl p-3 text-sm ${served ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
              {served
                ? `Good news — experts are available near ${address.pincode}, arriving in ~${addrZone?.avgEtaMins ?? 10} mins.`
                : `Sorry, ${address.pincode} is outside our live zones right now. Try scheduling instead.`}
            </div>
          )}
          {mode === 'scheduled' && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {SLOT_TIMES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${slot === s ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-700'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </Card>

        <button onClick={() => setShowWhat(true)} className="w-full">
          <Card className="text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">What's included / not included</span>
              <span className="text-xs font-semibold text-emerald-700">View all</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {service.included.slice(0, 2).map((i) => <Badge key={i} tone="green"><Check size={11} /> {i}</Badge>)}
              {service.notIncluded.slice(0, 1).map((i) => <Badge key={i} tone="red"><X size={11} /> {i}</Badge>)}
            </div>
          </Card>
        </button>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">Payment method</p>
            <button onClick={() => setPromoOpen(true)} className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <Tag size={14} /> {promoCode ?? 'Add promo'}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPayMethod(p.id)}
                className={`rounded-2xl border p-3 text-left transition ${payMethod === p.id ? 'border-emerald-600 bg-emerald-50/60' : 'border-slate-200'}`}
              >
                <span className="block text-sm font-bold text-slate-900">{p.label}</span>
                <span className="block text-[11px] text-slate-500">{p.sub}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-bold text-slate-900">Bill details</p>
          <div className="mt-3 space-y-2 text-sm">
            <Row label={`Service (${hours} hr × ${INR(service.ratePerHour)})`} value={INR(pricing.subtotal)} />
            <Row label="Platform & convenience fee (6%)" value={INR(pricing.fees)} />
            <Row label="GST (18%)" value={INR(pricing.tax)} />
            {pricing.promoDiscount > 0 && <Row label={`Promo ${promoCode}`} value={`− ${INR(pricing.promoDiscount)}`} green />}
            <div className="border-t border-slate-100 pt-2">
              <Row label="Total payable" value={INR(pricing.total)} bold />
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            All experts are ID-verified, background-checked and skill-trained. You pay only after service starts — free cancellation before the expert begins.
          </div>
        </Card>
      </div>

      {/* Sticky checkout bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-slate-900/5 bg-white/95 p-4 backdrop-blur safe-bottom">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-extrabold text-slate-900">{INR(pricing.total)}</p>
            <p className="text-[11px] text-slate-500">{hours} hr · incl. taxes & fees</p>
          </div>
          <Button
            className="flex-1"
            disabled={(mode === 'scheduled' && !slot) || (mode === 'instant' && !served)}
            onClick={book}
          >
            {mode === 'instant' ? 'Book now · pay after' : 'Confirm slot'}
          </Button>
        </div>
      </div>

      <Sheet open={promoOpen} onClose={() => setPromoOpen(false)} title="Offers & promo codes">
        <div className="space-y-3">
          {PROMOS.map((p) => {
            const eligible = pricing.subtotal >= p.minOrder;
            return (
              <button
                key={p.code}
                disabled={!eligible}
                onClick={() => { setPromoCode(p.code); setPromoOpen(false); showToast(`${p.code} applied`); }}
                className={`w-full rounded-2xl border p-4 text-left transition ${promoCode === p.code ? 'border-emerald-600 bg-emerald-50/60' : eligible ? 'border-slate-200 hover:border-emerald-500' : 'border-slate-100 opacity-50'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-dashed border-emerald-600 px-2 py-0.5 text-xs font-bold text-emerald-700">{p.code}</span>
                  {promoCode === p.code && <span className="text-xs font-semibold text-emerald-700">Applied</span>}
                </div>
                <p className="mt-2 text-sm font-medium text-slate-800">{p.description}</p>
                <p className="text-xs text-slate-500">Min order {INR(p.minOrder)}</p>
              </button>
            );
          })}
        </div>
      </Sheet>

      <Sheet open={showWhat} onClose={() => setShowWhat(false)} title={`What's included — ${service.name}`}>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700">Included</p>
            <ul className="space-y-2">
              {service.included.map((i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><Check size={16} className="mt-0.5 shrink-0 text-emerald-600" /> {i}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-red-600">Not included</p>
            <ul className="space-y-2">
              {service.notIncluded.map((i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-500"><X size={16} className="mt-0.5 shrink-0 text-red-500" /> {i}</li>
              ))}
            </ul>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function Row({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`${bold ? 'font-bold text-slate-900' : 'text-slate-600'} ${green ? 'text-emerald-700' : ''}`}>{label}</span>
      <span className={`${bold ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-800'} ${green ? 'text-emerald-700' : ''}`}>{value}</span>
    </div>
  );
}
