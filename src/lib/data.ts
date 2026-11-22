import type { Expert, Promo, ServiceCategory, SavedAddress, Zone } from './types';

export const SERVICES: ServiceCategory[] = [
  {
    id: 'home',
    name: 'Full Home Cleaning',
    tagline: 'Sweeping, mopping, dusting & tidying',
    icon: 'Home',
    ratePerHour: 249,
    included: [
      'Sweeping & mopping all floors',
      'Dusting furniture & surfaces',
      'Trash disposal',
      'Tidying beds & cushions',
      'Balcony sweeping',
    ],
    notIncluded: ['Deep sofa shampooing', 'Pest control', 'Wall / ceiling cleaning', 'Outdoor areas beyond balcony'],
  },
  {
    id: 'bathroom',
    name: 'Bathroom Cleaning',
    tagline: 'Deep scrub of tiles, fittings & commode',
    icon: 'ShowerHead',
    ratePerHour: 279,
    included: [
      'Tile & grout scrubbing',
      'Commode & sink descaling',
      'Mirror & glass cleaning',
      'Fitting polish (taps, shower)',
      'Floor drain cleaning',
    ],
    notIncluded: ['Grout re-tiling', 'Hard chemical descaling of heavy deposits', 'Geyser interior cleaning'],
  },
  {
    id: 'kitchen',
    name: 'Kitchen Cleaning',
    tagline: 'Counters, stove, sink & cabinet exteriors',
    icon: 'CookingPot',
    ratePerHour: 299,
    included: [
      'Counter & backsplash wiping',
      'Stove & hob degreasing',
      'Sink & tap scrubbing',
      'Cabinet exterior wipe-down',
      'Chimney exterior cleaning',
    ],
    notIncluded: ['Inside-chimney deep clean', 'Inside cabinet emptying & cleaning', 'Fridge deep clean (add-on soon)'],
  },
  {
    id: 'dishes',
    name: 'Dishwashing',
    tagline: 'Utensils washed, dried & arranged',
    icon: 'UtensilsCrossed',
    ratePerHour: 199,
    included: [
      'Washing all utensils',
      'Drying & arranging shelves',
      'Cleaning the sink area',
      'Wiping stove after use',
    ],
    notIncluded: ['Copper / silver polishing', 'Very large party loads (book 2+ hrs)'],
  },
  {
    id: 'laundry',
    name: 'Laundry & Ironing',
    tagline: 'Wash, dry, fold & press clothes',
    icon: 'Shirt',
    ratePerHour: 219,
    included: [
      'Machine wash & hand wash',
      'Drying on rack / line',
      'Folding & stacking',
      'Ironing & hanging',
    ],
    notIncluded: ['Dry cleaning', 'Stain removal on silk / delicate fabrics', 'Ironing on customer-provided machine not available'],
  },
  {
    id: 'cook',
    name: 'Kitchen Prep / Cooking Help',
    tagline: 'Chopping, prep & assisting home cooking',
    icon: 'ChefHat',
    ratePerHour: 329,
    included: [
      'Vegetable chopping & marination',
      'Dough & batter prep',
      'Assisting while you cook',
      'Kitchen cleanup after',
    ],
    notIncluded: ['Solo full-meal cooking (coming soon)', 'Non-veg butchery', 'Providing groceries or ingredients'],
  },
];

export const serviceById = (id: string): ServiceCategory =>
  SERVICES.find((s) => s.id === id) ?? SERVICES[0];

export const ZONES: Zone[] = [
  { id: 'z1', name: 'Indiranagar', pincode: '560038', pincodes: '560038, 560071', active: true, avgEtaMins: 9 },
  { id: 'z2', name: 'Koramangala', pincode: '560034', pincodes: '560034, 560095', active: true, avgEtaMins: 11 },
  { id: 'z3', name: 'HSR Layout', pincode: '560102', pincodes: '560102, 560068', active: true, avgEtaMins: 12 },
  { id: 'z4', name: 'Whitefield', pincode: '560066', pincodes: '560066, 560048', active: false, avgEtaMins: 24 },
  { id: 'z5', name: 'Jayanagar', pincode: '560041', pincodes: '560041, 560082', active: true, avgEtaMins: 10 },
  { id: 'z6', name: 'Andheri West', pincode: '400058', pincodes: '400058, 400053', active: false, avgEtaMins: 26 },
];

