"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "fr";

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof TRANSLATIONS) => string;
}

const STORAGE_KEY = "chloemaillot.lang";

export const TRANSLATIONS = {
  roleBadge: {
    en: "Design Engineer at",
    fr: "Design Engineer chez",
  },
  bioSeg1: {
    en: "I'm a design engineer who ships what she designs",
    fr: "Je suis design engineer et je livre ce que je dessine",
  },
  bioSeg2: {
    en: "Design systems, AI tools, & products people use every day in production.",
    fr: "Des design systems, des outils d'IA & des produits utilisés tous les jours en production.",
  },
  bioSeg2b: {
    en: "I ",
    fr: "J'",
  },
  bioWriteLink: {
    en: "write",
    fr: "écris",
  },
  bioSeg3: {
    en: " about this way of working, and I ",
    fr: " sur cette façon de travailler, et je ",
  },
  bioToolsLink: {
    en: "build tools",
    fr: "construis des outils",
  },
  bioSeg4: {
    en: " to make it real.",
    fr: " pour la rendre concrète.",
  },
  findMePrefix: {
    en: "Find me on",
    fr: "Retrouve-moi sur",
  },
  findMeAnd: {
    en: "and",
    fr: "et",
  },
  findMeMid: {
    en: ", or write to me at",
    fr: ", ou écris-moi à",
  },
  sectionWriting: {
    en: "Notes",
    fr: "Notes",
  },
  sectionComponents: {
    en: "Components",
    fr: "Composants",
  },
  sectionExperience: {
    en: "Experience",
    fr: "Expérience",
  },
  caseInProgress: {
    en: "Case in progress",
    fr: "En cours d'écriture",
  },
  toLight: {
    en: "Switch to light",
    fr: "Passer en clair",
  },
  toDark: {
    en: "Switch to dark",
    fr: "Passer en sombre",
  },
  langToggleAria: {
    en: "Switch to French",
    fr: "Passer en anglais",
  },
  photoCardDesc: {
    en: "Interactive framed photo card with specular sheen, spring zoom & lightbox",
    fr: "Carte photo encadrée interactive avec reflet spéculaire, zoom ressort et lightbox",
  }
};

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => TRANSLATIONS[key]?.en || "",
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang;
      if (saved === "fr" || saved === "en") {
        setLangState(saved);
      }
    } catch {}
  }, []);

  const setLang = (nextLang: Lang) => {
    setLangState(nextLang);
    try {
      localStorage.setItem(STORAGE_KEY, nextLang);
      document.documentElement.lang = nextLang;
    } catch {}
  };

  const t = (key: keyof typeof TRANSLATIONS): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) return "";
    return entry[lang] || entry.en;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLang() {
  return useContext(I18nContext);
}
