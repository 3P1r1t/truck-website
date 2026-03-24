"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const sorted = useMemo(
    () => [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder),
    [images]
  );
  const [index, setIndex] = useState(0);

  if (sorted.length === 0) {
    return <div className="industrial-panel flex aspect-[4/3] items-center justify-center text-muted-foreground">No image</div>;
  }

  const current = sorted[index];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-slate-200 bg-muted">
        <Image src={current.url} alt={current.altText || "image"} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        {sorted.length > 1 ? (
          <>
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-2 top-1/2 -translate-y-1/2"
              onClick={() => setIndex((v) => (v - 1 + sorted.length) % sorted.length)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setIndex((v) => (v + 1) % sorted.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        ) : null}
      </div>
      {sorted.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {sorted.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setIndex(i)}
              className={`relative aspect-square overflow-hidden rounded-sm border ${i === index ? "ring-2 ring-primary" : ""}`}
            >
              <Image src={item.url} alt={item.altText || "thumb"} fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
