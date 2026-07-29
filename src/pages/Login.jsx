import { useState } from "react";
import { supabase } from "../supabaseClient";
import { UtensilsCrossed } from "lucide-react";
import FloatingFood from "../FloatingFood.jsx";

export default function Login() {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setMessage("Account created! If email confirmation is on, check your inbox, then sign in.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black px-5 py-12 font-sans text-neutral-100">
      {/* full-screen drifting food + ambient glow */}
      <FloatingFood count={22} />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-orange-600/10 blur-3xl" />

      {/* centered card that adapts to any screen */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-neutral-900 p-7 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-900/30 ring-1 ring-amber-300/40">
            <UtensilsCrossed className="h-7 w-7 text-neutral-900" strokeWidth={2.4} />
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-amber-400/90">Owner portal</p>
          <h1 className="mt-1 font-serif text-3xl text-neutral-50">Aftertaste</h1>
          <p className="mt-2 text-sm text-neutral-400">
            {mode === "signin" ? "Sign in to manage your venue." : "Create your venue account."}
          </p>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@restaurant.com"
            className={inputCls}
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (6+ characters)"
            className={inputCls}
          />

          {error && <p className="text-xs text-rose-300">{error}</p>}
          {message && <p className="text-xs text-emerald-300">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-4 text-sm font-semibold text-neutral-900 shadow-lg shadow-amber-900/30 transition-all duration-200 hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setMessage("");
            }}
            className="text-xs text-neutral-400 transition hover:text-amber-300"
          >
            {mode === "signin"
              ? "New here? Create a venue account"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-neutral-950/60 px-4 py-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition focus:border-amber-400/50";
