"use client";

import { useLocale } from "@/lib/use-locale";

export function AdminHeader() {
  const locale = useLocale();
  return (
    <header className="flex h-14 items-center border-b bg-background px-4 text-sm text-muted-foreground">
      {locale === "zh" ? "JWT 管理控制台" : "JWT Admin Console"}
    </header>
  );
}
