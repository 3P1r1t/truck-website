"use client";

import { useEffect, useState } from "react";
import { Locale, localeFromClient } from "@/lib/i18n";

export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(localeFromClient());
  }, []);

  return locale;
}
