# Project memory

## Product intent & audience

- **Product:** "Sahaj" — hyperlocal, on-demand 10-minute home help & house cleaning app for urban Indian households.
- **Three user roles, all demoable in one app via a floating "Switch view" button:**
  1. **Customer:** location setup, service & duration selection, instant/scheduled booking, live tracking with OTP + timer, payments, ratings, history.
  2. **Expert (partner):** online toggle, accept/reject jobs (30s countdown), start-OTP verification, session end, shift timer, earnings (80% share).
  3. **Admin:** live bookings feed, zone management with avg ETA, per-service hourly rate editor, expert verification (ID/police/training badges).
- All booking lifecycle and real-time data is **mocked/simulated in-app**; code organized so a real backend (Supabase, payments, websockets) can replace the store later.

## Brand personality & voice

- Trustworthy, fast, clean — "10-minute help" reliability for Indian urban homes.
- Clear transparency in pricing and inclusions; safety-forward.

## Visual design & UX direction

- Mobile-first; clear hierarchy; thumb-friendly CTAs; minimal-step checkout.
- Theme uses shared UI primitives (Button, Card, Sheet, Badge, Header, Toast) under a defined color palette.
- Service catalog: 6 categories — House Cleaning, Bathroom, Kitchen, Dishwashing, Laundry/Ironing, Cooking Prep.
- Booking lifecycle statuses: `searching → assigned → arriving (otp) → in-progress → completed`.
- Promo code `FIRST50` = 50% off. Pricing shows platform fee + GST breakdown.
- Lucide-react icons used throughout; `@/` path alias for imports.

## Decisions, constraints & rationale

- Vite + React + Tailwind + lucide-react; no extra UI/icon packages.
- Booking OTP generated when expert arrives (enters `otp` status), not at creation.
- Scheduled bookings start in "assigned" and do not flow through arrival (acceptable for scheduled demo).
- Expert earnings share: 80%.
- Expert job accept countdown: 30 seconds.
- App name chosen as **Sahaj**.

## Open questions & assumptions

- Backend not yet wired — auth, geolocation, payments, real-time DB/websockets remain mock placeholders.
- Reschedule flow only supports scheduled bookings before start time; instant bookings bypass arrival ETA display.
- No real payment integration yet (UPI/cards/wallets are UI-only).
- Actual expert matching and radius computation are simulated, not geospatial.