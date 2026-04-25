"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Loader({
  isDataReady,
  onComplete,
}: {
  isDataReady: boolean;
  onComplete: () => void;
}) {
  const [text, setText] = useState("");
  const fullText = "Mapping your placement week...";
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    let i = 0;
    // PRD spec: 120ms/char typewriter
    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 120);

    // Minimum display time: 1.2s (PRD §7)
    const minTimer = setTimeout(() => setMinTimeElapsed(true), 1200);

    return () => {
      clearInterval(interval);
      clearTimeout(minTimer);
    };
  }, []);

  useEffect(() => {
    if (minTimeElapsed && isDataReady) {
      onComplete();
    }
  }, [minTimeElapsed, isDataReady, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-20 gap-8"
    >
      {/* Logo fade-in — PRD §7: 0.4s ease-out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-primary font-medium text-[26px] tracking-tight"
      >
        ThePlacementProject.
      </motion.div>

      <div className="flex flex-col items-center gap-4">
        {/* Typewriter text */}
        <div className="text-on-surface-variant font-mono text-small h-5">
          {text}
          <span className="animate-pulse opacity-70">|</span>
        </div>

        {/* Line draw — PRD §7: 0–120px, 0.5s ease-in-out */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 0.5, ease: "easeInOut", delay: 0.3 }}
          className="h-px bg-primary"
        />
      </div>
    </motion.div>
  );
}
