import { NextRequest } from "next/server";
import { Locale, localeFromRequest } from "@/lib/i18n";

export function getLocale(request: NextRequest): Locale {
  return localeFromRequest(request);
}

export function boolParam(searchParams: URLSearchParams, key: string, defaultValue = false) {
  const value = searchParams.get(key);
  if (value === null) {
    return defaultValue;
  }
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}
