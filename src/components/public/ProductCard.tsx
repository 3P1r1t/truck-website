import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatPriceRange } from "@/lib/utils";
import { Locale } from "@/lib/i18n";

function withLang(path: string, locale: Locale) {
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const image = product.images.find((i) => i.isPrimary) || product.images[0];

  return (
    <Link href={withLang(`/products/${product.slug}`, locale)}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] bg-muted">
          {image ? (
            <Image src={image.url} alt={image.altText || product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No Image</div>
          )}
        </div>
        <CardContent className="space-y-2 p-4">
          <h3 className="line-clamp-1 text-lg font-semibold">{product.name}</h3>
          <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">{product.shortDescription || product.description}</p>
          <div className="text-lg font-bold text-primary">
            {formatPriceRange(product.basePrice, product.maxPrice, product.currency, locale === "zh" ? "zh-CN" : "en-US")}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
