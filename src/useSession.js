import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// Returns:
//   undefined  -> still checking (show a splash)
//   null       -> logged out
//   session obj-> logged in
export function useSession() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return session;
}
