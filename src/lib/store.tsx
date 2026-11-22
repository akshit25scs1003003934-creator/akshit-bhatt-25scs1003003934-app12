import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Booking, Expert, SavedAddress, Zone } from './types';
import { ADDRESSES, EXPERTS, PROMOS, SERVICES, ZONES } from './data';

export interface CartService {
  serviceId: string;
  hours: number;
}

interface StoreState {
  role: string;
  setRole: (r: string) => void;
  addresses: SavedAddress[];
  addAddress: (a: Omit<SavedAddress, 'id'>) => void;
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  experts: Expert[];
  zones: Zone[];
  toggleExpertOnline: (id: string) => void;
  toggleZone: (id: string) => void;
  setZoneEta: (id: string, eta: number) => void;
  expertEarnings: Record<string, { today: number; shiftMinutes: number }>;
  addEarnings: (expertId: string, amount: number, minutes: number) => void;
  bookings: Booking[];
  createBooking: (b: Omit<Booking, 'id' | 'createdAt' | 'status' | 'expertId' | 'otp' | 'startedAt' | 'endsAt' | 'extendedMinutes' | 'rating' | 'feedbackTags' | 'issueType'>) => string;
  cancelBooking: (id: string) => void;
  rescheduleBooking: (id: string, slot: string) => void;
  assignExpert: (bookingId: string, expertId: string) => void;
  rejectBooking: (bookingId: string) => void;
  markArriving: (bookingId: string) => void;
  startService: (bookingId: string, otp: string) => boolean;
  extendSession: (bookingId: string, extraMinutes: number, price: number) => void;
  completeBooking: (bookingId: string) => void;
  rateBooking: (bookingId: string, rating: number, tags: string[]) => void;
  raiseIssue: (bookingId: string, type: 'reservice' | 'refund') => void;
  now: number;
  toast: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreState | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore outside provider');
  return ctx;
}

export const INR = (n: number) => '₹' + n.toLocaleString('en-IN');

export function calcPricing(serviceId: string, hours: number, promoCode: string | null) {
  const svc = SERVICES.find((s) => s.id === serviceId)!;
  const subtotal = svc.ratePerHour * hours;
  const fees = Math.round(subtotal * 0.06);
  const tax = Math.round((subtotal + fees) * 0.18);
  let promoDiscount = 0;
  const promo = PROMOS.find((p) => p.code === promoCode);
  if (promo && subtotal >= promo.minOrder) {
    promoDiscount = promo.percentOff > 0
      ? Math.min(Math.round((subtotal * promo.percentOff) / 100), promo.maxOff)
      : promo.maxOff;
  }
  return {
    subtotal,
    fees,
    tax,
    promoDiscount,
    total: subtotal + fees + tax - promoDiscount,
  };
}

