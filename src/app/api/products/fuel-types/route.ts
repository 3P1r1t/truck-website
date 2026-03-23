export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/utils";

export async function GET() {
  try {
    const rows = await prisma.product.findMany({
      where: {
        fuelType: {
          not: null,
        },
        isActive: true,
      },
      select: {
        fuelType: true,
      },
    });

    const set = new Set<string>();
    rows.forEach((row) => {
      const value = row.fuelType?.trim();
      if (value) {
        set.add(value);
      }
    });

    return ok(Array.from(set).sort());
  } catch (error) {
    console.error("GET /api/products/fuel-types failed", error);
    return fail("Failed to fetch fuel types", 500);
  }
}


