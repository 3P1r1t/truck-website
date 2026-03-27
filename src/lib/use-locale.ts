"use client";

import { useEffect, useState } from "react";
import { Locale, localeFromClient } from "@/lib/i18n";

export function useLocale(defaultLocale: Locale = "en"): Locale {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    // For admin pages we pass zh as default and keep zh when URL has no lang yet.
    if (defaultLocale === "zh") {
      const queryLang = new URL(window.location.href).searchParams.get("lang");
      if (!queryLang) {
        setLocale("zh");
        return;
      }
    }

    setLocale(localeFromClient(undefined, defaultLocale));
  }, [defaultLocale]);

  return locale;
}
