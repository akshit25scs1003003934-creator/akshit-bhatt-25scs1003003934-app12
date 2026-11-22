export type BookingStatus =
  | 'searching'
  | 'assigned'
  | 'arriving'
  | 'otp'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type ServiceId =
  | 'home'
  | 'bathroom'
  | 'kitchen'
  | 'dishes'
  | 'laundry'
  | 'cook';

export interface ServiceCategory {
  id: ServiceId;
  name: string;
  tagline: string;
  icon: string;
  ratePerHour: number;
  included: string[];
  notIncluded: string[];
}

export interface SavedAddress {
  id: string;
  label: string;
  line1: string;
  society: string;
  pincode: string;
  isDefault: boolean;
}

export interface Expert {
  id: string;
  name: string;
  photoUrl: string;
  rating: number;
  jobsDone: number;
  yearsExp: number;
  languages: string[];
  idVerified: boolean;
  backgroundChecked: boolean;
  trainedOn: ServiceId[];
  online: boolean;
  zoneId: string;
  todayEarnings: number;
  shiftMinutes: number;
}

export interface PaymentLine {
  label: string;
  amount: number;
}

export interface Booking {
  id: string;
  serviceId: ServiceId;
  hours: number;
  mode: 'instant' | 'scheduled';
  scheduledFor: string | null;
  addressId: string;
  addressSnapshot: SavedAddress;
  status: BookingStatus;
  expertId: string | null;
  createdAt: number;
  otp: string | null;
  startedAt: number | null;
  endsAt: number | null;
  extendedMinutes: number;
  priceSubtotal: number;
  fees: number;
  tax: number;
  total: number;
  paymentMethod: string;
  promoCode: string | null;
  promoDiscount: number;
  rating: number | null;
  feedbackTags: string[];
  issueType: 'none' | 'reservice' | 'refund';
}

export interface Zone {
  id: string;
  name: string;
  pincode: string;
  pincodes: string;
  active: boolean;
  avgEtaMins: number;
}

export interface Promo {
  code: string;
  description: string;
  percentOff: number;
  maxOff: number;
  minOrder: number;
}

export type Role = 'customer' | 'expert' | 'admin';
