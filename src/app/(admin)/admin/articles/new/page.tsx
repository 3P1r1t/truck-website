"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewArticlePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/articles");
  }, [router]);
  return null;
}
