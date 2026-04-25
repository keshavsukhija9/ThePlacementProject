"use client";

import { useRef, useState, useCallback, useId } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Clock3, SkipForward, ExternalLink, LogOut, Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useStore, type ScheduleItem } from "@/lib/store";
import { updateProgress, createCheckout } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import MagneticText from "@/components/ui/MagneticText";
import FlameIcon from "@/components/ui/FlameIcon";
import VoltmeterGauge from "@/components/ui/VoltmeterGauge";

// ── Constants ─────────────────────────────────────────────────────────────────
const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const DIFF_BADGE: Record<string, { bg: string; color: string }> = {
  easy:   { bg: "rgba(16, 185, 129, 0.1)",  color: "var(--c-success)" },
  medium: { bg: "rgba(245, 158, 11, 0.1)",  color: "var(--c-warn)" },
  hard:   { bg: "rgba(239, 68, 68, 0.1)",   color: "var(--c-error)" },
};

// Unique per-card animation delays — subtle variation, not AI-pattern
const CARD_DELAYS = [0, 20, 40, 20, 60, 30, 10, 50, 20, 40, 30, 60, 10, 50, 20, 30, 40, 10];

// Mechanical cubic-bezier — heavy initial, then snap
const LOCK = [0.23, 1, 0.32, 1] as const;

