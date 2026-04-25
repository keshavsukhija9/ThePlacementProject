"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { useStore } from "@/lib/store";

const ICONS = {
  success: <CheckCircle size={16} className="text-success shrink-0" strokeWidth={1.5} />,
  error:   <XCircle    size={16} className="text-error shrink-0"   strokeWidth={1.5} />,
  info:    <Info       size={16} className="text-primary shrink-0" strokeWidth={1.5} />,
};

const BG = {
  success: "border-success/30 bg-surface-container-high",
  error:   "border-error/30 bg-surface-container-high",
  info:    "border-primary/30 bg-surface-container-high",
};

export function useToast() {
  const addToast = useStore((s) => s.addToast);
  return {
    success: (msg: string) => addToast(msg, "success"),
    error:   (msg: string) => addToast(msg, "error"),
    info:    (msg: string) => addToast(msg, "info"),
  };
}

export default function ToastContainer() {
  const toasts       = useStore((s) => s.toasts);
  const removeToast  = useStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 8,  scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3
                        rounded-card border text-body min-w-[280px] max-w-[400px]
                        shadow-lg ${BG[toast.type]}`}
          >
            {ICONS[toast.type]}
            <span className="flex-1 text-on-surface text-small leading-snug">
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-on-surface-variant hover:text-on-surface transition-colors ml-1"
              aria-label="Dismiss"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
