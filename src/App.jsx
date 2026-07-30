import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSession } from "./useSession";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Feedback from "./pages/Feedback.jsx";

function Splash() {
  return (
    <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center font-sans text-neutral-400">
      <p className="text-sm animate-pulse">Loading…</p>
    </div>
  );
}

// Shows the login screen; if already signed in, jump to the dashboard.
function LoginGate() {
  const session = useSession();
  if (session === undefined) return <Splash />;
  if (session) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

// Wraps owner-only pages; bounces to login if not signed in.
function Protected({ children }) {
  const session = useSession();
  if (session === undefined) return <Splash />;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginGate />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/v/:venueId" element={<Feedback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
