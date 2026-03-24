"use client";

import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";
import { ContactMethodCard } from "@/components/public/ContactMethodCard";

export function InquiryForm({ productId, productName }: { productId: string; productName?: string }) {
  const locale = useLocale();

  return (
    <div className="industrial-panel p-5">
      <ContactMethodCard
        title={t(locale, "inquiry_title")}
        sourceType="PRODUCT"
        defaultProductId={productId}
        defaultProductName={productName}
      />
    </div>
  );
}