// Haptic: double-tap feel — [vibrate 15ms, pause 30ms, vibrate 10ms]
function haptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([15, 30, 10]);
  }
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({
  item,
  index,
  onToggle,
}: {
  item: ScheduleItem;
  index: number;
  onToggle: (item: ScheduleItem) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const delay = CARD_DELAYS[index % CARD_DELAYS.length];
  const diff = DIFF_BADGE[item.difficulty] ?? DIFF_BADGE.easy;

  const handleClick = () => {
    onToggle(item);
    // Complete flash effect on the card
    if (item.status !== "completed") {
      cardRef.current?.classList.add("complete-flash");
      setTimeout(() => cardRef.current?.classList.remove("complete-flash"), 360);
      haptic();
    }
  };

  return (
    <motion.div
      id={`task-${uid}`}
      ref={cardRef}
      key={item.id}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.08,
        delay: delay / 1000,
        ease: LOCK,
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      aria-pressed={item.status === "completed"}
      style={{
        background:    "var(--c-surface2)",
        border:        "0.5px solid var(--c-border)",
        borderRadius:  "3px",
        boxShadow:     "var(--shadow-1)",
        padding:       "12px",
        cursor:        "pointer",
        userSelect:    "none",
        display:       "flex",
        flexDirection: "column",
        gap:           "10px",
        opacity:       item.status === "completed" ? 0.55 : 1,
        transition:    `
          border-color 80ms cubic-bezier(0.23,1,0.32,1),
          box-shadow   80ms cubic-bezier(0.23,1,0.32,1),
          opacity      120ms cubic-bezier(0.23,1,0.32,1),
          transform    80ms cubic-bezier(0.23,1,0.32,1)
        `,
      }}
      whileHover={{
        borderColor: "var(--c-border-hi)",
        boxShadow:   "var(--shadow-2)",
      }}
      whileTap={{
        x: 1, y: 1,
        boxShadow: "none",
        transition: { duration: 0.05 },
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
        <span className="mono" style={{ fontSize: "10px", color: "var(--c-txt-dim)", letterSpacing: "0.04em" }}>
          {item.time_slot}
        </span>
        <motion.div
          animate={item.status === "completed" ? { scale: [1, 1.25, 1] } : {}}
          transition={{ duration: 0.25, ease: LOCK }}
        >
          {item.status === "completed" ? (
            <CheckCircle2 size={15} style={{ color: "var(--c-success)", flexShrink: 0 }} strokeWidth={2} />
          ) : item.status === "skipped" ? (
            <SkipForward size={15} style={{ color: "var(--c-txt-dim)", flexShrink: 0 }} strokeWidth={1.5} />
          ) : (
            <Clock3 size={15} style={{ color: "var(--c-warn)", flexShrink: 0 }} strokeWidth={1.5} />
          )}
        </motion.div>
      </div>

      {/* Topic */}
      <p
        style={{
          fontSize:       "12px",
          fontWeight:     500,
          lineHeight:     1.35,
          color:          item.status === "completed" ? "var(--c-txt-dim)" : "var(--c-txt)",
          textDecoration: item.status === "completed" ? "line-through" : "none",
        }}
      >
        {item.topic}
      </p>

      {/* Footer row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          className="mono"
          style={{
            fontSize:     "9px",
            fontWeight:   600,
            letterSpacing:"0.1em",
            padding:      "2px 6px",
            borderRadius: "2px",
            background:   diff.bg,
            color:        diff.color,
            textTransform:"uppercase",
          }}
        >
          {item.difficulty}
        </span>
        <a
          href={item.resource_url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        "3px",
            fontSize:   "9px",
            fontFamily: "var(--font-mono)",
            color:      "var(--c-txt-dim)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            transition: "color 80ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-txt-dim)")}
        >
          LINK <ExternalLink size={9} strokeWidth={2} />
        </a>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router       = useRouter();
  const toast        = useToast();
  const [rescueMode, setRescueMode] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const schedule     = useStore((s) => s.schedule);
  const profile      = useStore((s) => s.profile);
  const user         = useStore((s) => s.user);
  const streak       = useStore((s) => s.streak);
  const readiness    = useStore((s) => s.readinessScore);
  const updateItem   = useStore((s) => s.updateItemStatus);
  const setStreak    = useStore((s) => s.setStreak);
  const setReadiness = useStore((s) => s.setReadinessScore);
  const setProfile   = useStore((s) => s.setProfile);

  const items  = schedule?.items ?? [];
  const isPro  = profile?.is_pro ?? false;
  const name   = user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "engineer";

  const completed = items.filter((i) => i.status === "completed").length;
  const total     = items.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  // ── Toggle ─────────────────────────────────────────────────────────────────
  const toggleStatus = useCallback(async (item: ScheduleItem) => {
    const newStatus: ScheduleItem["status"] =
      item.status === "completed" ? "pending" : "completed";
    updateItem(item.id, newStatus);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const res = await updateProgress(session.access_token, item.id, newStatus);
      setStreak(res.streak);
      setReadiness(res.readiness_score);
    } catch {
      updateItem(item.id, item.status);
      toast.error("Progress sync failed — check your connection.");
    }
  }, [updateItem, setStreak, setReadiness, toast]);

  // ── Go Pro ─────────────────────────────────────────────────────────────────
  const handleUpgrade = async () => {
    setCheckingOut(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/auth"); return; }
    try {
      const { checkout_url } = await createCheckout(session.access_token);
      window.location.href = checkout_url;
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
      setCheckingOut(false);
    }
  };

  // ── Sign out ───────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // ── Timestamp ─────────────────────────────────────────────────────────────
  const now = new Date();
  const timestamp = `${now.toISOString().split("T")[0]} / WK${Math.ceil(now.getDate() / 7)}`;

  return (
    <div
      data-rescue={rescueMode}
      style={{ minHeight: "100vh", background: "var(--c-bg)", color: "var(--c-txt)" }}
    >

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header
        style={{
          position:       "fixed",
          top:            0,
          left:           0,
          right:          0,
          height:         "48px",
          zIndex:         100,
          background:     "rgba(9,9,13,0.92)",
          backdropFilter: "blur(6px)",
          borderBottom:   "0.5px solid var(--c-border)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "0 24px",
          boxShadow:      "var(--shadow-1)",
        }}
      >
        {/* Wordmark — magnetic */}
        <MagneticText strength={0.12}>
          <span
            className="mono"
            style={{
              color:         "var(--c-accent)",
              fontWeight:    700,
              fontSize:      "14px",
              letterSpacing: "0.02em",
            }}
          >
            TPP://dashboard
          </span>
        </MagneticText>

        {/* Status bar */}
        <div
          className="mono"
          style={{
            display:       "flex",
            alignItems:    "center",
            gap:           "16px",
            fontSize:      "10px",
            color:         "var(--c-txt-dim)",
            letterSpacing: "0.08em",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                width: "5px", height: "5px",
                borderRadius: "50%",
                background: "var(--c-success)",
                display: "inline-block",
                boxShadow: "0 0 4px var(--c-success)",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            SYS:OK
          </span>
          <span className="hidden md:block">{timestamp}</span>
          <span className="hidden md:block">{name.toUpperCase()}</span>

          {/* Rescue mode toggle */}
          <button
            onClick={() => setRescueMode((r) => !r)}
            className="btn-mech-ghost"
            style={{
              color:       rescueMode ? "var(--c-warn)" : undefined,
              borderColor: rescueMode ? "var(--c-warn)" : undefined,
              fontSize:    "9px",
            }}
          >
            {rescueMode ? "⚠ RESCUE:ON" : "RESCUE"}
          </button>

          {!isPro && (
            <button
              onClick={handleUpgrade}
              disabled={checkingOut}
              className="btn-mech"
              style={{ fontSize: "11px", padding: "5px 12px" }}
            >
              <Zap size={11} strokeWidth={2} />
              {checkingOut ? "LOADING..." : "PRO ₹29"}
            </button>
          )}
          {isPro && (
            <span
              className="mono"
              style={{
                fontSize:    "10px",
                fontWeight:  700,
                color:       "var(--c-accent)",
                border:      "0.5px solid var(--c-accent)",
                padding:     "3px 8px",
                borderRadius:"2px",
              }}
            >
              PRO
            </span>
          )}

          <button
            onClick={handleSignOut}
            title="Sign out"
            className="btn-mech-ghost"
            style={{ padding: "5px 8px" }}
          >
            <LogOut size={12} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ── MAIN ─────────────────────────────────────────────────────────────── */}
      <main
        className={rescueMode ? "rescue-scanline" : ""}
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "72px 24px 80px", position: "relative" }}
      >

        {/* ── Status Row ─────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.08, ease: LOCK }}
          style={{
            display:       "flex",
            justifyContent:"space-between",
            alignItems:    "flex-end",
            flexWrap:      "wrap",
            gap:           "16px",
            marginBottom:  "28px",
          }}
        >
          <div>
            <p
              className="mono"
              style={{ fontSize: "9px", letterSpacing: "0.14em", color: "var(--c-txt-dim)", marginBottom: "4px" }}
            >
              PLACEMENT ENGINE v1.0 / {rescueMode ? "RESCUE MODE ACTIVE" : "NOMINAL"}
            </p>
            <h1 style={{ fontSize: "26px", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Week at a glance,{" "}
              <span style={{ color: "var(--c-accent)" }}>{name.toLowerCase()}.</span>
            </h1>
          </div>

          {/* Metric cluster */}
          <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
            {/* Streak */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.02, duration: 0.08, ease: LOCK }}
              className="card-mech"
              style={{ padding: "10px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: "64px" }}
            >
              <FlameIcon size={18} />
              <span
                className="mono"
                style={{ fontSize: "22px", fontWeight: 700, color: "var(--c-accent)", lineHeight: 1 }}
              >
                {streak}
              </span>
              <span
                className="mono"
                style={{ fontSize: "8px", letterSpacing: "0.1em", color: "var(--c-txt-dim)" }}
              >
                STREAK
              </span>
            </motion.div>

            {/* Completion */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.04, duration: 0.08, ease: LOCK }}
              className="card-mech"
              style={{ padding: "10px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: "64px" }}
            >
              <span
                className="mono"
                style={{ fontSize: "22px", fontWeight: 700, color: "var(--c-txt)", lineHeight: 1 }}
              >
                {pct}%
              </span>
              <span
                className="mono"
                style={{ fontSize: "8px", letterSpacing: "0.1em", color: "var(--c-txt-dim)" }}
              >
                DONE
              </span>
            </motion.div>

            {/* Tasks */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.06, duration: 0.08, ease: LOCK }}
              className="card-mech"
              style={{ padding: "10px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: "64px" }}
            >
              <span
                className="mono"
                style={{ fontSize: "22px", fontWeight: 700, color: "var(--c-txt)", lineHeight: 1 }}
              >
                {completed}<span style={{ fontSize: "13px", color: "var(--c-txt-dim)" }}>/{total}</span>
              </span>
              <span
                className="mono"
                style={{ fontSize: "8px", letterSpacing: "0.1em", color: "var(--c-txt-dim)" }}
              >
                TASKS
              </span>
            </motion.div>
          </div>
        </motion.section>

        {/* ── Progress Bar — mechanical fill ─────────────────────────────────── */}
        <div
          style={{
            height:       "3px",
            background:   "var(--c-surface3)",
            borderRadius: "0",
            marginBottom: "32px",
            overflow:     "hidden",
            boxShadow:    "inset 1px 0 0 rgba(0,0,0,0.5)",
          }}
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: LOCK }}
            style={{
              height:     "100%",
              background: `var(--c-accent)`,
              boxShadow:  "1px 0 6px var(--c-accent)",
            }}
          />
        </div>

        {/* ── 7-Day Grid ──────────────────────────────────────────────────────── */}
        <section style={{ marginBottom: "40px" }}>
          <p
            className="mono"
            style={{ fontSize: "9px", letterSpacing: "0.14em", color: "var(--c-txt-dim)", marginBottom: "14px" }}
          >
            SCHEDULE_MATRIX / {schedule?.schedule_id?.slice(0, 8).toUpperCase() ?? "—"}
          </p>

          <div
            style={{
              display:             "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap:                 "8px",
            }}
          >
            {DAY_NAMES.map((dayName, dIdx) => {
              const dayItems  = items.filter((it) => it.day_index === dIdx);
              const isWeekend = dIdx >= 5;

              return (
                <div key={dayName} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {/* Day header */}
                  <div
                    className="mono"
                    style={{
                      fontSize:     "9px",
                      fontWeight:   700,
                      letterSpacing:"0.14em",
                      color:        isWeekend ? "var(--c-accent)" : "var(--c-txt-dim)",
                      paddingBottom:"4px",
                      borderBottom: `0.5px solid ${isWeekend ? "var(--c-accent)" : "var(--c-border)"}`,
                      marginBottom: "2px",
                    }}
                  >
                    {dayName}
                    {isWeekend && (
                      <span style={{ marginLeft: "4px", fontSize: "7px", opacity: 0.6 }}>WE</span>
                    )}
                  </div>

                  {dayItems.length === 0 ? (
                    <div
                      style={{
                        border:       "0.5px dashed var(--c-border)",
                        borderRadius: "3px",
                        height:       "56px",
                        display:      "flex",
                        alignItems:   "center",
                        justifyContent:"center",
                      }}
                    >
                      <span className="mono" style={{ fontSize: "8px", color: "var(--c-txt-faint)", letterSpacing: "0.1em" }}>
                        REST
                      </span>
                    </div>
                  ) : (
                    dayItems.map((item, itemIdx) => (
                      <TaskCard
                        key={item.id}
                        item={item}
                        index={dIdx * 4 + itemIdx}
                        onToggle={toggleStatus}
                      />
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Analytics Row ────────────────────────────────────────────────────── */}
        <section
          style={{
            display:             "grid",
            gridTemplateColumns: "1fr 1fr 200px",
            gap:                 "8px",
            marginBottom:        "40px",
          }}
          className="flex-col lg:grid"
        >
          {/* System log */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.08, ease: LOCK }}
            className="card-mech"
            style={{ padding: "16px", fontFamily: "var(--font-mono)", fontSize: "11px" }}
          >
            <p className="label-mech" style={{ marginBottom: "10px" }}>SYSTEM LOG</p>
            {[
              { ts: "00:00", msg: "Schedule engine initialized", ok: true },
              { ts: "00:01", msg: `Loaded ${total} task blocks`, ok: true },
              { ts: "00:02", msg: `Completed: ${completed}/${total} sessions`, ok: true },
              { ts: "00:03", msg: rescueMode ? "RESCUE MODE ENGAGED" : "Nominal operation", ok: !rescueMode },
              { ts: "00:04", msg: isPro ? "Pro features: ENABLED" : "Pro features: LOCKED", ok: isPro },
            ].map((log, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "4px", alignItems: "baseline" }}>
                <span style={{ color: "var(--c-txt-dim)", fontSize: "9px", minWidth: "32px" }}>{log.ts}</span>
                <span
                  style={{ fontSize: "9px", marginRight: "6px" }}
                >
                  {log.ok ? (
                    <span style={{ color: "var(--c-success)" }}>✓</span>
                  ) : (
                    <span style={{ color: "var(--c-warn)" }}>⚠</span>
                  )}
                </span>
                <span style={{ color: log.ok ? "var(--c-txt)" : "var(--c-warn)", fontSize: "10px" }}>
                  {log.msg}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.08, ease: LOCK }}
            className="card-mech"
            style={{ padding: "16px" }}
          >
            <p className="label-mech" style={{ marginBottom: "10px" }}>METRICS</p>
            {[
              { label: "COMPLETION",  value: `${pct}%`,                  color: "var(--c-txt)" },
              { label: "STREAK",     value: `${streak} days`,            color: "var(--c-accent)" },
              { label: "REMAINING",  value: `${total - completed} tasks`, color: "var(--c-txt-dim)" },
              { label: "TIER",       value: profile?.college_tier ?? "—", color: "var(--c-txt)" },
              { label: "STATUS",     value: rescueMode ? "RESCUE" : "ACTIVE", color: rescueMode ? "var(--c-warn)" : "var(--c-success)" },
            ].map((m, i) => (
              <div
                key={m.label}
                style={{
                  display:        "flex",
                  justifyContent: "space-between",
                  alignItems:     "center",
                  padding:        "5px 0",
                  borderBottom:   "0.5px solid var(--c-border)",
                }}
              >
                <span className="mono" style={{ fontSize: "9px", color: "var(--c-txt-dim)", letterSpacing: "0.1em" }}>
                  {m.label}
                </span>
                <span className="mono" style={{ fontSize: "12px", fontWeight: 600, color: m.color }}>
                  {m.value}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Voltmeter gauge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12, duration: 0.08, ease: LOCK }}
          >
            <VoltmeterGauge value={readiness} isPro={isPro} label="READINESS" />
          </motion.div>
        </section>

        {/* ── Pro CTA — only if not pro ────────────────────────────────────────── */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.08, ease: LOCK }}
            className="card-mech"
            style={{
              padding:      "20px 24px",
              display:      "flex",
              justifyContent:"space-between",
              alignItems:   "center",
              gap:          "16px",
              borderColor:  "rgba(249,115,22,0.2)",
            }}
          >
            <div>
              <p className="label-mech" style={{ marginBottom: "4px" }}>UPGRADE AVAILABLE</p>
              <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "2px" }}>
                Unlock Pro — ₹29 / month
              </p>
              <p className="mono" style={{ fontSize: "10px", color: "var(--c-txt-dim)" }}>
                Readiness gauge · Daily Telegram alerts · Auto-reschedule · Rescue mode
              </p>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={checkingOut}
              className="btn-mech"
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              <Zap size={12} strokeWidth={2} />
              {checkingOut ? "OPENING..." : "GET PRO →"}
            </button>
          </motion.div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop:   "0.5px solid var(--c-border)",
          padding:     "12px 24px",
          display:     "flex",
          justifyContent:"space-between",
          alignItems:  "center",
        }}
      >
        <span className="mono" style={{ fontSize: "9px", color: "var(--c-txt-dim)", letterSpacing: "0.1em" }}>
          TPP © 2026
        </span>
        <span className="mono" style={{ fontSize: "9px", color: "var(--c-txt-dim)", letterSpacing: "0.1em" }}>
          BUILD:{" "}
          <span style={{ color: "var(--c-accent)" }}>
            {new Date().toISOString().slice(0, 10).replace(/-/g, "")}
          </span>
        </span>
      </footer>
    </div>
  );
}
