import { NextRequest } from "next/server";

export type Locale = "en" | "zh";

export const LOCALES: Locale[] = ["en", "zh"];

export function normalizeLocale(value: string | null | undefined): Locale {
  const raw = (value || "").toLowerCase();
  if (raw.startsWith("zh")) {
    return "zh";
  }
  return "en";
}

export function localeFromRequest(request: NextRequest): Locale {
  const fromQuery = request.nextUrl.searchParams.get("lang");
  if (fromQuery) {
    return normalizeLocale(fromQuery);
  }

  const cookieLocale = request.cookies.get("site_lang")?.value;
  if (cookieLocale) {
    return normalizeLocale(cookieLocale);
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    return normalizeLocale(acceptLanguage.split(",")[0]);
  }

  return "en";
}

export function localeFromClient(input?: string | null, fallbackLocale: Locale = "en"): Locale {
  if (input) {
    return normalizeLocale(input);
  }

  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    const fromQuery = url.searchParams.get("lang");
    if (fromQuery) {
      return normalizeLocale(fromQuery);
    }

    const fromCookie = document.cookie
      .split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith("site_lang="))
      ?.split("=")[1];

    if (fromCookie) {
      return normalizeLocale(fromCookie);
    }

    return fallbackLocale;
  }

  return fallbackLocale;
}

export function pickLocalized(enValue: string | null | undefined, zhValue: string | null | undefined, locale: Locale) {
  if (locale === "zh") {
    return zhValue?.trim() || enValue?.trim() || "";
  }
  return enValue?.trim() || zhValue?.trim() || "";
}

export function getSettingValueByLocale(
  map: Record<string, string>,
  baseKey: string,
  locale: Locale,
  fallback = ""
) {
  const localizedKey = `${baseKey}_${locale}`;
  const fallbackKey = `${baseKey}_${locale === "zh" ? "en" : "zh"}`;
  return map[localizedKey] || map[fallbackKey] || map[baseKey] || fallback;
}

export function withLangPath(pathname: string, locale: Locale) {
  const hasQuery = pathname.includes("?");
  return `${pathname}${hasQuery ? "&" : "?"}lang=${locale}`;
}

