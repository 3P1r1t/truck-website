"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Locale, localeFromClient } from "@/lib/i18n";

export function useLocale(defaultLocale: Locale = "en"): Locale {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<Locale>(() => localeFromClient(undefined, defaultLocale));

  useEffect(() => {
    const queryLang = searchParams.get("lang");

    // Keep zh as default for admin pages when lang is missing.
    if (defaultLocale === "zh" && !queryLang) {
      setLocale((prev) => (prev === "zh" ? prev : "zh"));
      return;
    }

    const nextLocale = localeFromClient(queryLang, defaultLocale);
    setLocale((prev) => (prev === nextLocale ? prev : nextLocale));
  }, [defaultLocale, pathname, searchParams]);

  return locale;
}
