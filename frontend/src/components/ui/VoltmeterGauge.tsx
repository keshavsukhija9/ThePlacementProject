"use client";

import { useEffect, useRef } from "react";

/**
 * VoltmeterGauge — analog-style readiness dial.
 * Needle swings from left (-120°) to right (+120°), with a subtle jitter
 * once it settles. Looks like an actual panel meter.
 */
export default function VoltmeterGauge({
  value = 0,       // 0–100
  label = "READINESS",
  isPro = false,
}: {
  value: number;
  label?: string;
  isPro?: boolean;
}) {
  const needleRef = useRef<SVGLineElement>(null);
  const prevValue = useRef(0);

  // Map [0, 100] → [-120°, +120°]
  const toAngle = (v: number) => -120 + (Math.min(Math.max(v, 0), 100) / 100) * 240;

  useEffect(() => {
    const needle = needleRef.current;
    if (!needle || !isPro) return;

    const targetAngle = toAngle(value);
    const startAngle  = toAngle(prevValue.current);
    prevValue.current = value;

    let start: number | null = null;
    const duration = 600; // ms total swing

    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / duration, 1);
      // Custom cubic-bezier approximation: ease-out-heavy
      const eased = 1 - Math.pow(1 - t, 3);
      const angle = startAngle + (targetAngle - startAngle) * eased;

      // Apply rotation around pivot (cx=80, cy=80)
      needle.setAttribute(
        "transform",
        `rotate(${angle.toFixed(2)}, 80, 80)`
      );

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // Add CSS jitter once settled
        needle.style.animation = `needleJitter 2.4s ease-in-out infinite`;
        needle.style.setProperty("--angle", `${targetAngle}deg`);
      }
    };

    needle.style.animation = "none";
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, isPro]);

  const angle = toAngle(value);

  // Tick marks at 0, 10%, 20%... 100%
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = toAngle(i * 10);
    const rad = (a * Math.PI) / 180;
    const r1 = 62, r2 = 70;
    const cx = 80, cy = 80;
    return {
      x1: cx + r1 * Math.sin(rad),
      y1: cy - r1 * Math.cos(rad),
      x2: cx + r2 * Math.sin(rad),
      y2: cy - r2 * Math.cos(rad),
      major: i % 5 === 0,
    };
  });

  if (!isPro) {
    return (
      <div className="card-mech p-5 flex flex-col items-center gap-3 select-none">
        <span className="label-mech tracking-widest">{label}</span>
        <div className="relative w-40 h-24 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-t-full border-t-[1px] border-x-[1px] border-b-0"
            style={{ borderColor: "var(--c-border)" }}
          />
          <span className="mono text-xs" style={{ color: "var(--c-txt-dim)" }}>
            PRO ONLY
          </span>
        </div>
        <span className="mono text-xl font-bold" style={{ color: "var(--c-txt-dim)" }}>
          ?%
        </span>
      </div>
    );
  }

  return (
    <div className="card-mech p-5 flex flex-col items-center gap-2 select-none">
      <span className="label-mech tracking-widest">{label}</span>
      <svg
        width="160"
        height="100"
        viewBox="0 0 160 105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`${label}: ${value}%`}
        role="img"
      >
        {/* Arc background */}
        <path
          d="M 10 90 A 70 70 0 1 1 150 90"
          stroke="var(--c-surface3)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Filled arc up to value */}
        <path
          d="M 10 90 A 70 70 0 1 1 150 90"
          stroke="var(--c-accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * 220} 220`}
          fill="none"
          opacity="0.25"
        />
        {/* Zone bands */}
        <path
          d="M 10 90 A 70 70 0 0 1 55 25"
          stroke="var(--c-error)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.2"
        />
        <path
          d="M 55 25 A 70 70 0 0 1 105 25"
          stroke="var(--c-warn)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.2"
        />
        <path
          d="M 105 25 A 70 70 0 0 1 150 90"
          stroke="var(--c-success)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.2"
        />

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.major ? "var(--c-txt-dim)" : "var(--c-border-hi)"}
            strokeWidth={t.major ? "1.5" : "0.75"}
            strokeLinecap="round"
            transform="translate(0, 10)"
          />
        ))}

        {/* Pivot shadow */}
        <circle cx="80" cy="90" r="6" fill="var(--c-surface3)" />
        <circle cx="80" cy="90" r="3" fill="var(--c-txt-dim)" />

        {/* Needle */}
        <line
          ref={needleRef}
          x1="80"
          y1="90"
          x2="80"
          y2="28"
          stroke="var(--c-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${angle}, 80, 90)`}
          style={{ transformOrigin: "80px 90px" }}
        />

        {/* Center cap */}
        <circle cx="80" cy="90" r="4" fill="var(--c-accent)" />
      </svg>

      {/* Digital readout */}
      <span
        className="mono text-2xl font-bold tabular-nums"
        style={{ color: "var(--c-accent)" }}
      >
        {value.toString().padStart(3, " ")}
        <span className="text-sm opacity-60">%</span>
      </span>
    </div>
  );
}
