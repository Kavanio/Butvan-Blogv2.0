"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // 防止弹窗开启时底层页面意外滚动
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 8 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative my-auto w-full max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-400 bg-gray-100 dark:bg-[#18181b] p-6 shadow-2xl ${className}`}
          >
            {title && (
              <div className="mb-4 pr-12 pb-3 border-b border-gray-300 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-1200">{title}</h3>
              </div>
            )}
            {children}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 rounded-full bg-gray-200 dark:bg-gray-800 px-2.5 py-1 font-mono text-micro text-gray-1000 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700 cursor-pointer"
            >
              Esc
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
