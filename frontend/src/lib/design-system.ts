/**
 * ZERO-DEFAULT DESIGN SYSTEM
 * Strict policy: No native browser styling. Every pixel is engineered.
 */

// ── GRID SYSTEM ───────────────────────────────────────────────────────────────
// 4px base unit, 8px vertical rhythm
export const GRID = {
  base: 4,
  rhythm: 8,
  spacing: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const,
  padding: [0, 4, 8, 12, 16, 24, 32, 48, 64] as const,
  margin: [0, 4, 8, 12, 16, 24, 32, 48, 64] as const,
};

// ── TYPOGRAPHY SCALE ──────────────────────────────────────────────────────────
// Optically aligned, not just mathematical
export const TYPOGRAPHY = {
  // Font sizes (optical alignment)
  h1: 26,      // Headline
  h2: 20,      // Subheadline
  h3: 18,      // Section title
  body: 14,    // Body text
  small: 12,   // Helper text
  micro: 10,   // Metadata
  // Line heights (optical alignment)
  tight: 1.15,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.75,
  // Letter spacing
  tighter: -0.04,
  tight: -0.02,
  normal: 0,
  wide: 0.02,
  wider: 0.04,
  widest: 0.12,
};

// ── COLORS (Orange System) ────────────────────────────────────────────────────
export const COLORS = {
  // Backgrounds
  bg: '#09090d',
  surface: '#0f0f14',
  surface2: '#151519',
  surface3: '#1c1c22',
  // Borders
  border: 'rgba(255 255 255 / 0.08)',
  borderHi: 'rgba(255 255 255 / 0.14)',
  // Text
  txt: '#e2e1ec',
  txtDim: '#6b6b80',
  txtFaint: '#32323e',
  // Status
  primary: '#f97316',   // Orange
  primaryHi: '#fb923c',
  warn: '#f59e0b',      // Rescue mode
  success: '#10b981',
  error: '#ef4444',
  // Focus
  focus: '#f97316',
  focusRing: 'rgba(249 115 22 / 0.2)',
};

// ── SHADOWS (Mechanical, 0 blur) ──────────────────────────────────────────────
export const SHADOWS = {
  // Elevation layers
  level1: '1px 1px 0 rgba(0 0 0 / 0.9), 2px 2px 0 rgba(0 0 0 / 0.6)',
  level2: '1px 1px 0 rgba(0 0 0 / 0.95), 2px 2px 0 rgba(0 0 0 / 0.7), 4px 4px 0 rgba(0 0 0 / 0.4)',
  // Accent shadow
  accent: '1px 1px 0 var(--c-accent), 2px 2px 0 rgba(249 115 22 / 0.3)',
  // Inset depth (for inputs)
  inset: 'inset 1px 1px 0 rgba(0 0 0 / 0.4)',
  // Focus glow
  focus: '0 0 0 1px var(--c-focus-ring)',
};

// ── EASING (Engineered curves, no ease-in-out) ───────────────────────────────
export const EASING = {
  // Hard snap - heavy initial, then snap
  lock: 'cubic-bezier(0.23, 1, 0.32, 1)',
  // Fast acceleration, hard settling
  fast: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  // Spring with slight overshoot
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  // Pure decelerate
  hard: 'cubic-bezier(0.16, 1, 0.3, 1)',
};

// ── TIMING (Mechanical feel) ──────────────────────────────────────────────────
export const TIMING = {
  lock: '20ms',      // Hard pop-in
  snap: '80ms',      // Button press settle
  travel: '50ms',    // Border stays stuck
  needle: '400ms',   // Gauge swing
  flicker: '3200ms', // Flame distortion
  scanline: '6s',    // Rescue mode
};

// ── RADIUS (Sharp, mechanical) ────────────────────────────────────────────────
export const RADIUS = {
  none: 0,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 6,
  full: 9999,
};

// ── BORDERS (1px controlled stroke) ───────────────────────────────────────────
export const BORDER = {
  width: '0.5px',
  style: 'solid',
  color: COLORS.border,
  colorHi: COLORS.borderHi,
};

// ── FOCUS STATE (Engineered motion) ───────────────────────────────────────────
export const FOCUS = {
  // Custom cubic-bezier with fast acceleration and hard settling
  easing: EASING.fast,
  // Scale micro-feedback (≤1.02)
  scale: 1.02,
  // Luminance shift
  luminance: 0.1,
  // Edge glow
  glow: COLORS.focusRing,
  // Duration
  duration: '80ms',
};

// ── INPUT PRIMITIVES ──────────────────────────────────────────────────────────
export const INPUT = {
  // Flat base with 1px controlled stroke
  base: {
    background: COLORS.surface2,
    border: `${BORDER.width} ${BORDER.style} ${BORDER.color}`,
    borderRadius: RADIUS.sm,
    boxShadow: SHADOWS.inset,
  },
  // Focus state with engineered motion
  focus: {
    border: `${BORDER.width} ${BORDER.style} ${COLORS.primary}`,
    boxShadow: `${SHADOWS.inset}, ${FOCUS.glow}`,
    transition: `border-color ${TIMING.snap} ${EASING.lock}, box-shadow ${TIMING.snap} ${EASING.lock}`,
  },
  // Error state
  error: {
    border: `${BORDER.width} ${BORDER.style} ${COLORS.error}`,
    boxShadow: `${SHADOWS.inset}, 0 0 0 1px rgba(239 68 68 / 0.2)`,
  },
  // Success state
  success: {
    border: `${BORDER.width} ${BORDER.style} ${COLORS.success}`,
    boxShadow: `${SHADOWS.inset}, 0 0 0 1px rgba(16 185 129 / 0.2)`,
  },
  // Padding (precision-aligned)
  padding: {
    horizontal: 12,
    vertical: 10,
  },
  // Height (4px grid aligned)
  height: 40,
};

