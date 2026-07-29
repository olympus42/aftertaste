# Aftertaste — Tableside Guest Feedback

*The impression a great meal leaves behind.*

Aftertaste is a real product any restaurant or bar can set up for itself. Owners
sign up, describe their venue (tables, bar seats, staff), and get a QR code for
their tables. Guests scan it, rate their visit, and are smartly routed: happy
guests are invited to leave a Google review (with a reward), while unhappy guests
are guided to a private form so the owners can make it right.

## The two parts

- **Owner portal** (`/`) — sign up / log in, then a Setup screen to configure the
  venue and staff, plus the venue's QR code and shareable feedback link.
- **Guest feedback page** (`/v/<venue-id>`) — the page a diner sees after scanning
  the QR. It loads that venue's settings automatically. Nothing is hardcoded.

Owners change their tables, staff, review link, and reward themselves from the
Setup screen — no code needed.

## Behind the scenes

- **React + Vite + Tailwind CSS** for the app, **lucide-react** for icons,
  **qrcode.react** for the table QR codes.
- **Supabase** provides the owner accounts and the database. Each owner can only
  see and edit their own venue (enforced by Row Level Security).
- The Supabase URL and publishable key live in `src/supabaseClient.js`. These are
  safe to be public — the database is protected by security rules, not by the key.

## Running it locally (optional)

You need Node.js (LTS) from https://nodejs.org. Then, in this folder:

```
npm install
npm run dev
```

Open the link it prints (like `http://localhost:5173`).

## Deploying

This repo is connected to Vercel, so pushing to the `main` branch on GitHub
deploys automatically within a minute.

## What's in `src/`

- `pages/Login.jsx` — owner sign-up / sign-in
- `pages/Dashboard.jsx` — the owner Setup screen (venue, staff, QR, link)
- `pages/Feedback.jsx` — the public guest feedback page
- `supabaseClient.js` — connection to Supabase
- `useSession.js` — tracks whether an owner is signed in
- `App.jsx` — the page routes; `main.jsx` — startup