export const EXPERTS: Expert[] = [
  {
    id: 'e1',
    name: 'Lakshmi Devi',
    photoUrl: 'https://images.pexels.com/photos/3768114/pexels-photo-3768114.jpeg?auto=compress&cs=tinysrgb&w=240',
    rating: 4.9,
    jobsDone: 1284,
    yearsExp: 6,
    languages: ['Kannada', 'Tamil', 'Hindi'],
    idVerified: true,
    backgroundChecked: true,
    trainedOn: ['home', 'bathroom', 'kitchen', 'laundry'],
    online: true,
    zoneId: 'z1',
    todayEarnings: 1480,
    shiftMinutes: 264,
  },
  {
    id: 'e2',
    name: 'Ravi Kumar',
    photoUrl: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=240',
    rating: 4.8,
    jobsDone: 942,
    yearsExp: 4,
    languages: ['Kannada', 'Hindi', 'English'],
    idVerified: true,
    backgroundChecked: true,
    trainedOn: ['home', 'dishes', 'cook', 'kitchen'],
    online: true,
    zoneId: 'z1',
    todayEarnings: 960,
    shiftMinutes: 180,
  },
  {
    id: 'e3',
    name: 'Sunita Sharma',
    photoUrl: 'https://images.pexels.com/photos/3763158/pexels-photo-3763158.jpeg?auto=compress&cs=tinysrgb&w=240',
    rating: 4.7,
    jobsDone: 611,
    yearsExp: 3,
    languages: ['Hindi', 'English'],
    idVerified: true,
    backgroundChecked: false,
    trainedOn: ['laundry', 'dishes', 'home'],
    online: false,
    zoneId: 'z2',
    todayEarnings: 0,
    shiftMinutes: 0,
  },
  {
    id: 'e4',
    name: 'Meena Iyer',
    photoUrl: 'https://images.pexels.com/photos/3775534/pexels-photo-3775534.jpeg?auto=compress&cs=tinysrgb&w=240',
    rating: 4.9,
    jobsDone: 1502,
    yearsExp: 8,
    languages: ['Tamil', 'Kannada', 'English'],
    idVerified: true,
    backgroundChecked: true,
    trainedOn: ['kitchen', 'bathroom', 'cook'],
    online: true,
    zoneId: 'z2',
    todayEarnings: 2120,
    shiftMinutes: 342,
  },
];

export const ADDRESSES: SavedAddress[] = [
  {
    id: 'a1',
    label: 'Home',
    line1: 'A-1204, Prestige Shantiniketan',
    society: 'Prestige Shantiniketan, Whitefield Road',
    pincode: '560066',
    isDefault: true,
  },
  {
    id: 'a2',
    label: 'Parents',
    line1: 'Flat 3B, Sunrise Apartments',
    society: 'Sunrise Apartments, 12th Main, Indiranagar',
    pincode: '560038',
    isDefault: false,
  },
];

export const PROMOS: Promo[] = [
  { code: 'FIRST50', description: '50% off your first booking', percentOff: 50, maxOff: 150, minOrder: 249 },
  { code: 'CLEAN100', description: 'Flat ₹100 off above ₹499', percentOff: 0, maxOff: 100, minOrder: 499 },
  { code: 'WEEKEND20', description: '20% off weekend slots', percentOff: 20, maxOff: 120, minOrder: 299 },
];

export const FEEDBACK_TAGS = [
  'On time',
  'Great work',
  'Very polite',
  'Went the extra mile',
  'Missed some spots',
  'Late arrival',
];

export const SLOT_TIMES = [
  'Today · 3:00 PM',
  'Today · 5:30 PM',
  'Today · 7:00 PM',
  'Tomorrow · 8:00 AM',
  'Tomorrow · 11:00 AM',
  'Tomorrow · 2:00 PM',
  'Tomorrow · 4:30 PM',
  'Sat · 10:00 AM',
  'Sat · 1:00 PM',
  'Sun · 9:00 AM',
];

export const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', sub: 'GPay · PhonePe · Paytm', icon: 'Smartphone' },
  { id: 'wallet', label: 'Wallets', sub: 'Paytm, Amazon Pay balance', icon: 'Wallet' },
  { id: 'card', label: 'Card', sub: '•••• 4821 Visa', icon: 'CreditCard' },
  { id: 'cash', label: 'Cash', sub: 'Pay the expert after service', icon: 'Banknote' },
];

export const EXPERT_AVATARS = [
  'https://images.pexels.com/photos/3768114/pexels-photo-3768114.jpeg?auto=compress&cs=tinysrgb&w=240',
  'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=240',
  'https://images.pexels.com/photos/3763158/pexels-photo-3763158.jpeg?auto=compress&cs=tinysrgb&w=240',
  'https://images.pexels.com/photos/3775534/pexels-photo-3775534.jpeg?auto=compress&cs=tinysrgb&w=240',
];
