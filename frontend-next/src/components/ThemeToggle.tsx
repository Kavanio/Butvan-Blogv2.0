"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { play } from "@/lib/sound";
import { useLang } from "@/lib/i18n";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (stored === "dark" || (!stored && prefersDark)) {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  }, []);

  const toggle = () => {
    play("toggle", { volume: 0.7 });
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? t("toLight") : t("toDark")}
      className="inline-flex size-7 items-center justify-center rounded-md text-gray-1000 transition-colors hover:bg-gray-200 hover:text-gray-1200"
    >
      {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
    </button>
  );
}
