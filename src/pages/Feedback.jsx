import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  Star, UtensilsCrossed, Coffee, ThumbsUp, ThumbsDown, Check, ChevronDown,
  Sparkles, Heart, MessageSquareText, ChefHat, Timer, SprayCan, Smile,
  ArrowLeft, Gift, PartyPopper,
} from "lucide-react";

const ISSUES = [
  { key: "food", label: "Food Quality", Icon: ChefHat },
  { key: "speed", label: "Service Speed", Icon: Timer },
  { key: "clean", label: "Cleanliness", Icon: SprayCan },
  { key: "staff", label: "Staff Friendliness", Icon: Smile },
];

const RATING_COPY = { 1: "Not good", 2: "Below par", 3: "It was okay", 4: "Really good", 5: "Exceptional" };

/* ---- Data loader: fetch this venue's settings, then render the app ---- */
export default function Feedback() {
  const { venueId } = useParams();
  const [status, setStatus] = useState("loading"); // loading | ready | notfound
  const [config, setConfig] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: venue, error } = await supabase
        .from("venues")
        .select("*")
        .eq("id", venueId)
        .single();
      if (!active) return;
      if (error || !venue) {
        setStatus("notfound");
        return;
      }
      const { data: staff } = await supabase
        .from("staff")
        .select("name")
        .eq("venue_id", venueId)
        .order("created_at");

      const tables = [];
      for (let i = 1; i <= (venue.table_count || 0); i++) tables.push(`Table ${i}`);
      for (let i = 1; i <= (venue.bar_count || 0); i++) tables.push(`Bar ${i}`);
      if (tables.length === 0) tables.push("Table 1");

      if (!active) return;
      setConfig({
        name: venue.name || "Our Venue",
        tagline: venue.tagline || "Guest Feedback",
        tables,
        servers: (staff || []).map((s) => s.name),
        googleReviewUrl: venue.google_review_url || "",
        reward: venue.reward || "a treat",
      });
      setStatus("ready");
    })();
    return () => {
      active = false;
    };
  }, [venueId]);

  if (status === "loading") return <Centered>Loading…</Centered>;
  if (status === "notfound") return <Centered>This feedback page isn’t available.</Centered>;
  return <FeedbackApp config={config} />;
}

function Centered({ children }) {
  return (
    <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-6 text-center font-sans text-neutral-300">
      <p className="text-sm">{children}</p>
    </div>
  );
}

