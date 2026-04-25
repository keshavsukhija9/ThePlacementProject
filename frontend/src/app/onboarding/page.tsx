"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { getProfile } from "@/lib/api";
import Onboarding from "@/components/Onboarding";

export default function OnboardingPage() {
  const router     = useRouter();
  const setUser    = useStore((s) => s.setUser);
  const setProfile = useStore((s) => s.setProfile);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        // router.replace("/auth");
        return;
      }
      setUser(session.user);

      // If profile already fully onboarded, skip to dashboard
      try {
        const profile = await getProfile(session.access_token);
        if (profile?.college_tier) {
          setProfile(profile);
          router.replace("/dashboard");
        }
      } catch {
        // No profile yet — show onboarding
      }
    });
  }, []);

  return (
    <main className="min-h-screen flex items-start justify-center pt-16 px-4 pb-24 bg-background">
      <Onboarding />
    </main>
  );
}
