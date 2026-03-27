"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInquiriesAdmin, useProducts } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";

export default function AdminDashboardPage() {
  const locale = useLocale("zh");
  const { pagination: productPagination } = useProducts({ lang: locale, pageSize: 1 });
  const { pagination: inquiryPagination } = useInquiriesAdmin({ lang: locale, pageSize: 1 });
  const { pagination: highIntentPagination } = useInquiriesAdmin({
    lang: locale,
    pageSize: 1,
    tag: "HIGH",
  });

  const cards = [
    { label: locale === "zh" ? "产品数" : "Products", value: productPagination?.total || 0 },
    { label: locale === "zh" ? "线索数" : "Leads", value: inquiryPagination?.total || 0 },
    {
      label: locale === "zh" ? "高意向线索" : "High Intent Leads",
      value: highIntentPagination?.total || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="industrial-kicker">{locale === "zh" ? "后台概览" : "Admin Overview"}</p>
        <h1 className="mt-2 text-4xl font-bold uppercase tracking-tight">{locale === "zh" ? "仪表盘" : "Dashboard"}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label} className="admin-surface rounded-sm">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-[0.16em] text-slate-500">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
