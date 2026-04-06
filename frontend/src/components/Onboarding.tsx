"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const onboardingSchema = z.object({
  collegeTier: z.enum(["Tier-1", "Tier-2", "Tier-3"], { required_error: "College Tier is required" }),
  branch: z.string().min(1, "Branch is required"),
  gradYear: z.string().min(4, "Graduation Year is required"),
  targetRoles: z.array(z.string()).min(1, "Select at least one role"),
  weekdayHrs: z.number().min(1).max(8),
  weekendHrs: z.number().min(1).max(10),
  preferredWindows: z.array(z.string()).min(1, "Select at least one window"),
  skillLevels: z.object({
    dsa: z.enum(["Beginner", "Intermediate", "Advanced"]),
    web: z.enum(["Beginner", "Intermediate", "Advanced"]),
    aptitude: z.enum(["Beginner", "Intermediate", "Advanced"]),
  })
});

type OnboardingData = z.infer<typeof onboardingSchema>;

const ROLES = ["SDE", "Data Engineer", "Core", "Startup", "Quant", "Other"];
const WINDOWS = ["Morning", "Afternoon", "Evening", "Night"];
const SKILLS = ["Beginner", "Intermediate", "Advanced"] as const;

export default function Onboarding() {
  const [step, setStep] = useState(1);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      targetRoles: [],
      preferredWindows: [],
      skillLevels: { dsa: "Beginner", web: "Beginner", aptitude: "Beginner" }
    }
  });

  const onSubmit = (data: OnboardingData) => {
    console.log("Submitting Onboarding Data", data);
    // TODO: Phase 4 API integration
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  
  const variants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2 } }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-0 mt-12 pb-24">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-h2 font-medium">Step {step} of 5</h1>
        <div className="text-secondary text-small">{Math.round((step / 5) * 100)}% Completed</div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} variants={variants} initial="initial" animate="animate" exit="exit" className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-h1">Where are you studying?</h2>
                <div className="flex flex-col gap-2">
                  <label className="text-small text-secondary">College Tier</label>
                  <select {...register("collegeTier")} className="input bg-surface">
                    <option value="">Select Tier</option>
                    <option value="Tier-1">Tier-1</option>
                    <option value="Tier-2">Tier-2</option>
                    <option value="Tier-3">Tier-3</option>
                  </select>
                  {errors.collegeTier && <span className="text-error text-small">{errors.collegeTier.message}</span>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-h1">Degree details</h2>
                <div className="flex flex-col gap-2">
                  <label className="text-small text-secondary">Branch</label>
                  <input type="text" {...register("branch")} placeholder="e.g. Computer Science" className="input" />
                  {errors.branch && <span className="text-error text-small">{errors.branch.message}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-small text-secondary">Graduation Year</label>
                  <select {...register("gradYear")} className="input bg-surface">
                    <option value="">Select Year</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                  {errors.gradYear && <span className="text-error text-small">{errors.gradYear.message}</span>}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-h1">Target Roles</h2>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(role => {
                    const isSelected = watch("targetRoles").includes(role);
                    return (
                      <button
                        type="button"
                        key={role}
                        onClick={() => {
                          const current = watch("targetRoles");
                          setValue("targetRoles", isSelected ? current.filter(r => r !== role) : [...current, role]);
                        }}
                        className={`card p-4 text-left flex justify-between items-center transition-all ${isSelected ? 'border-accent bg-border/20' : ''}`}
                      >
                        <span className="text-body">{role}</span>
                        {isSelected && <Check className="text-accent" size={18} />}
                      </button>
                    )
                  })}
                </div>
                {errors.targetRoles && <span className="text-error text-small">{errors.targetRoles.message}</span>}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-h1">Weekly Availability</h2>
                <div className="flex gap-4">
                  <div className="flex flex-col gap-2 w-1/2">
                    <label className="text-small text-secondary">Weekday Hrs/Day</label>
                    <input type="number" {...register("weekdayHrs", { valueAsNumber: true })} className="input" />
                    {errors.weekdayHrs && <span className="text-error text-small">{errors.weekdayHrs.message}</span>}
                  </div>
                  <div className="flex flex-col gap-2 w-1/2">
                    <label className="text-small text-secondary">Weekend Hrs/Day</label>
                    <input type="number" {...register("weekendHrs", { valueAsNumber: true })} className="input" />
                    {errors.weekendHrs && <span className="text-error text-small">{errors.weekendHrs.message}</span>}
                  </div>
                </div>
                
                <div className="pt-2 flex flex-col gap-2">
                  <label className="text-small text-secondary">Preferred Windows</label>
                  <div className="flex flex-wrap gap-2">
                    {WINDOWS.map(win => {
                      const isSelected = watch("preferredWindows").includes(win);
                      return (
                        <button
                          type="button"
                          key={win}
                          onClick={() => {
                            const current = watch("preferredWindows");
                            setValue("preferredWindows", isSelected ? current.filter(w => w !== win) : [...current, win]);
                          }}
                          className={`card px-4 py-2 text-small transition-all ${isSelected ? 'border-accent bg-border/20 text-accent' : ''}`}
                        >
                          {win}
                        </button>
                      )
                    })}
                  </div>
                  {errors.preferredWindows && <span className="text-error text-small">{errors.preferredWindows.message}</span>}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-h1">Current Skill Baseline</h2>
                {["dsa", "web", "aptitude"].map((skill) => (
                  <div key={skill} className="flex flex-col gap-2">
                    <label className="text-small text-secondary uppercase tracking-wider">{skill}</label>
                    <div className="flex gap-2">
                      {SKILLS.map(level => {
                        const isSelected = watch(`skillLevels.${skill as 'dsa'|'web'|'aptitude'}`) === level;
                        return (
                          <button
                            type="button"
                            key={level}
                            onClick={() => setValue(`skillLevels.${skill as 'dsa'|'web'|'aptitude'}`, level)}
                            className={`card flex-1 py-3 text-center text-small transition-all ${isSelected ? 'border-accent bg-border/20 text-accent' : ''}`}
                          >
                            {level}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4 mt-6 border-t border-border">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="text-secondary hover:text-primary transition-colors text-body px-4 py-2">
                  Back
                </button>
              ) : <div></div>}
              
              {step < 5 ? (
                <button type="button" onClick={nextStep} className="btn">
                  Continue
                </button>
              ) : (
                <button type="submit" className="btn">
                  Generate Plan
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
