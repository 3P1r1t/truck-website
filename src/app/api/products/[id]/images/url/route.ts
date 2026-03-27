export const dynamic = "force-dynamic";

import { fail } from "@/lib/utils";

export async function POST() {
  return fail("Image URL upload has been disabled. Please use local file upload.", 410);
}
