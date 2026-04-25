"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Zap, BarChart2, BellRing, Check } from "lucide-react";

const features = [
  {
    icon: <Zap size={20} strokeWidth={1.5} className="text-primary" />,
    title: "Smart Schedule",
    desc: "A deterministic weekly plan built around your classes, labs, and commute. Not someone else's syllabus.",
  },
  {
    icon: <BarChart2 size={20} strokeWidth={1.5} className="text-primary" />,
    title: "Track Progress",
    desc: "Daily streaks, readiness score, and topic completion — all in one clean dashboard.",
  },
  {
    icon: <BellRing size={20} strokeWidth={1.5} className="text-primary" />,
    title: "Daily Reminders",
    desc: "Telegram alerts at your preferred time. Missed a day? Auto-rescheduled, streak preserved.",
  },
];

const FREE_FEATURES = ["7-day schedule", "Topic tracking", "Resource links"];
const PRO_FEATURES  = [
  "Everything in Free",
  "Auto-reschedule on misses",
  "Daily Telegram reminders",
  "Placement readiness score",
  "Rescue mode (30-day sprint)",
  "Ad-free experience",
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-content mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-primary font-medium tracking-tight text-[17px]">
            ThePlacementProject.
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/auth")}
              className="text-on-surface-variant hover:text-on-surface text-small transition-colors"
            >
              Sign in
            </button>
            <button onClick={() => router.push("/auth")} className="btn py-2 px-4 text-small">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-content mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <p className="text-primary text-label uppercase tracking-widest mb-4">
              Placement prep reimagined
            </p>
            <h1 className="text-[42px] sm:text-[56px] font-medium tracking-tight leading-[1.1] mb-6 max-w-3xl mx-auto">
              Placement prep that fits{" "}
              <span className="text-primary">your life.</span>
              <br />Not the other way around.
            </h1>
            <p className="text-on-surface-variant text-body max-w-xl mx-auto mb-10 leading-relaxed">
              A deterministic, timetable-aware engine that builds a realistic weekly study plan
              around your classes, labs, and commute — then adapts when life gets in the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/auth")}
                className="btn flex items-center justify-center gap-2"
              >
                Start Free <ArrowRight size={16} strokeWidth={2} />
              </button>
              <button
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-ghost border border-border rounded-btn px-5 py-3 text-body transition-colors hover:border-primary"
              >
                See Pricing
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-content mx-auto">
          <h2 className="text-h2 text-center mb-12 text-on-surface">
            Everything you need. Nothing you don't.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="card p-6 flex flex-col gap-4"
              >
                <div className="w-10 h-10 rounded-card bg-primary/10 flex items-center justify-center">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-body font-medium mb-1">{f.title}</h3>
                  <p className="text-small text-on-surface-variant leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 border-t border-border">
        <div className="max-w-content mx-auto">
          <h2 className="text-h2 text-center mb-4">Simple pricing.</h2>
          <p className="text-center text-on-surface-variant text-body mb-12">
            Free forever. Go Pro for accountability, reminders, and rescue mode.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="card p-6 flex flex-col gap-4">
              <div>
                <p className="text-small text-on-surface-variant uppercase tracking-widest mb-2">Free</p>
                <p className="text-h1 font-medium">₹0</p>
              </div>
              <ul className="flex flex-col gap-3">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-small text-on-surface-variant">
                    <Check size={14} className="text-success shrink-0" strokeWidth={2} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push("/auth")}
                className="mt-auto btn bg-surface border border-border text-on-surface hover:border-primary"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro */}
            <div className="card p-6 flex flex-col gap-4 border-primary">
              <div>
                <p className="text-small text-primary uppercase tracking-widest mb-2">Pro</p>
                <div className="flex items-end gap-1">
                  <p className="text-h1 font-medium">₹29</p>
                  <p className="text-on-surface-variant text-small mb-1">/month</p>
                </div>
                <p className="text-small text-on-surface-variant">via UPI or card</p>
              </div>
              <ul className="flex flex-col gap-3">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-small text-on-surface-variant">
                    <Check size={14} className="text-primary shrink-0" strokeWidth={2} />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => router.push("/auth")} className="mt-auto btn">
                Start Free → Upgrade
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-content mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-primary text-small font-medium">ThePlacementProject.</span>
          <div className="flex gap-6">
            {["Terms", "Privacy", "Support"].map((l) => (
              <a key={l} href="#" className="text-on-surface-variant text-small hover:text-on-surface transition-colors">
                {l}
              </a>
            ))}
          </div>
          <span className="text-on-surface-variant text-small">© 2026 ThePlacementProject</span>
        </div>
      </footer>
    </div>
  );
}
