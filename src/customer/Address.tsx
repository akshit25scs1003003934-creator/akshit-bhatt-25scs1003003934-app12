import { useMemo, useState } from 'react';
import { Clock, MapPin, ChevronRight, Home as HomeIcon, Building2, Plus, Check, Calendar } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ZONES } from '@/lib/data';
import { Button, Sheet } from '@/components/ui';

export function AddressSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addresses, selectedAddressId, setSelectedAddressId, addAddress } = useStore();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('Home');
  const [line1, setLine1] = useState('');
  const [society, setSociety] = useState('');
  const [pincode, setPincode] = useState('');
  const [detecting, setDetecting] = useState(false);

  const zone = useMemo(() => ZONES.find((z) => z.pincode === pincode), [pincode]);

  const detect = () => {
    setDetecting(true);
    setTimeout(() => {
      setLabel('Current location');
      setLine1('B-702, Sobha Dream Acres');
      setSociety('Sobha Dream Acres, Panathur Main Road');
      setPincode('560103');
      setDetecting(false);
    }, 900);
  };

  const save = () => {
    if (!line1.trim() || !/^\d{6}$/.test(pincode)) return;
    addAddress({ label, line1, society, pincode, isDefault: false });
    onClose();
  };

  if (adding) {
    return (
      <Sheet open={open} onClose={onClose} title="Add address">
        <div className="space-y-4">
          <div className="flex gap-2">
            {['Home', 'Work', 'Other'].map((l) => (
              <button
                key={l}
                onClick={() => setLabel(l)}
                className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${label === l ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'}`}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={detect}
            className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-emerald-500 bg-emerald-50/60 p-4 text-left"
          >
            <MapPin size={22} className="text-emerald-600" />
            <span className="flex-1">
              <span className="block text-sm font-bold text-slate-900">{detecting ? 'Detecting…' : 'Use my current location'}</span>
              <span className="block text-xs text-slate-500">GPS · accurate to building</span>
            </span>
          </button>

          <div className="space-y-2">
            <input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Flat / house no., building" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600" />
            <input value={society} onChange={(e) => setSociety(e.target.value)} placeholder="Society / apartment / street" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600" />
            <div className="relative">
              <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Pincode" inputMode="numeric" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600" />
            </div>
          </div>

          {pincode.length === 6 && zone && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">
              <Check size={16} /> {zone.name} is served — experts arrive in ~{zone.avgEtaMins} mins
            </div>
          )}
          {pincode.length === 6 && !zone && (
            <div className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
              We don't serve {pincode} yet — join the waitlist and we'll notify you.
            </div>
          )}

          <Button onClick={save} disabled={!line1.trim() || pincode.length !== 6} className="w-full">Save address</Button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title="Your addresses">
      <div className="space-y-3">
        {addresses.map((a) => {
          const served = ZONES.some((z) => z.pincode === a.pincode && z.active);
          return (
            <button
              key={a.id}
              onClick={() => { setSelectedAddressId(a.id); onClose(); }}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${selectedAddressId === a.id ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'}`}
            >
              {a.label === 'Home' ? <HomeIcon size={20} className="mt-0.5 text-emerald-600" /> : <Building2 size={20} className="mt-0.5 text-emerald-600" />}
              <span className="flex-1">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  {a.label}
                  {selectedAddressId === a.id && <Check size={16} className="text-emerald-600" />}
                </span>
                <span className="block text-sm text-slate-500">{a.line1}, {a.society} — {a.pincode}</span>
                {!served && <span className="mt-1 block text-xs font-medium text-amber-700">Outside live zones</span>}
              </span>
            </button>
          );
        })}
        <Button variant="outline" onClick={() => setAdding(true)} className="w-full">
          <Plus size={18} /> Add new address
        </Button>
      </div>
    </Sheet>
  );
}

export function AddressPill() {
  const { addresses, selectedAddressId } = useStore();
  const [open, setOpen] = useState(false);
  const addr = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-left">
        <MapPin size={16} className="text-emerald-600" />
        <span className="max-w-[220px] truncate text-sm font-semibold text-slate-800">{addr.line1}</span>
        <ChevronRight size={16} className="text-slate-400" />
      </button>
      <AddressSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function ModePicker({ mode, onChange }: { mode: 'instant' | 'scheduled'; onChange: (m: 'instant' | 'scheduled') => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {([
        { id: 'instant', title: 'Instant', sub: 'Expert in ~10 mins', icon: Clock },
        { id: 'scheduled', title: 'Schedule', sub: 'Pick a date & slot', icon: Calendar },
      ] as const).map((o) => {
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`rounded-2xl border p-4 text-left transition ${mode === o.id ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600' : 'border-slate-200 bg-white'}`}
          >
            <Icon size={20} className={mode === o.id ? 'text-emerald-600' : 'text-slate-400'} />
            <span className="mt-2 block text-sm font-bold text-slate-900">{o.title}</span>
            <span className="block text-xs text-slate-500">{o.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
