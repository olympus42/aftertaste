import { useRef } from "react";

const FOODS = ["🍕", "🍔", "🍟", "🌮", "🥤", "🍩", "🌭", "🥗", "🍦", "🧀", "🥐", "🍣", "🍜", "🧁"];

// A decorative, zero-gravity food layer. Sits behind page content
// (z-0, pointer-events off) so it never interferes with the UI.
export default function FloatingFood({ count = 16 }) {
  const items = useRef(
    Array.from({ length: count }).map(() => ({
      emoji: FOODS[Math.floor(Math.random() * FOODS.length)],
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 22 + Math.random() * 34,
      dur: 16 + Math.random() * 16,
      delay: -Math.random() * 20,
      dx1: (Math.random() - 0.5) * 140,
      dy1: (Math.random() - 0.5) * 140,
      dx2: (Math.random() - 0.5) * 140,
      dy2: (Math.random() - 0.5) * 140,
      dx3: (Math.random() - 0.5) * 140,
      dy3: (Math.random() - 0.5) * 140,
      spin: Math.random() > 0.5 ? 360 : -360,
      opacity: 0.4 + Math.random() * 0.45,
    }))
  ).current;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes ff-drift {
          0%   { transform: translate(0,0) rotate(0deg); }
          25%  { transform: translate(var(--dx1), var(--dy1)) rotate(calc(var(--spin) * .25)); }
          50%  { transform: translate(var(--dx2), var(--dy2)) rotate(calc(var(--spin) * .5)); }
          75%  { transform: translate(var(--dx3), var(--dy3)) rotate(calc(var(--spin) * .75)); }
          100% { transform: translate(0,0) rotate(var(--spin)); }
        }
      `}</style>
      {items.map((it, i) => (
        <span
          key={i}
          className="absolute select-none will-change-transform"
          style={{
            left: `${it.left}%`,
            top: `${it.top}%`,
            fontSize: `${it.size}px`,
            opacity: it.opacity,
            filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.45))",
            animation: `ff-drift ${it.dur}s ease-in-out ${it.delay}s infinite`,
            "--dx1": `${it.dx1}px`,
            "--dy1": `${it.dy1}px`,
            "--dx2": `${it.dx2}px`,
            "--dy2": `${it.dy2}px`,
            "--dx3": `${it.dx3}px`,
            "--dy3": `${it.dy3}px`,
            "--spin": `${it.spin}deg`,
          }}
        >
          {it.emoji}
        </span>
      ))}
    </div>
  );
}
