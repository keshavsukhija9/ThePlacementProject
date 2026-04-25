"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";

export default function AuthPage() {
  const router      = useRouter();
  const toast       = useToast();
  const [email, setEmail]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMagicSent(true);
      toast.success("Magic link sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Back to home */}
      <a href="/" className="absolute top-6 left-6 text-on-surface-variant text-small hover:text-on-surface transition-colors">
        ← ThePlacementProject
      </a>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-primary text-label uppercase tracking-widest mb-3">Welcome</p>
          <h1 className="text-h1 font-medium mb-2">Sign in to continue</h1>
          <p className="text-on-surface-variant text-small">
            No password needed. Magic link or Google.
          </p>
        </div>

        {/* Card */}
        <div className="card p-6 flex flex-col gap-5">
          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-border rounded-btn
                       py-3 px-5 text-body text-on-surface hover:border-primary transition-all duration-150
                       disabled:opacity-50 disabled:pointer-events-none"
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.76 0 3.35.64 4.59 1.69l3.42-3.42A11.96 11.96 0 0 0 12 .9C8.11.9 4.73 2.84 2.68 5.87l2.59 3.89Z"/>
                <path fill="#34A853" d="M16.04 18.01A7.08 7.08 0 0 1 12 19.1c-2.87 0-5.34-1.72-6.52-4.22L2.9 18.76A11.96 11.96 0 0 0 12 23.1c3.2 0 6.24-1.2 8.5-3.4l-4.46-1.69Z"/>
                <path fill="#FBBC05" d="M5.48 14.88A7.01 7.01 0 0 1 4.9 12c0-1.01.17-1.98.48-2.88L2.68 5.87A11.96 11.96 0 0 0 .9 12c0 2.13.56 4.13 1.54 5.87l3.04-2.99Z"/>
                <path fill="#4285F4" d="M23.1 12c0-.76-.07-1.49-.2-2.2H12v4.16h6.24a5.32 5.32 0 0 1-2.31 3.49l4.46 1.69C21.97 17.15 23.1 14.72 23.1 12Z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-on-surface-variant text-small">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Magic Link */}
          {!magicSent ? (
            <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
              <div>
                <label className="label" htmlFor="email">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" strokeWidth={1.5} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    required
                    className="input pl-9"
                    autoComplete="email"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="btn flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>Send Magic Link <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-2">
              <p className="text-body font-medium mb-1">Check your inbox ✉️</p>
              <p className="text-small text-on-surface-variant mb-4">
                We sent a login link to <strong className="text-on-surface">{email}</strong>
              </p>
              <button
                onClick={() => { setMagicSent(false); setEmail(""); }}
                className="text-primary text-small hover:opacity-80 transition-opacity"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-on-surface-variant text-small mt-5">
          By signing in, you agree to our{" "}
          <a href="#" className="text-on-surface hover:text-primary transition-colors">Terms</a>
          {" "}and{" "}
          <a href="#" className="text-on-surface hover:text-primary transition-colors">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
