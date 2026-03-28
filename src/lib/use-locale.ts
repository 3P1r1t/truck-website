"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Locale, localeFromClient } from "@/lib/i18n";

export function useLocale(defaultLocale: Locale = "en"): Locale {
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return defaultLocale;
    }
    return localeFromClient(undefined, defaultLocale);
  });

  useEffect(() => {
    const queryLang =
      typeof window === "undefined" ? null : new URL(window.location.href).searchParams.get("lang");

    // Keep zh as default for admin pages when lang is missing.
    if (defaultLocale === "zh" && !queryLang) {
      setLocale((prev) => (prev === "zh" ? prev : "zh"));
      return;
    }

    const nextLocale = localeFromClient(queryLang, defaultLocale);
    setLocale((prev) => (prev === nextLocale ? prev : nextLocale));
  }, [defaultLocale, pathname]);

  return locale;
}
