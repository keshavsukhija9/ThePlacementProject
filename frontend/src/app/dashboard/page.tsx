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

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // MOCK DATA FOR TESTING
      const mockProfile = { college_tier: "Tier-1", is_pro: false };
      const mockSchedule = {
        schedule_id: "mock123",
        items: [
          { id: "1", day_index: 0, time_slot: "Morning", topic: "Arrays & Strings", difficulty: "easy", resource_url: "https://neetcode.io", status: "completed" },
          { id: "2", day_index: 0, time_slot: "Evening", topic: "Two Pointers", difficulty: "medium", resource_url: "https://neetcode.io", status: "pending" },
          { id: "3", day_index: 1, time_slot: "Morning", topic: "Sliding Window", difficulty: "medium", resource_url: "https://neetcode.io", status: "pending" }
        ]
      };

      if (!session) {
        setUser({ id: "mock_user", email: "guest@example.com" } as any);
        setProfile(mockProfile as any);
        setSchedule(mockSchedule as any);
        setStreak(1);
        setReadinessScore(45);
        setLoading(false);
        return;
      }

      setUser(session.user);

      try {
        const [profile, sched] = await Promise.all([
          getProfile(session.access_token),
          getCurrentSchedule(session.access_token),
        ]);

        if (!profile?.college_tier) {
          router.replace("/onboarding");
          return;
        }

        setProfile(profile);

        if (sched) {
          setSchedule(sched);
          const completed = sched.items.filter((i: any) => i.status === "completed").length;
          const total     = sched.items.length;
          const streakDays = new Set(
            sched.items
              .filter((i: any) => i.status === "completed")
              .map((i: any) => i.day_index)
          ).size;
          setStreak(streakDays);
          setReadiness(Math.min(Math.round((completed / Math.max(total, 1)) * 60) + 10 + Math.min(streakDays * 3, 30), 100));
        } else {
          router.replace("/onboarding");
          return;
        }
      } catch (err: any) {
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

  if (!schedule) return null;

  return <Dashboard />;
}
