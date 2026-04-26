"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { saveProfile, generateSchedule } from "@/lib/api";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import Loader from "./Loader";

// ── Schema ────────────────────────────────────────────────────────────────────

const onboardingSchema = z.object({
  collegeTier:      z.enum(["Tier-1", "Tier-2", "Tier-3"], { required_error: "Select a tier" }),
  branch:           z.string().min(1, "Branch is required"),
  gradYear:         z.coerce.number().int().min(2020).max(2030),
  targetRoles:      z.array(z.string()).min(1, "Select at least one role"),
  weekdayHrs:       z.coerce.number().int().min(1, "At least 1 hr").max(8, "Max 8 hrs"),
  weekendHrs:       z.coerce.number().int().min(1, "At least 1 hr").max(10, "Max 10 hrs"),
  preferredWindows: z.array(z.string()).min(1, "Select at least one window"),
  skillLevels: z.object({
    dsa:      z.enum(["Beginner", "Intermediate", "Advanced"]),
    web:      z.enum(["Beginner", "Intermediate", "Advanced"]),
    aptitude: z.enum(["Beginner", "Intermediate", "Advanced"]),
  }),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

const ROLES   = ["SDE", "Data Engineer", "Core", "Startup", "Quant", "Other"];
const WINDOWS = ["Morning", "Afternoon", "Evening", "Night"] as const;
const SKILLS  = ["Beginner", "Intermediate", "Advanced"] as const;

const STEP_FIELDS: Record<number, (keyof OnboardingData)[]> = {
  1: ["collegeTier"],
  2: ["branch", "gradYear"],
  3: ["targetRoles"],
  4: ["weekdayHrs", "weekendHrs", "preferredWindows"],
};

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.15 } },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const router      = useRouter();
  const toast       = useToast();
  const setSchedule = useStore((s) => s.setSchedule);
  const setProfile  = useStore((s) => s.setProfile);

  const [step, setStep]           = useState(1);
  const [showLoader, setShowLoader] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const {
    register, handleSubmit, formState: { errors }, watch, setValue, trigger,
  } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      targetRoles:      [],
      preferredWindows: [],
      skillLevels:      { dsa: "Beginner", web: "Beginner", aptitude: "Beginner" },
    },
  });

  // ── Step navigation with per-step validation ──────────────────────────────

  const nextStep = async () => {
    const fields = STEP_FIELDS[step];
    if (fields) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, 5));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // ── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = async (data: OnboardingData) => {
    setError(null);
    setShowLoader(true);
    setIsDataReady(false);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/auth");
      return;
    }

    const token = session.access_token;

    const profilePayload = {
      college_tier:      data.collegeTier,
      branch:            data.branch,
      grad_year:         data.gradYear,
      target_roles:      data.targetRoles,
      weekday_hrs:       data.weekdayHrs,
      weekend_hrs:       data.weekendHrs,
      preferred_windows: data.preferredWindows,
      skill_levels:      {
        dsa:      data.skillLevels.dsa.toLowerCase(),
        web:      data.skillLevels.web.toLowerCase(),
        aptitude: data.skillLevels.aptitude.toLowerCase(),
      },
    };

    const schedulePayload = {
      college_tier:      data.collegeTier,
      target_roles:      data.targetRoles,
      weekday_hrs:       data.weekdayHrs,
      weekend_hrs:       data.weekendHrs,
      preferred_windows: data.preferredWindows,
      skill_levels:      profilePayload.skill_levels,
    };

    try {
      const [profile, schedule] = await Promise.all([
        saveProfile(token, profilePayload),
        generateSchedule(token, schedulePayload),
      ]);
      setProfile(profile);
      setSchedule(schedule);
      setIsDataReady(true);
    } catch (err: any) {
      setShowLoader(false);
      setError(err.message || "Something went wrong. Please try again.");
      toast.error(err.message || "Failed to generate your schedule");
    }
  };

  // ── Loader transition ─────────────────────────────────────────────────────

  if (showLoader) {
    return (
      <AnimatePresence mode="wait">
        <Loader
          key="loader"
          isDataReady={isDataReady}
          onComplete={() => router.push("/dashboard")}
        />
      </AnimatePresence>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress header */}
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-h2 font-medium">Step {step} of 5</h1>
        <div className="flex items-center gap-3">
          <div className="w-32 h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <span className="text-on-surface-variant text-small">{Math.round((step / 5) * 100)}%</span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-start gap-3 p-4 rounded-card border border-error/30 bg-error/5 text-error text-small">
          <AlertCircle size={16} className="shrink-0 mt-0.5" strokeWidth={1.5} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-error/60 hover:text-error">
            <RefreshCw size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="card p-6"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ── Step 1: College Tier ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-h1 mb-1">Where are you studying?</h2>
                  <p className="text-small text-on-surface-variant">This determines topic difficulty and priority.</p>
                </div>
                <FormSelect
                  label="College Tier"
                  placeholder="Select your tier"
                  options={[
                    { value: "Tier-1", label: "Tier-1 (IIT, NIT, BITS, etc.)" },
                    { value: "Tier-2", label: "Tier-2 (State engineering colleges)" },
                    { value: "Tier-3", label: "Tier-3 (Private / local colleges)" },
                  ]}
                  {...register("collegeTier")}
                  error={errors.collegeTier?.message}
                  required
                />
              </div>
            )}

            {/* ── Step 2: Branch & Year ── */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-h1">Your degree details</h2>
                <FormInput
                  label="Branch"
                  placeholder="e.g. Computer Science & Engineering"
                  {...register("branch")}
                  error={errors.branch?.message}
                  required
                />
                <FormSelect
                  label="Graduation Year"
                  placeholder="Select year"
                  options={[2024, 2025, 2026, 2027, 2028].map((y) => ({
                    value: y.toString(),
                    label: y.toString(),
                  }))}
                  {...register("gradYear")}
                  error={errors.gradYear?.message}
                  required
                />
              </div>
            )}

            {/* ── Step 3: Target Roles ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-h1 mb-1">Target Roles</h2>
                  <p className="text-small text-on-surface-variant">Select all that apply — your plan blends them.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((role) => {
                    const selected = watch("targetRoles").includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          const cur = watch("targetRoles");
                          setValue("targetRoles", selected ? cur.filter((r) => r !== role) : [...cur, role]);
                        }}
                        className={`card p-4 text-left flex justify-between items-center transition-all ${
                          selected ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <span className="text-body">{role}</span>
                        {selected && <Check size={16} className="text-primary shrink-0" strokeWidth={2} />}
                      </button>
                    );
                  })}
                </div>
                {errors.targetRoles && (
                  <p className="text-error text-small">{errors.targetRoles.message}</p>
                )}
              </div>
            )}

            {/* ── Step 4: Availability ── */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-h1">Weekly Availability</h2>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Weekday hrs/day"
                    type="number"
                    min={1}
                    max={8}
                    placeholder="1–8"
                    {...register("weekdayHrs")}
                    error={errors.weekdayHrs?.message}
                    required
                  />
                  <FormInput
                    label="Weekend hrs/day"
                    type="number"
                    min={1}
                    max={10}
                    placeholder="1–10"
                    {...register("weekendHrs")}
                    error={errors.weekendHrs?.message}
                    required
                  />
                </div>
                <div>
                  <label className="label">Preferred study windows</label>
                  <div className="flex flex-wrap gap-2">
                    {WINDOWS.map((win) => {
                      const selected = watch("preferredWindows").includes(win);
                      return (
                        <button
                          key={win}
                          type="button"
                          onClick={() => {
                            const cur = watch("preferredWindows");
                            setValue("preferredWindows", selected ? cur.filter((w) => w !== win) : [...cur, win]);
                          }}
                          className={`card px-4 py-2 text-small transition-all ${selected ? "border-primary bg-primary/5 text-primary" : ""}`}
                          aria-pressed={selected}
                        >
                          {win}
                        </button>
                      );
                    })}
                  </div>
                  {errors.preferredWindows && (
                    <p className="text-error text-small mt-1">{errors.preferredWindows.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 5: Skill Baseline ── */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-h1 mb-1">Current Skill Baseline</h2>
                  <p className="text-small text-on-surface-variant">Be honest — this calibrates your difficulty level.</p>
                </div>
                {(["dsa", "web", "aptitude"] as const).map((skill) => (
                  <div key={skill}>
                    <label className="label uppercase tracking-wider">{skill}</label>
                    <div className="flex gap-2">
                      {SKILLS.map((level) => {
                        const selected = watch(`skillLevels.${skill}`) === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setValue(`skillLevels.${skill}`, level)}
                            className={`card flex-1 py-3 text-center text-small transition-all ${
                              selected ? "border-primary bg-primary/5 text-primary font-medium" : ""
                            }`}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex justify-between items-center pt-4 border-t border-border">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="btn-ghost">
                  ← Back
                </button>
              ) : <div />}

              {step < 5 ? (
                <button type="button" onClick={nextStep} className="btn">
                  Continue →
                </button>
              ) : (
                <button type="submit" className="btn flex items-center gap-2">
                  Generate My Plan
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
