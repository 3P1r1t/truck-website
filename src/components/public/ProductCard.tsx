import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPriceRange } from "@/lib/utils";
import { Locale, withLangPath } from "@/lib/i18n";

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const image = product.images.find((i) => i.isPrimary) || product.images[0];

  return (
    <Link href={withLangPath(`/products/${product.slug}`, locale)} className="group block h-full">
      <article className="industrial-panel h-full overflow-hidden transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_28px_40px_-26px_rgba(15,23,42,0.7)]">
        <div className="relative aspect-[4/3] bg-slate-200">
          {image ? (
            <Image src={image.url} alt={image.altText || product.name} fill className="object-cover transition duration-700 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No Image</div>
          )}
          <div className="absolute left-4 top-4 bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            {product.category?.name || "Commercial"}
          </div>
        </div>
        <div className="space-y-3 p-6">
          <h3 className="line-clamp-2 text-2xl font-semibold uppercase tracking-tight">{product.name}</h3>
          <p className="line-clamp-2 min-h-[3rem] text-sm leading-6 text-slate-500">{product.shortDescription || product.description}</p>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{locale === "zh" ? "起售价" : "Starting at"}</p>
              <p className="text-xl font-semibold text-slate-900">
                {formatPriceRange(product.basePrice, product.maxPrice, product.currency, locale === "zh" ? "zh-CN" : "en-US")}
              </p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white transition-colors group-hover:bg-primary">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
