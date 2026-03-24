"use client";

import { Menu } from "lucide-react";
import { useLocale } from "@/lib/use-locale";

export function AdminHeader() {
  const locale = useLocale();
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 text-xs uppercase tracking-[0.18em] text-slate-500">
      <span>{locale === "zh" ? "腾宇后台" : "Tengyu Admin"}</span>
      <span className="inline-flex items-center gap-2 rounded-sm bg-slate-100 px-2 py-1 text-[10px]">
        <Menu className="h-3.5 w-3.5" />
        /admin/*
      </span>
    </header>
  );
}
