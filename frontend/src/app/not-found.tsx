"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="card p-10 max-w-sm w-full text-center flex flex-col items-center gap-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
        >
          <AlertCircle size={56} className="text-warn" strokeWidth={1.5} />
        </motion.div>

        <div>
          <p className="text-h2 font-medium mb-2">404</p>
          <p className="text-h1 font-medium mb-2">Page not found</p>
          <p className="text-small text-on-surface-variant leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => router.push("/dashboard")}
            className="btn w-full flex items-center justify-center gap-2"
          >
            <Home size={16} />
            Go to Dashboard
          </button>
          <button
            onClick={() => router.back()}
            className="btn-ghost w-full"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
