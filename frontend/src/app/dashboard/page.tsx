"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { getCurrentSchedule, getProfile } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Dashboard from "@/components/Dashboard";
import Loader from "@/components/Loader";

export default function DashboardPage() {
  const router           = useRouter();
  const toast            = useToast();
  const setUser          = useStore((s) => s.setUser);
  const setProfile       = useStore((s) => s.setProfile);
  const setSchedule      = useStore((s) => s.setSchedule);
  const setStreak        = useStore((s) => s.setStreak);
  const setReadiness     = useStore((s) => s.setReadinessScore);
  const schedule         = useStore((s) => s.schedule);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.replace("/auth");
          return;
        }

        setUser(session.user);

        // Fetch profile and schedule in parallel
        const [profile, sched] = await Promise.all([
          getProfile(session.access_token),
          getCurrentSchedule(session.access_token),
        ]);

        // Redirect to onboarding if profile incomplete
        if (!profile?.college_tier) {
          router.replace("/onboarding");
          return;
        }

        setProfile(profile);

        // Redirect to onboarding if no schedule
        if (!sched) {
          router.replace("/onboarding");
          return;
        }

        setSchedule(sched);

        // Calculate streak and readiness
        const completed = sched.items.filter((i: any) => i.status === "completed").length;
        const total     = sched.items.length;
        const streakDays = new Set(
          sched.items
            .filter((i: any) => i.status === "completed")
            .map((i: any) => i.day_index)
        ).size;
        
        setStreak(streakDays);
        
        // Readiness formula: 60% completion + 30% streak + 10% base
        const completionScore = (completed / Math.max(total, 1)) * 60;
        const streakScore = Math.min(streakDays * 3, 30);
        const readinessScore = Math.min(Math.round(completionScore + streakScore + 10), 100);
        setReadiness(readinessScore);

      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError(err.message || "Failed to load dashboard");
        toast.error(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader isDataReady={false} onComplete={() => {}} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-text-primary mb-4">Error Loading Dashboard</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-accent text-white rounded-md hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!schedule) return null;

  return <Dashboard />;
}
