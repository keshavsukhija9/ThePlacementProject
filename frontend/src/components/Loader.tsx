"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Loader({ isDataReady, onComplete }: { isDataReady: boolean, onComplete: () => void }) {
  const [text, setText] = useState("");
  const fullText = "Mapping your placement week...";
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
      }
    }, 35); 

    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1200);

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="font-medium text-h1 text-accent"
      >
        ThePlacementProject.
      </motion.div>
      <div className="flex flex-col items-center gap-4">
        <div className="text-secondary font-mono text-small h-4">
          {text}<span className="animate-pulse">|</span>
        </div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
          className="h-[1px] bg-accent"
        />
      </div>
    </motion.div>
  );
}
