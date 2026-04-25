"use client";

import { useRef, useEffect } from "react";

/**
 * MagneticText — the header text subtly leans toward the cursor.
 * Works by tracking mouse offset from element center and applying
 * a proportional transform. The cubic-bezier is the "lock" easing.
 */
export default function MagneticText({
  children,
  strength = 0.18,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number; // 0-1, how strongly it follows the mouse
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;
        el.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
        el.style.transition = "transform 0ms";
      });
    };

    const onLeave = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      el.style.transform = "translate(0px, 0px)";
      el.style.transition = "transform 400ms cubic-bezier(0.23, 1, 0.32, 1)";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`magnetic inline-block ${className}`}>
      {children}
    </span>
  );
}