// ── BUTTON PRIMITIVES ─────────────────────────────────────────────────────────
export const BUTTON = {
  // Base
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: `${INPUT.padding.vertical}px ${INPUT.padding.horizontal}px`,
    background: COLORS.primary,
    color: '#fff',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.04,
    border: `${BORDER.width} solid rgba(255 255 255 / 0.15)`,
    borderRadius: RADIUS.sm,
    boxShadow: SHADOWS.accent,
    cursor: 'pointer',
    outline: 'none',
    transition: `
      transform ${TIMING.snap} ${EASING.lock},
      box-shadow ${TIMING.snap} ${EASING.lock},
      border-color ${TIMING.travel} step-end
    `,
  },
  // Hover
  hover: {
    opacity: 0.92,
  },
  // Active (press)
  active: {
    transform: 'translate(1px, 1px)',
    boxShadow: 'none',
    border: `${BORDER.width} solid ${COLORS.primaryHi}`,
  },
  // Disabled
  disabled: {
    opacity: 0.4,
    pointerEvents: 'none',
  },
  // Focus state with engineered motion
  focus: {
    boxShadow: `${SHADOWS.accent}, ${FOCUS.glow}`,
    transform: `scale(${FOCUS.scale})`,
    transition: `box-shadow ${TIMING.snap} ${EASING.fast}, transform ${TIMING.snap} ${EASING.fast}`,
  },
  // Ghost variant
  ghost: {
    background: 'transparent',
    color: COLORS.txtDim,
    border: `${BORDER.width} solid ${BORDER.color}`,
    boxShadow: SHADOWS.level1,
    transition: `
      color ${TIMING.snap} ${EASING.hard},
      border-color ${TIMING.snap} ${EASING.hard},
      transform ${TIMING.snap} ${EASING.lock}
    `,
  },
  ghostHover: {
    color: COLORS.txt,
    border: `${BORDER.width} solid ${BORDER.colorHi}`,
  },
  // Sizes
  sizes: {
    sm: {
      padding: '6px 10px',
      fontSize: 11,
    },
    md: {
      padding: `${INPUT.padding.vertical}px ${INPUT.padding.horizontal}px`,
      fontSize: 13,
    },
    lg: {
      padding: '14px 20px',
      fontSize: 14,
    },
  },
};

// ── CARD PRIMITIVES ───────────────────────────────────────────────────────────
export const CARD = {
  // Base
  base: {
    background: COLORS.surface,
    border: `${BORDER.width} solid ${BORDER.color}`,
    borderRadius: RADIUS.md,
    boxShadow: SHADOWS.level1,
    transition: `
      border-color ${TIMING.snap} ${EASING.hard},
      box-shadow ${TIMING.snap} ${EASING.hard}
    `,
  },
  // Hover
  hover: {
    border: `${BORDER.width} solid ${BORDER.colorHi}`,
    boxShadow: SHADOWS.level2,
  },
  // Padding (4px grid aligned)
  padding: {
    sm: 12,
    md: 16,
    lg: 24,
  },
};

// ── LABEL PRIMITIVES ──────────────────────────────────────────────────────────
export const LABEL = {
  // Base
  base: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: COLORS.txtDim,
  },
  // Required indicator
  required: {
    color: COLORS.error,
    marginLeft: 4,
  },
};

// ── TYPOGRAPHY CLASSES ────────────────────────────────────────────────────────
export const TYPOGRAPHY_CLASSES = {
  h1: {
    fontSize: TYPOGRAPHY.h1,
    fontWeight: 500,
    letterSpacing: -0.02,
    lineHeight: TYPOGRAPHY.tight,
  },
  h2: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: 500,
    letterSpacing: -0.01,
    lineHeight: TYPOGRAPHY.snug,
  },
  h3: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: 600,
    letterSpacing: 0,
    lineHeight: TYPOGRAPHY.snug,
  },
  body: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: 400,
    letterSpacing: 0,
    lineHeight: TYPOGRAPHY.normal,
  },
  small: {
    fontSize: TYPOGRAPHY.small,
    fontWeight: 400,
    letterSpacing: 0,
    lineHeight: TYPOGRAPHY.normal,
  },
  micro: {
    fontSize: TYPOGRAPHY.micro,
    fontWeight: 400,
    letterSpacing: 0,
    lineHeight: TYPOGRAPHY.normal,
  },
  mono: {
    fontFamily: 'var(--font-mono)',
    fontSize: TYPOGRAPHY.body,
    fontWeight: 400,
    letterSpacing: 0,
    lineHeight: TYPOGRAPHY.normal,
  },
};
