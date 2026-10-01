"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/useSound";

interface SpringModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SpringModal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: SpringModalProps) {
  const { playWhisper } = useSound();

  const handleClose = () => {
    playWhisper();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative overflow-hidden rounded-2xl border border-gray-400 bg-gray-100 p-6 shadow-2xl ${className}`}
          >
            {title && (
              <div className="mb-4 pr-12 pb-3 border-b border-gray-300 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-1200">{title}</h3>
              </div>
            )}
            {children}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 rounded-full bg-gray-200 px-2.5 py-1 font-mono text-micro text-gray-1000 transition-colors hover:bg-gray-300 cursor-pointer"
            >
              Esc
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
