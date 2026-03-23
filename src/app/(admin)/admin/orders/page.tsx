"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminOrdersPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/inquiries");
  }, [router]);
  return null;
}