const STATUS_SECONDS: Record<string, number> = {
  searching: 5,
  assigned: 8,
  arriving: 10,
  otp: 12,
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState('customer');
  const [addresses, setAddresses] = useState<SavedAddress[]>(ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState(ADDRESSES[0].id);
  const [experts, setExperts] = useState<Expert[]>(EXPERTS);
  const [zones, setZones] = useState<Zone[]>(ZONES);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState<Record<string, { today: number; shiftMinutes: number }>>(() =>
    Object.fromEntries(EXPERTS.map((e) => [e.id, { today: e.todayEarnings, shiftMinutes: e.shiftMinutes }]))
  );
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // Simulated lifecycle: auto-advance bookings through statuses.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    bookings.forEach((b) => {
      if (b.status === 'searching') {
        const elapsed = (now - b.createdAt) / 1000;
        if (b.mode === 'instant' && elapsed >= STATUS_SECONDS.searching) {
          const zone = ZONES.find((z) => z.pincode === b.addressSnapshot.pincode);
          const pool = experts.filter(
            (e) => e.online && (!zone || e.zoneId === zone.id || e.zoneId === 'z1')
          );
          const expert = pool[0] ?? experts.find((e) => e.online);
          if (expert) {
            timers.push(setTimeout(() => assignExpert(b.id, expert.id), 10));
          }
        }
      } else if (b.status === 'assigned') {
        const elapsed = (now - b.createdAt) / 1000;
        if (b.mode === 'instant' && elapsed >= STATUS_SECONDS.searching + STATUS_SECONDS.assigned) {
          timers.push(setTimeout(() => markArriving(b.id), 10));
        }
        } else if (b.status === 'arriving') {
        const elapsed = (now - b.createdAt) / 1000;
        if (b.mode === 'instant' && elapsed >= STATUS_SECONDS.searching + STATUS_SECONDS.assigned + STATUS_SECONDS.arriving) {
          setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: 'otp', otp: String(Math.floor(1000 + Math.random() * 9000)) } : x)));
          showToast('Your expert has arrived — share the OTP to start');
        }
      } else if (b.status === 'otp' && !b.otp) {
        setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, otp: String(Math.floor(1000 + Math.random() * 9000)) } : x)));
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [bookings, now]);

  const assignExpert = (bookingId: string, expertId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: 'assigned', expertId } : b
      )
    );
    const expert = experts.find((e) => e.id === expertId);
    if (expert) showToast(`${expert.name} is assigned to your booking`);
  };

  const markArriving = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'arriving' } : b))
    );
  };

  const createBooking: StoreState['createBooking'] = (data) => {
    const id = 'BK' + Math.random().toString(36).slice(2, 8).toUpperCase();
    setBookings((prev) => [
      {
        ...data,
        id,
        createdAt: Date.now(),
        status: data.mode === 'instant' ? 'searching' : 'assigned',
        expertId: data.mode === 'instant' ? null : 'e1',
        otp: data.mode === 'instant' ? null : String(Math.floor(1000 + Math.random() * 9000)),
        startedAt: null,
        endsAt: null,
        extendedMinutes: 0,
        rating: null,
        feedbackTags: [],
        issueType: 'none',
      },
      ...prev,
    ]);
    return id;
  };

  const cancelBooking = (id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)));
    showToast('Booking cancelled — any prepaid amount will be refunded in 3-5 days');
  };

  const rescheduleBooking = (id: string, slot: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, scheduledFor: slot, status: 'assigned' } : b))
    );
    showToast('Booking rescheduled to ' + slot);
  };

  const startService = (bookingId: string, otp: string) => {
    const b = bookings.find((x) => x.id === bookingId);
    if (!b || !b.otp) return false;
    if (b.otp !== otp) return false;
    const nowTs = Date.now();
    setBookings((prev) =>
      prev.map((x) =>
        x.id === bookingId
          ? { ...x, status: 'in_progress', startedAt: nowTs, endsAt: nowTs + (x.hours * 60 + x.extendedMinutes) * 60000 }
          : x
      )
    );
    showToast('Service started — session timer running');
    return true;
  };

  const extendSession = (bookingId: string, extraMinutes: number, price: number) => {
    setBookings((prev) =>
      prev.map((x) =>
        x.id === bookingId
          ? {
              ...x,
              extendedMinutes: x.extendedMinutes + extraMinutes,
              endsAt: x.endsAt ? x.endsAt + extraMinutes * 60000 : x.endsAt,
              total: x.total + price,
              priceSubtotal: x.priceSubtotal + price,
            }
          : x
      )
    );
    showToast(`Session extended — ₹${price} added to your bill`);
  };

  const completeBooking = (bookingId: string) => {
    const b = bookings.find((x) => x.id === bookingId);
    setBookings((prev) =>
      prev.map((x) => (x.id === bookingId ? { ...x, status: 'completed' } : x))
    );
    if (b && b.expertId) {
      addEarnings(b.expertId, Math.round(b.total * 0.8), Math.round((Date.now() - (b.startedAt ?? Date.now())) / 60000));
    }
    showToast('Service completed — rate your expert');
  };

  const rateBooking = (bookingId: string, rating: number, tags: string[]) => {
    setBookings((prev) =>
      prev.map((x) => (x.id === bookingId ? { ...x, rating, feedbackTags: tags } : x))
    );
    showToast('Thanks for rating your expert!');
  };

  const raiseIssue = (bookingId: string, type: 'reservice' | 'refund') => {
    setBookings((prev) =>
      prev.map((x) => (x.id === bookingId ? { ...x, issueType: type } : x))
    );
    showToast(
      type === 'reservice'
        ? 'Re-service requested — we will send an expert free of charge'
        : 'Refund requested — our team will call you within 2 hours'
    );
  };

  const addEarnings = (expertId: string, amount: number, minutes: number) => {
    setEarnings((prev) => ({
      ...prev,
      [expertId]: {
        today: (prev[expertId]?.today ?? 0) + amount,
        shiftMinutes: (prev[expertId]?.shiftMinutes ?? 0) + minutes,
      },
    }));
  };

  const toggleExpertOnline = (id: string) => {
    setExperts((prev) => prev.map((e) => (e.id === id ? { ...e, online: !e.online } : e)));
  };

  const toggleZone = (id: string) => {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, active: !z.active } : z)));
  };

  const setZoneEta = (id: string, eta: number) => {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, avgEtaMins: eta } : z)));
  };

  const addAddress = (a: Omit<SavedAddress, 'id'>) => {
    const id = 'a' + Math.random().toString(36).slice(2, 8);
    setAddresses((prev) => [...prev, { ...a, id }]);
    setSelectedAddressId(id);
  };

  const value: StoreState = {
    role, setRole,
    addresses, addAddress, selectedAddressId, setSelectedAddressId,
    experts, zones, toggleExpertOnline, toggleZone, setZoneEta,
    expertEarnings: earnings, addEarnings,
    bookings, createBooking, cancelBooking, rescheduleBooking,
    assignExpert, rejectBooking: () => {},
    markArriving, startService, extendSession, completeBooking, rateBooking, raiseIssue,
    now, toast, showToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useUnlockedOtp() {
  return useMemo(() => String(Math.floor(1000 + Math.random() * 9000)), []);
}
