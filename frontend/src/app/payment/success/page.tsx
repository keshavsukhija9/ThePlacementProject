"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { verifyPayment } from "@/lib/api";
import { useStore } from "@/lib/store";

type PaymentStatus = "loading" | "success" | "failed" | "pending";

export default function PaymentSuccessPage() {
  const searchParams    = useSearchParams();
  const router          = useRouter();
  const setProfile      = useStore((s) => s.setProfile);
  const profile         = useStore((s) => s.profile);
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [attempts, setAttempts] = useState(0);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setStatus("failed");
      return;
    }

    let cancelled = false;

    const poll = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/auth"); return; }

      try {
        const result = await verifyPayment(session.access_token, sessionId);
        if (cancelled) return;

        if (result.status === "success") {
          setStatus("success");
          if (profile) setProfile({ ...profile, is_pro: true });
        } else if (result.status === "expired" || attempts >= 5) {
          setStatus("failed");
        } else {
          setStatus("pending");
          setAttempts((a) => a + 1);
          setTimeout(poll, 2000);
        }
      } catch {
        if (!cancelled) setStatus("failed");
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <a href="/dashboard" className="absolute top-6 left-6 text-on-surface-variant text-small hover:text-on-surface transition-colors">
        ← Dashboard
      </a>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="card p-10 max-w-sm w-full text-center flex flex-col items-center gap-6"
      >
        {status === "loading" || status === "pending" ? (
          <>
            <Loader2 size={40} className="text-primary animate-spin" strokeWidth={1.5} />
            <div>
              <p className="text-body font-medium mb-1">Confirming payment…</p>
              <p className="text-small text-on-surface-variant">
                This usually takes a few seconds.
              </p>
            </div>
          </>
        ) : status === "success" ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
            >
              <CheckCircle size={56} className="text-success" strokeWidth={1.5} />
            </motion.div>
            <div>
              <p className="text-h2 font-medium mb-2">You're Pro! 🎉</p>
              <p className="text-small text-on-surface-variant leading-relaxed">
                Smart scheduling, readiness scoring, and daily reminders are now unlocked.
                Your Pro access is active for 30 days.
              </p>
            </div>
            <button onClick={() => router.push("/dashboard")} className="btn w-full">
              Go to Dashboard
            </button>
          </>
        ) : (
          <>
            <XCircle size={56} className="text-error" strokeWidth={1.5} />
            <div>
              <p className="text-h2 font-medium mb-2">Payment not confirmed</p>
              <p className="text-small text-on-surface-variant leading-relaxed">
                Your payment either failed or timed out. No charge was made to your account.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button onClick={() => router.push("/dashboard")} className="btn">
                Back to Dashboard
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
