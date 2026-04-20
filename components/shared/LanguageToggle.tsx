"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      title={lang === "en" ? "Switch to Tamil" : "Switch to English"}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors
        ${lang === "ta"
          ? "bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
          : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"}
        ${className}`}
    >
      <span className={lang === "en" ? "font-bold" : "opacity-60"}>EN</span>
      <span className="text-gray-400">|</span>
      <span className={lang === "ta" ? "font-bold" : "opacity-60"}>தமிழ்</span>
    </button>
  );
}
