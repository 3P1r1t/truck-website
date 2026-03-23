import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  code: 0;
  message: string;
  data: T;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ApiFailure = {
  code: number;
  message: string;
  data: null;
  errors?: unknown;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 20)));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip };
}

export function ok<T>(
  data: T,
  options?: {
    message?: string;
    status?: number;
    pagination?: { page: number; pageSize: number; total: number };
  }
) {
  const payload: ApiSuccess<T> = {
    code: 0,
    message: options?.message || "ok",
    data,
  };

  if (options?.pagination) {
    payload.pagination = {
      ...options.pagination,
      totalPages: Math.max(1, Math.ceil(options.pagination.total / options.pagination.pageSize)),
    };
  }

  return NextResponse.json(payload, { status: options?.status || 200 });
}

export function fail(message: string, status = 400, errors?: unknown) {
  const payload: ApiFailure = {
    code: status,
    message,
    data: null,
    ...(errors ? { errors } : {}),
  };
  return NextResponse.json(payload, { status });
}

export function formatDate(date: string | Date, locale = "en-US") {
  const resolved = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(
    resolved
  );
}

export function formatPrice(value: number | string, currency = "USD", locale = "en-US") {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPriceRange(
  minValue: number | string,
  maxValue: number | string,
  currency = "USD",
  locale = "en-US"
) {
  const min = typeof minValue === "string" ? Number(minValue) : minValue;
  const max = typeof maxValue === "string" ? Number(maxValue) : maxValue;
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : safeMin;
  const resolvedMax = safeMax >= safeMin ? safeMax : safeMin;
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const code = (currency || "USD").toUpperCase();
  return `${formatter.format(safeMin)}${code}-${formatter.format(resolvedMax)}${code}`;
}

export function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number(value);
  }
  return Number(value || 0);
}
