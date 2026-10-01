"use client";

import React from "react";
import { useLang } from "@/lib/i18n";
import { play } from "@/lib/sound";

export function LangToggle() {
  const { lang, setLang, t } = useLang();

  const toggle = () => {
    play("tick", { volume: 0.6 });
    setLang(lang === "en" ? "fr" : "en");
  };

  return (
    <button
      onClick={toggle}
      aria-label={t("langToggleAria")}
      className="inline-flex h-7 items-center justify-center rounded-md px-1.5 font-mono text-micro uppercase text-gray-1000 transition-colors hover:bg-gray-200 hover:text-gray-1200"
    >
      {lang === "en" ? "FR" : "EN"}
    </button>
  );
}
