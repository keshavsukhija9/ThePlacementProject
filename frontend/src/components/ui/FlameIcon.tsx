"use client";

import { useEffect, useRef } from "react";

/**
 * FlameIcon — a flickering SVG flame. Paths animate every ~3.2s via CSS.
 * CSS drives the distortion so it works without JS timers.
 */
export default function FlameIcon({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Outer body — wider flicker */}
      <path
        className="flame-path-1"
        d="M12 2C8 6 6 10 9 14C10.5 16 10 18 12 20C14 18 13.5 16 15 14C18 10 16 6 12 2Z"
        fill="var(--c-accent)"
        opacity="0.95"
      />
      {/* Inner core — tighter flicker */}
      <path
        className="flame-path-2"
        d="M12 8C10 10.5 9.5 13 11 15C11.5 15.8 11.5 17 12 18C12.5 17 12.5 15.8 13 15C14.5 13 14 10.5 12 8Z"
        fill="#fff"
        opacity="0.3"
      />
      {/* Tip — upward jitter */}
      <path
        className="flame-tip"
        d="M12 2C11.5 3.5 11 5 12 6.5C13 5 12.5 3.5 12 2Z"
        fill="#fff"
        opacity="0.5"
      />
    </svg>
  );
}
