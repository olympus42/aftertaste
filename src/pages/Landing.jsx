import { Link } from "react-router-dom";
import {
  UtensilsCrossed, QrCode, Star, ShieldCheck, Award, BookOpen,
  ArrowRight, MessageSquareText, Sparkles, Lock,
} from "lucide-react";
import FloatingFood from "../FloatingFood.jsx";

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-neutral-950 font-sans text-neutral-100 antialiased">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-neutral-950/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow shadow-amber-900/30">
              <UtensilsCrossed className="h-4 w-4 text-neutral-900" strokeWidth={2.4} />
            </div>
            <span className="font-serif text-lg tracking-wide text-neutral-50">Aftertaste</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-xs font-medium text-neutral-300 transition hover:text-amber-300"
            >
              Owner login
            </Link>
            <Link
              to="/login"
              className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-xs font-semibold text-neutral-900 shadow shadow-amber-900/30 transition hover:brightness-105"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black px-6 text-center">
        <FloatingFood count={26} />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-orange-600/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-amber-300">
            <Sparkles className="h-3 w-3" /> Tableside guest feedback
          </span>
          <h1 className="mt-6 font-serif text-6xl leading-none text-neutral-50 sm:text-7xl">Aftertaste</h1>
          <p className="mt-4 font-serif text-xl italic text-neutral-300">
            The impression a great meal leaves behind.
          </p>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-400">
            Turn happy guests into glowing reviews, and unhappy ones into problems you actually
            get to fix — all from a single QR code on the table.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-7 py-4 text-sm font-semibold text-neutral-900 shadow-lg shadow-amber-900/30 transition hover:brightness-105 active:scale-[0.98]"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-7 py-4 text-sm font-medium text-neutral-200 transition hover:border-amber-400/40 hover:text-amber-200"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Big statement */}
      <section className="border-y border-white/5 bg-neutral-950 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-serif text-3xl leading-snug text-neutral-100 sm:text-4xl">
            Most unhappy guests never say a word. They just don't come back — and leave a
            one-star review weeks later.
          </p>
          <p className="mt-6 font-serif text-2xl leading-snug text-amber-300 sm:text-3xl">
            Aftertaste catches them at the table, while you can still make it right.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-gradient-to-b from-neutral-950 to-black px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-serif text-3xl text-neutral-50">How it works</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <Step n="1" icon={<QrCode className="h-5 w-5" />} title="Scan">
              Guests scan the QR code on your table — no app to download, no friction.
            </Step>
            <Step n="2" icon={<Star className="h-5 w-5" />} title="Rate">
              A beautiful 30-second, tap-to-rate flow they'll actually finish.
            </Step>
            <Step n="3" icon={<MessageSquareText className="h-5 w-5" />} title="Route">
              Happy guests are invited to review publicly; unhappy ones reach you privately.
            </Step>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-black px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-serif text-3xl text-neutral-50">Everything a venue needs</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature icon={<QrCode className="h-5 w-5" />} title="QR feedback">
              One code per table. Set up your tables, bar seats, and staff in minutes.
            </Feature>
            <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Fair review routing">
              Everyone can review publicly — you just get to hear the problems first.
            </Feature>
            <Feature icon={<Award className="h-5 w-5" />} title="Staff insights">
              Patterns from guest feedback as a coaching aid — never an automated verdict.
            </Feature>
            <Feature icon={<BookOpen className="h-5 w-5" />} title="Digital menu">
              Let guests browse your dishes right from the feedback page.
            </Feature>
            <Feature icon={<Sparkles className="h-5 w-5" />} title="Your brand">
              Cuisine-matched design that looks stunning on every phone.
            </Feature>
            <Feature icon={<Lock className="h-5 w-5" />} title="Private & secure">
              Confirmed accounts, and every owner sees only their own data.
            </Feature>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-b from-black to-neutral-900 px-6 py-28 text-center">
        <FloatingFood count={16} />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="font-serif text-4xl leading-tight text-neutral-50">
            Ready to hear what your guests really think?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-neutral-400">
            Set up your venue in a few minutes. It's free to start.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-4 text-sm font-semibold text-neutral-900 shadow-lg shadow-amber-900/30 transition hover:brightness-105 active:scale-[0.98]"
          >
            Get started free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-neutral-950 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
              <UtensilsCrossed className="h-3.5 w-3.5 text-neutral-900" strokeWidth={2.4} />
            </div>
            <span className="font-serif text-neutral-200">Aftertaste</span>
          </div>
          <p className="text-xs text-neutral-600">The impression a great meal leaves behind.</p>
          <Link to="/login" className="text-xs text-neutral-400 transition hover:text-amber-300">
            Owner login
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Step({ n, icon, title, children }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.1] to-white/[0.03] p-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
          {icon}
        </div>
        <span className="font-serif text-2xl text-neutral-700">{n}</span>
      </div>
      <h3 className="mt-4 font-serif text-xl text-neutral-50">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-400">{children}</p>
    </div>
  );
}

function Feature({ icon, title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-medium text-neutral-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-400">{children}</p>
    </div>
  );
}
