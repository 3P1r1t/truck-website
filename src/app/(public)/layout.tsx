import type { Metadata } from "next";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { WhatsAppFloat } from "@/components/public/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Tengyu Commercial Vehicles",
  description: "Commercial truck showcase and inquiry platform",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="relative">{children}</main>
      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
