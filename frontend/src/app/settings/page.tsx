"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Lock, User, LogOut, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { getProfile, subscribeTelegram, subscribeSMS } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { FormInput } from "@/components/ui/FormInput";

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const user = useStore((s) => s.user);
  const profile = useStore((s) => s.profile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Notification settings
  const [telegramChatId, setTelegramChatId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }

      try {
        const prof = await getProfile(session.access_token);
        if (prof?.telegram_chat_id) {
          setTelegramEnabled(true);
        }
        if (prof?.phone_number) {
          setSmsEnabled(true);
          setPhoneNumber(prof.phone_number);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleTelegramSubscribe = async () => {
    if (!telegramChatId.trim()) {
      toast.error("Please enter your Telegram chat ID");
      return;
    }

    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      await subscribeTelegram(session.access_token, telegramChatId);
      setTelegramEnabled(true);
      toast.success("Telegram reminders enabled!");
    } catch (err: any) {
      toast.error(err.message || "Failed to enable Telegram");
    } finally {
      setSaving(false);
    }
  };

  const handleSmsSubscribe = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      await subscribeSMS(session.access_token, phoneNumber);
      setSmsEnabled(true);
      toast.success("SMS reminders enabled!");
    } catch (err: any) {
      toast.error(err.message || "Failed to enable SMS");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-on-surface">Settings</h1>
          <button
            onClick={() => router.back()}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ← Back
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Account Section */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <User size={20} className="text-accent" />
              <h2 className="text-lg font-semibold text-on-surface">Account</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-on-surface-variant">Email</label>
                <p className="text-on-surface font-medium">{user?.email}</p>
              </div>

              <div>
                <label className="text-sm text-on-surface-variant">College Tier</label>
                <p className="text-on-surface font-medium">{profile?.college_tier || "—"}</p>
              </div>

              <div>
                <label className="text-sm text-on-surface-variant">Branch</label>
                <p className="text-on-surface font-medium">{profile?.branch || "—"}</p>
              </div>

              <div>
                <label className="text-sm text-on-surface-variant">Graduation Year</label>
                <p className="text-on-surface font-medium">{profile?.grad_year || "—"}</p>
              </div>
            </div>
          </motion.section>

          {/* Notifications Section */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell size={20} className="text-accent" />
              <h2 className="text-lg font-semibold text-on-surface">Notifications</h2>
            </div>

            <div className="space-y-6">
              {/* Telegram */}
              <div className="border-b border-border pb-6 last:border-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-on-surface">Telegram Reminders</h3>
                    <p className="text-sm text-on-surface-variant">
                      Daily study reminders via Telegram
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    {telegramEnabled ? (
                      <span className="text-success">✓ Enabled</span>
                    ) : (
                      <span className="text-on-surface-variant">Disabled</span>
                    )}
                  </div>
                </div>

                {!telegramEnabled && (
                  <div className="space-y-3">
                    <FormInput
                      label="Telegram Chat ID"
                      placeholder="Enter your Telegram chat ID"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      hint="Get your chat ID from @userinfobot on Telegram"
                    />
                    <button
                      onClick={handleTelegramSubscribe}
                      disabled={saving}
                      className="btn w-full"
                    >
                      {saving ? <Loader2 className="animate-spin" size={16} /> : "Enable Telegram"}
                    </button>
                  </div>
                )}
              </div>

              {/* SMS */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-on-surface">SMS Reminders</h3>
                    <p className="text-sm text-on-surface-variant">
                      Daily study reminders via SMS
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    {smsEnabled ? (
                      <span className="text-success">✓ Enabled</span>
                    ) : (
                      <span className="text-on-surface-variant">Disabled</span>
                    )}
                  </div>
                </div>

                {!smsEnabled && (
                  <div className="space-y-3">
                    <FormInput
                      label="Phone Number"
                      type="tel"
                      placeholder="+919876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      hint="Include country code (e.g., +91 for India)"
                    />
                    <button
                      onClick={handleSmsSubscribe}
                      disabled={saving}
                      className="btn w-full"
                    >
                      {saving ? <Loader2 className="animate-spin" size={16} /> : "Enable SMS"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Security Section */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock size={20} className="text-accent" />
              <h2 className="text-lg font-semibold text-on-surface">Security</h2>
            </div>

            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-md border border-border hover:border-primary transition-colors">
                <p className="font-medium text-on-surface">Change Password</p>
                <p className="text-sm text-on-surface-variant">Update your password</p>
              </button>

              <button className="w-full text-left px-4 py-3 rounded-md border border-border hover:border-primary transition-colors">
                <p className="font-medium text-on-surface">Two-Factor Authentication</p>
                <p className="text-sm text-on-surface-variant">Add extra security to your account</p>
              </button>
            </div>
          </motion.section>

          {/* Danger Zone */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6 border-error/20 bg-error/5"
          >
            <div className="flex items-center gap-3 mb-6">
              <Trash2 size={20} className="text-error" />
              <h2 className="text-lg font-semibold text-error">Danger Zone</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 rounded-md border border-error/30 text-error hover:bg-error/10 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>

              <button className="w-full px-4 py-3 rounded-md border border-error/30 text-error hover:bg-error/10 transition-colors font-medium flex items-center justify-center gap-2">
                <Trash2 size={16} />
                Delete Account
              </button>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
