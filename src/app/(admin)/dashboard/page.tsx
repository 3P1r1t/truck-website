"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useArticles, useInquiriesAdmin, useProducts } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";

export default function DashboardPage() {
  const locale = useLocale();
  const { products } = useProducts({ lang: locale, pageSize: 100 });
  const { articles } = useArticles({ lang: locale, pageSize: 100 });
  const { inquiries } = useInquiriesAdmin({ lang: locale, pageSize: 100 });

  const cards = [
    { label: locale === "zh" ? "产品数" : "Products", value: products.length },
    { label: locale === "zh" ? "文章数" : "Articles", value: articles.length },
    { label: locale === "zh" ? "询盘数" : "Inquiries", value: inquiries.length },
    {
      label: locale === "zh" ? "高意向询盘" : "High Intent",
      value: inquiries.filter((item) => item.tag === "HIGH").length,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{locale === "zh" ? "仪表盘" : "Dashboard"}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-sm">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