/* ============================ The feedback experience ============================ */
function FeedbackApp({ config }) {
  const [table, setTable] = useState(config.tables[0]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [step, setStep] = useState("rating");
  const [successKind, setSuccessKind] = useState("private");
  const [issues, setIssues] = useState([]);
  const [comment, setComment] = useState("");
  const [server, setServer] = useState("");
  const [serverVote, setServerVote] = useState(null);

  function chooseRating(n) {
    setRating(n);
    window.setTimeout(() => setStep(n >= 4 ? "positive" : "negative"), 520);
  }
  function toggleIssue(key) {
    setIssues((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }
  function resetAll() {
    setRating(0); setHover(0); setIssues([]); setComment(""); setServer(""); setServerVote(null); setStep("rating");
  }
  function submitPrivate() { setSuccessKind("private"); setStep("success"); }
  function goGoogle() {
    setSuccessKind("google");
    setStep("success");
    if (config.googleReviewUrl) window.open(config.googleReviewUrl, "_blank", "noopener,noreferrer");
  }
  function backToRating() { setStep("rating"); setRating(0); setHover(0); }

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex justify-center font-sans text-neutral-100 antialiased selection:bg-amber-400/30">
      <StyleTag />
      <div className="relative w-full max-w-[430px] min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-950 to-black overflow-hidden shadow-2xl">
        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -left-20 h-56 w-56 rounded-full bg-orange-600/10 blur-3xl" />

        <header className="relative z-10 px-6 pt-8 pb-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-900/30 ring-1 ring-amber-300/40">
                <UtensilsCrossed className="h-5 w-5 text-neutral-900" strokeWidth={2.4} />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-[0.28em] text-amber-400/90">{config.tagline}</p>
                <h1 className="font-serif text-xl font-semibold tracking-wide text-neutral-50">{config.name}</h1>
              </div>
            </div>
            <TableSelector table={table} setTable={setTable} tables={config.tables} />
          </div>
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        </header>

        <main className="relative z-10 px-6 pb-16">
          {step === "rating" && (
            <RatingStep rating={rating} hover={hover} setHover={setHover} onChoose={chooseRating} />
          )}
          {step === "positive" && (
            <PositiveStep
              rating={rating} onBack={backToRating} onGoogle={goGoogle} reward={config.reward}
              servers={config.servers} server={server} setServer={setServer}
              serverVote={serverVote} setServerVote={setServerVote}
            />
          )}
          {step === "negative" && (
            <NegativeStep
              rating={rating} issues={issues} toggleIssue={toggleIssue} comment={comment} setComment={setComment}
              onBack={backToRating} onSubmit={submitPrivate}
              servers={config.servers} server={server} setServer={setServer}
              serverVote={serverVote} setServerVote={setServerVote}
            />
          )}
          {step === "success" && (
            <SuccessStep kind={successKind} table={table} reward={config.reward} onDone={resetAll} />
          )}
        </main>

        {step !== "success" && (
          <footer className="relative z-10 px-6 pb-7 text-center">
            <p className="text-[11px] leading-relaxed text-neutral-500">
              Your feedback goes straight to our owners · {table}
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}

/* ============================ Sub-components ============================ */
function TableSelector({ table, setTable, tables }) {
  return (
    <label className="group relative flex items-center">
      <span className="sr-only">Select your table</span>
      <span className="pointer-events-none absolute left-3 text-amber-400">
        <span className="block h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px] shadow-amber-400/70" />
      </span>
      <select
        value={table}
        onChange={(e) => setTable(e.target.value)}
        className="appearance-none rounded-full border border-white/10 bg-white/[0.04] py-2 pl-7 pr-8 text-xs font-medium text-neutral-100 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.07]"
      >
        {tables.map((t) => (
          <option key={t} value={t} className="bg-neutral-900 text-neutral-100">{t}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-neutral-400" />
    </label>
  );
}

function RatingStep({ rating, hover, setHover, onChoose }) {
  const active = hover || rating;
  return (
    <section className="animate-rise pt-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1 text-[11px] font-medium text-amber-300">
          <Sparkles className="h-3 w-3" /> 30-second feedback
        </span>
        <h2 className="mt-5 font-serif text-[26px] leading-tight text-neutral-50">
          How was your<br /> experience tonight?
        </h2>
        <p className="mx-auto mt-3 max-w-[16rem] text-sm text-neutral-400">
          Tap a star below. It helps us serve you better every visit.
        </p>
      </div>

      <div className="mt-9 flex items-center justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const on = n <= active;
          return (
            <button
              key={n} type="button" aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
              onFocus={() => setHover(n)} onBlur={() => setHover(0)} onClick={() => onChoose(n)}
              className="group relative p-1 transition-transform duration-200 active:scale-90 focus:outline-none"
              style={{ transitionDelay: `${n * 10}ms` }}
            >
              <Star
                className={[
                  "h-11 w-11 transition-all duration-300",
                  on ? "scale-110 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.55)]" : "text-neutral-700 group-hover:text-neutral-500",
                ].join(" ")}
                fill={on ? "currentColor" : "none"} strokeWidth={1.6}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-5 h-6 text-center">
        <span key={active} className={["text-sm font-medium transition-all", active ? "animate-rise text-amber-300" : "text-transparent"].join(" ")}>
          {active ? RATING_COPY[active] : "·"}
        </span>
      </div>

      <div className="mt-6 flex justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={["h-1 rounded-full transition-all duration-300", n <= active ? "w-6 bg-amber-400" : "w-1.5 bg-neutral-700"].join(" ")} />
        ))}
      </div>
    </section>
  );
}

function BackButton({ onBack }) {
  return (
    <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition hover:text-amber-300">
      <ArrowLeft className="h-3.5 w-3.5" /> Change rating
    </button>
  );
}

function RatingBadge({ rating }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={n <= rating ? "h-3.5 w-3.5 text-amber-400" : "h-3.5 w-3.5 text-neutral-700"} fill={n <= rating ? "currentColor" : "none"} strokeWidth={1.6} />
      ))}
    </div>
  );
}

function PositiveStep({ rating, onBack, onGoogle, reward, servers, server, setServer, serverVote, setServerVote }) {
  return (
    <section className="animate-rise pt-2">
      <BackButton onBack={onBack} />
      <div className="rounded-3xl border border-amber-400/20 bg-gradient-to-b from-amber-400/[0.08] to-transparent p-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-900/40 animate-pop">
          <PartyPopper className="h-8 w-8 text-neutral-900" strokeWidth={2.2} />
        </div>
        <div className="mt-4 flex justify-center"><RatingBadge rating={rating} /></div>
        <h2 className="mt-4 font-serif text-2xl leading-snug text-neutral-50">We're thrilled you enjoyed your meal!</h2>
        <p className="mx-auto mt-2 max-w-[17rem] text-sm text-neutral-300">
          Would you share the love? A quick Google review means the world to our small team.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3">
          <Gift className="h-5 w-5 text-amber-300" />
          <p className="text-left text-xs text-amber-100">
            Show your review to your server for <span className="font-semibold text-amber-300">{reward}</span>.
          </p>
        </div>
        <button
          type="button" onClick={onGoogle}
          className="group mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-4 text-sm font-semibold text-neutral-900 shadow-lg shadow-amber-900/30 transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
        >
          <Coffee className="h-5 w-5 transition-transform group-hover:-rotate-6" />
          Review Us on Google &amp; Get a Free Treat
        </button>
        <p className="mt-3 text-[11px] text-neutral-500">Opens Google · takes about 20 seconds</p>
      </div>
      <StaffRating servers={servers} server={server} setServer={setServer} serverVote={serverVote} setServerVote={setServerVote} />
    </section>
  );
}

function NegativeStep({ rating, issues, toggleIssue, comment, setComment, onBack, onSubmit, servers, server, setServer, serverVote, setServerVote }) {
  return (
    <section className="animate-rise pt-2">
      <BackButton onBack={onBack} />
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-rose-500/15 ring-1 ring-rose-400/20">
            <Heart className="h-5 w-5 text-rose-300" strokeWidth={2} />
          </div>
          <div>
            <div className="mb-1.5"><RatingBadge rating={rating} /></div>
            <h2 className="font-serif text-xl leading-snug text-neutral-50">We're sorry we missed the mark.</h2>
            <p className="mt-1 text-sm text-neutral-400">Please help us fix it — this stays private with our owners.</p>
          </div>
        </div>

        <p className="mt-6 text-xs font-medium uppercase tracking-wider text-neutral-500">What let you down?</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {ISSUES.map(({ key, label, Icon }) => {
            const on = issues.includes(key);
            return (
              <button
                key={key} type="button" onClick={() => toggleIssue(key)}
                className={[
                  "flex items-center gap-2 rounded-2xl border px-3 py-3 text-left text-xs font-medium transition-all duration-200 active:scale-[0.97]",
                  on ? "border-amber-400/60 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/[0.02] text-neutral-300 hover:border-white/20",
                ].join(" ")}
              >
                <span className={["grid h-6 w-6 shrink-0 place-items-center rounded-lg transition", on ? "bg-amber-400 text-neutral-900" : "bg-white/[0.06] text-neutral-400"].join(" ")}>
                  {on ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-3.5 w-3.5" />}
                </span>
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-500">
            <MessageSquareText className="h-3.5 w-3.5" /> Tell us more
          </label>
          <textarea
            value={comment} onChange={(e) => setComment(e.target.value)} rows={4}
            placeholder="What happened? The more detail, the faster we can make it right…"
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-neutral-950/60 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition focus:border-amber-400/50 focus:bg-neutral-950"
          />
        </div>
      </div>

      <StaffRating servers={servers} server={server} setServer={setServer} serverVote={serverVote} setServerVote={setServerVote} />

      <button
        type="button" onClick={onSubmit}
        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-4 text-sm font-semibold text-neutral-900 shadow-lg shadow-amber-900/30 transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
      >
        Send Private Feedback
      </button>
      <p className="mt-3 text-center text-[11px] text-neutral-500">Only the owners see this — it won't be posted publicly.</p>
    </section>
  );
}

function StaffRating({ servers, server, setServer, serverVote, setServerVote }) {
  if (!servers || servers.length === 0) return null;
  return (
    <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-200">
          Rate your server<span className="ml-2 text-[11px] font-normal text-neutral-500">optional</span>
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2.5">
        <div className="relative flex-1">
          <select
            value={server} onChange={(e) => setServer(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-neutral-950/60 py-3 pl-3.5 pr-9 text-sm text-neutral-100 outline-none transition focus:border-amber-400/50"
          >
            <option value="" className="bg-neutral-900 text-neutral-400">Who served you?</option>
            {servers.map((s) => (
              <option key={s} value={s} className="bg-neutral-900 text-neutral-100">{s}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>
        <button
          type="button" aria-label="Thumbs up" onClick={() => setServerVote(serverVote === "up" ? null : "up")}
          className={["grid h-12 w-12 place-items-center rounded-xl border transition-all duration-200 active:scale-90", serverVote === "up" ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300" : "border-white/10 bg-white/[0.03] text-neutral-400 hover:text-neutral-200"].join(" ")}
        >
          <ThumbsUp className="h-5 w-5" fill={serverVote === "up" ? "currentColor" : "none"} />
        </button>
        <button
          type="button" aria-label="Thumbs down" onClick={() => setServerVote(serverVote === "down" ? null : "down")}
          className={["grid h-12 w-12 place-items-center rounded-xl border transition-all duration-200 active:scale-90", serverVote === "down" ? "border-rose-400/50 bg-rose-400/15 text-rose-300" : "border-white/10 bg-white/[0.03] text-neutral-400 hover:text-neutral-200"].join(" ")}
        >
          <ThumbsDown className="h-5 w-5" fill={serverVote === "down" ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

function SuccessStep({ kind, table, reward, onDone }) {
  const [count, setCount] = useState(6);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (count === 0) onDone();
  }, [count, onDone]);

  const google = kind === "google";
  return (
    <section className="animate-rise flex min-h-[70vh] flex-col items-center justify-center pt-6 text-center">
      <Confetti />
      <div className="relative">
        <div className="absolute inset-0 -z-0 animate-ping rounded-full bg-amber-400/20" style={{ animationDuration: "2s" }} />
        <div className="relative grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl shadow-amber-900/40 animate-pop">
          {google ? <Coffee className="h-11 w-11 text-neutral-900" strokeWidth={2.2} /> : <Check className="h-12 w-12 text-neutral-900" strokeWidth={3} />}
        </div>
      </div>
      <h2 className="mt-7 font-serif text-3xl text-neutral-50">{google ? "Thank you!" : "Feedback received"}</h2>
      <p className="mx-auto mt-3 max-w-[17rem] text-sm text-neutral-300">
        {google
          ? `You're being taken to Google. Don't forget to show your review for ${reward}!`
          : "Our owners will personally review your notes. Thank you for helping us do better."}
      </p>
      <div className="mt-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-neutral-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Logged from {table}
      </div>
      <button
        type="button" onClick={onDone}
        className="mt-8 rounded-full border border-white/15 bg-white/[0.04] px-6 py-2.5 text-sm font-medium text-neutral-200 transition hover:border-amber-400/40 hover:text-amber-200"
      >
        Done
      </button>
      <p className="mt-3 text-[11px] text-neutral-600">Resetting for the next guest in {count}s</p>
    </section>
  );
}

function Confetti() {
  const pieces = useRef(
    Array.from({ length: 16 }).map((_, i) => ({
      left: Math.random() * 100, delay: Math.random() * 0.5, dur: 1.6 + Math.random() * 1.2,
      color: ["#fbbf24", "#f59e0b", "#fb923c", "#fef3c7", "#f43f5e"][i % 5], size: 6 + Math.random() * 6,
    }))
  ).current;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <span key={i} className="absolute top-0 block rounded-sm animate-confetti"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 0.5, backgroundColor: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
      ))}
    </div>
  );
}

function StyleTag() {
  return (
    <style>{`
      @keyframes rise { 0% { opacity: 0; transform: translateY(14px); } 100% { opacity: 1; transform: translateY(0); } }
      .animate-rise { animation: rise .5s cubic-bezier(.22,1,.36,1) both; }
      @keyframes pop { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); } }
      .animate-pop { animation: pop .55s cubic-bezier(.34,1.56,.64,1) both; }
      @keyframes confetti { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(80vh) rotate(540deg); opacity: 0; } }
      .animate-confetti { animation: confetti linear forwards; }
    `}</style>
  );
}
