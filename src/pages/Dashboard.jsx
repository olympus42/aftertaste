import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useSession } from "../useSession";
import { QRCodeCanvas } from "qrcode.react";
import FloatingFood from "../FloatingFood.jsx";
import {
  UtensilsCrossed, Plus, Trash2, Copy, Check, LogOut, Store, Users, QrCode,
  Inbox, RefreshCw, Star, ThumbsUp, ThumbsDown, Award, BookOpen,
} from "lucide-react";

export default function Dashboard() {
  const session = useSession();
  const [venue, setVenue] = useState(null);
  const [staff, setStaff] = useState([]);
  const [newStaff, setNewStaff] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [newDish, setNewDish] = useState({ name: "", price: "", description: "" });

  useEffect(() => {
    if (!session) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data: venues } = await supabase
        .from("venues")
        .select("*")
        .eq("owner_id", session.user.id)
        .limit(1);
      let v = venues && venues[0];
      if (!v) {
        const { data: created } = await supabase
          .from("venues")
          .insert({ owner_id: session.user.id })
          .select()
          .single();
        v = created;
      }
      if (!active) return;
      setVenue(v);
      if (v) {
        const { data: st } = await supabase
          .from("staff")
          .select("*")
          .eq("venue_id", v.id)
          .order("created_at");
        if (active) setStaff(st || []);
        const { data: fb } = await supabase
          .from("feedback")
          .select("*")
          .eq("venue_id", v.id)
          .order("created_at", { ascending: false })
          .limit(100);
        if (active) setFeedback(fb || []);
        const { data: mi } = await supabase
          .from("menu_items")
          .select("*")
          .eq("venue_id", v.id)
          .order("created_at");
        if (active) setMenuItems(mi || []);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [session]);

  function setField(key, value) {
    setVenue((v) => ({ ...v, [key]: value }));
  }

  async function saveVenue() {
    setSaving(true);
    setSaved(false);
    const { error } = await supabase
      .from("venues")
      .update({
        name: venue.name,
        tagline: venue.tagline,
        table_count: Number(venue.table_count) || 0,
        bar_count: Number(venue.bar_count) || 0,
        google_review_url: venue.google_review_url,
        reward: venue.reward,
        cuisine: venue.cuisine || "mixed",
      })
      .eq("id", venue.id);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function addStaff() {
    const name = newStaff.trim();
    if (!name || !venue) return;
    const { data } = await supabase
      .from("staff")
      .insert({ venue_id: venue.id, name })
      .select()
      .single();
    if (data) {
      setStaff((s) => [...s, data]);
      setNewStaff("");
    }
  }

  async function removeStaff(id) {
    await supabase.from("staff").delete().eq("id", id);
    setStaff((s) => s.filter((x) => x.id !== id));
  }

  async function addDish() {
    const name = newDish.name.trim();
    if (!name || !venue) return;
    const { data } = await supabase
      .from("menu_items")
      .insert({
        venue_id: venue.id,
        name,
        price: newDish.price.trim() || null,
        description: newDish.description.trim() || null,
      })
      .select()
      .single();
    if (data) {
      setMenuItems((m) => [...m, data]);
      setNewDish({ name: "", price: "", description: "" });
    }
  }

  async function removeDish(id) {
    await supabase.from("menu_items").delete().eq("id", id);
    setMenuItems((m) => m.filter((x) => x.id !== id));
  }

  async function refreshFeedback() {
    if (!venue) return;
    const { data: fb } = await supabase
      .from("feedback")
      .select("*")
      .eq("venue_id", venue.id)
      .order("created_at", { ascending: false })
      .limit(100);
    setFeedback(fb || []);
  }

  async function deleteAccount() {
    setDeleting(true);
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      setDeleting(false);
      alert("Sorry, we couldn't delete your account. Please try again.");
      return;
    }
    await supabase.auth.signOut();
  }

  const avg = feedback.length
    ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : "—";

  // Staff insights — a coaching aid, never an automated verdict.
  const MIN_SAMPLE = 5;
  const staffInsights = staff.map((s) => {
    const rows = feedback.filter((f) => f.server === s.name);
    const n = rows.length;
    const ups = rows.filter((r) => r.server_vote === "up").length;
    const downs = rows.filter((r) => r.server_vote === "down").length;
    const rated = rows.filter((r) => typeof r.rating === "number");
    const avgRating = rated.length ? rated.reduce((a, r) => a + r.rating, 0) / rated.length : null;
    const votes = ups + downs;
    const positivity = votes ? ups / votes : null;
    const recent = [...rows]
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-8)
      .map((r) => r.rating);

    let status = "gathering";
    if (n >= MIN_SAMPLE) {
      if ((avgRating ?? 5) >= 4.2 && (positivity === null || positivity >= 0.7)) status = "recognize";
      else if ((avgRating ?? 5) <= 3.2 || (positivity !== null && positivity <= 0.4)) status = "checkin";
      else status = "steady";
    }
    return { id: s.id, name: s.name, n, ups, downs, avgRating, recent, status };
  });

  const link = venue ? `${window.location.origin}/v/${venue.id}` : "";

  function copyLink() {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading || !venue) {
    return (
      <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center font-sans text-neutral-400">
        <p className="text-sm animate-pulse">Loading your venue…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex justify-center font-sans text-neutral-100">
      <div className="relative w-full max-w-[560px] lg:max-w-4xl min-h-screen overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black px-6 py-8">
        <FloatingFood count={16} cuisine={venue.cuisine || "mixed"} key={venue.cuisine || "mixed"} />
        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-900/30">
              <UtensilsCrossed className="h-5 w-5 text-neutral-900" strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-amber-400/90">Owner setup</p>
              <h1 className="font-serif text-xl text-neutral-50">Aftertaste</h1>
            </div>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-300 transition hover:text-amber-300"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </header>

        <div className="relative z-10 mt-6 space-y-4 lg:columns-2 lg:gap-4 lg:space-y-0 [&>section]:mb-4 [&>section]:break-inside-avoid">
          {/* Feedback inbox */}
          <Card icon={<Inbox className="h-4 w-4" />} title="Guest feedback">
            <div className="-mt-1 flex items-center justify-between">
              <p className="text-xs text-neutral-500">
                {feedback.length === 0
                  ? "No feedback yet — share your QR code to start collecting."
                  : `${feedback.length} recent · average ${avg} ★`}
              </p>
              <button
                onClick={refreshFeedback}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 transition hover:text-amber-300"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>

            <div className="mt-2 max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {feedback.map((f) => (
                <div key={f.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={n <= f.rating ? "h-3.5 w-3.5 text-amber-400" : "h-3.5 w-3.5 text-neutral-700"}
                          fill={n <= f.rating ? "currentColor" : "none"}
                          strokeWidth={1.6}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-neutral-500">{timeAgo(f.created_at)}</span>
                  </div>

                  {f.comment && <p className="mt-2 text-sm text-neutral-200">“{f.comment}”</p>}

                  {f.issues && f.issues.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {f.issues.map((i) => (
                        <span key={i} className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-300">
                          {ISSUE_LABELS[i] || i}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500">
                    <span>{f.table_label}</span>
                    {f.server && (
                      <span className="inline-flex items-center gap-1">
                        {f.server_vote === "up" && <ThumbsUp className="h-3 w-3 text-emerald-400" />}
                        {f.server_vote === "down" && <ThumbsDown className="h-3 w-3 text-rose-400" />}
                        {f.server}
                      </span>
                    )}
                    <span className={f.outcome === "google" ? "text-amber-300" : "text-neutral-400"}>
                      {f.outcome === "google" ? "→ Google" : "Private"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Staff insights */}
          <Card icon={<Award className="h-4 w-4" />} title="Staff insights">
            <p className="-mt-1 text-xs text-neutral-500">
              A coaching aid, not a verdict — patterns from guest feedback. You always make the call.
            </p>
            <div className="mt-2 space-y-2">
              {staff.length === 0 && (
                <p className="text-xs text-neutral-600">Add staff above to see their insights here.</p>
              )}
              {staffInsights.map((s) => (
                <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-neutral-100">{s.name}</span>
                    <StatusPill status={s.status} />
                  </div>

                  {s.n < 5 ? (
                    <div className="mt-2">
                      <p className="text-[11px] text-neutral-500">
                        Building a fair picture — {s.n} of 5 ratings so far.
                      </p>
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-amber-400/70"
                          style={{ width: `${Math.min(100, (s.n / 5) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-400" fill="currentColor" strokeWidth={1.6} />
                          {s.avgRating ? s.avgRating.toFixed(1) : "—"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3 text-emerald-400" /> {s.ups}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ThumbsDown className="h-3 w-3 text-rose-400" /> {s.downs}
                        </span>
                        <span className="text-neutral-600">· {s.n} ratings</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <span className="mr-1 text-[10px] text-neutral-600">recent</span>
                        {s.recent.map((r, i) => (
                          <span
                            key={i}
                            title={`${r}★`}
                            className={[
                              "h-2 w-2 rounded-full",
                              r >= 4 ? "bg-emerald-400" : r === 3 ? "bg-amber-400" : "bg-rose-400",
                            ].join(" ")}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Venue details */}
          <Card icon={<Store className="h-4 w-4" />} title="Your venue">
            <Field label="Venue name">
              <input
                value={venue.name || ""}
                onChange={(e) => setField("name", e.target.value)}
                className={inputCls}
                placeholder="e.g. The Copper Fork"
              />
            </Field>
            <Field label="Small tagline (shown above the name)">
              <input
                value={venue.tagline || ""}
                onChange={(e) => setField("tagline", e.target.value)}
                className={inputCls}
                placeholder="e.g. Est. 2021"
              />
            </Field>
            <Field label="Cuisine (sets your floating food)">
              <select
                value={venue.cuisine || "mixed"}
                onChange={(e) => setField("cuisine", e.target.value)}
                className={inputCls}
              >
                <option value="mixed" className="bg-neutral-900">Mixed / Other</option>
                <option value="burgers" className="bg-neutral-900">Burgers</option>
                <option value="pizza" className="bg-neutral-900">Pizza</option>
                <option value="diner" className="bg-neutral-900">American Diner</option>
                <option value="italian" className="bg-neutral-900">Italian</option>
                <option value="mexican" className="bg-neutral-900">Mexican</option>
                <option value="thai" className="bg-neutral-900">Thai</option>
                <option value="chinese" className="bg-neutral-900">Chinese</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Number of tables">
                <input
                  type="number"
                  min={0}
                  value={venue.table_count ?? 0}
                  onChange={(e) => setField("table_count", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Bar seats / stools">
                <input
                  type="number"
                  min={0}
                  value={venue.bar_count ?? 0}
                  onChange={(e) => setField("bar_count", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Google review link">
              <input
                value={venue.google_review_url || ""}
                onChange={(e) => setField("google_review_url", e.target.value)}
                className={inputCls}
                placeholder="https://g.page/r/…"
              />
            </Field>
            <Field label="Reward for leaving a review">
              <input
                value={venue.reward || ""}
                onChange={(e) => setField("reward", e.target.value)}
                className={inputCls}
                placeholder="e.g. a free coffee or dessert"
              />
            </Field>

            <button
              onClick={saveVenue}
              disabled={saving}
              className="mt-1 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3.5 text-sm font-semibold text-neutral-900 shadow-lg shadow-amber-900/30 transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
            </button>
          </Card>

          {/* Staff */}
          <Card icon={<Users className="h-4 w-4" />} title="Your staff">
            <p className="-mt-1 mb-1 text-xs text-neutral-500">
              These names appear in the "rate your server" list for guests.
            </p>
            <div className="flex gap-2">
              <input
                value={newStaff}
                onChange={(e) => setNewStaff(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addStaff()}
                placeholder="Add a staff member…"
                className={inputCls}
              />
              <button
                onClick={addStaff}
                className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl bg-amber-400 text-neutral-900 transition hover:brightness-105 active:scale-95"
                aria-label="Add staff"
              >
                <Plus className="h-5 w-5" strokeWidth={2.6} />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {staff.length === 0 && (
                <p className="text-xs text-neutral-600">No staff added yet.</p>
              )}
              {staff.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5"
                >
                  <span className="text-sm text-neutral-200">{s.name}</span>
                  <button
                    onClick={() => removeStaff(s.id)}
                    className="text-neutral-500 transition hover:text-rose-300"
                    aria-label={`Remove ${s.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Menu */}
          <Card icon={<BookOpen className="h-4 w-4" />} title="Your menu">
            <p className="-mt-1 mb-1 text-xs text-neutral-500">
              Dishes guests can browse from the "View our menu" button.
            </p>
            <div className="space-y-2">
              <input
                value={newDish.name}
                onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                placeholder="Dish name"
                className={inputCls}
              />
              <div className="flex gap-2">
                <input
                  value={newDish.price}
                  onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                  placeholder="Price (e.g. $12)"
                  className={inputCls}
                />
                <button
                  onClick={addDish}
                  className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl bg-amber-400 text-neutral-900 transition hover:brightness-105 active:scale-95"
                  aria-label="Add dish"
                >
                  <Plus className="h-5 w-5" strokeWidth={2.6} />
                </button>
              </div>
              <input
                value={newDish.description}
                onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                placeholder="Short description (optional)"
                className={inputCls}
              />
            </div>

            <div className="mt-3 space-y-2">
              {menuItems.length === 0 && (
                <p className="text-xs text-neutral-600">No dishes yet.</p>
              )}
              {menuItems.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5"
                >
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-neutral-100">{m.name}</span>
                      {m.price && <span className="text-xs text-amber-300">{m.price}</span>}
                    </div>
                    {m.description && (
                      <p className="mt-0.5 text-xs text-neutral-500">{m.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeDish(m.id)}
                    className="mt-0.5 text-neutral-500 transition hover:text-rose-300"
                    aria-label={`Remove ${m.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Share / QR */}
          <Card icon={<QrCode className="h-4 w-4" />} title="Your feedback link">
            <p className="-mt-1 text-xs text-neutral-500">
              Put this QR code on your tables, or share the link. Guests who scan it land on
              your feedback page.
            </p>
            <div className="mt-3 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="rounded-xl bg-white p-3">
                <QRCodeCanvas value={link} size={148} includeMargin={false} />
              </div>
              <code className="max-w-full break-all text-center text-[11px] text-neutral-400">
                {link}
              </code>
              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-neutral-200 transition hover:border-amber-400/40 hover:text-amber-200"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-neutral-900 transition hover:brightness-105"
                >
                  Preview
                </a>
              </div>
            </div>
          </Card>

        </div>

        {/* Danger zone */}
        <div className="relative z-10 mx-auto mt-6 max-w-sm text-center">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-neutral-600 underline-offset-2 transition hover:text-rose-300 hover:underline"
            >
              Delete my account
            </button>
          ) : (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.06] p-4">
              <p className="text-xs text-rose-200">
                This permanently deletes your account, venue, staff, and all feedback. This can't be undone.
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-neutral-200 transition hover:border-white/25"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAccount}
                  disabled={deleting}
                  className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Yes, delete everything"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="relative z-10 pb-8 pt-3 text-center text-[11px] text-neutral-600">
          Signed in as {session?.user?.email}
        </p>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-neutral-950/60 px-3.5 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition focus:border-amber-400/50";

function Card({ icon, title, children }) {
  return (
    <section className="rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.1] to-white/[0.03] p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-amber-300">
        {icon}
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-200">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-neutral-400">{label}</span>
      {children}
    </label>
  );
}

const ISSUE_LABELS = {
  food: "Food Quality",
  speed: "Service Speed",
  clean: "Cleanliness",
  staff: "Staff Friendliness",
};

function StatusPill({ status }) {
  const map = {
    recognize: { label: "Doing great", cls: "bg-emerald-400/10 text-emerald-300" },
    steady: { label: "Steady", cls: "bg-white/[0.06] text-neutral-300" },
    checkin: { label: "Worth a check-in", cls: "bg-amber-400/10 text-amber-300" },
    gathering: { label: "Gathering", cls: "bg-white/[0.04] text-neutral-500" },
  };
  const s = map[status] || map.gathering;
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${s.cls}`}>{s.label}</span>;
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
