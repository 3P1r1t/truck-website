import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Truck Website",
  description: "Commercial truck showcase and inquiry platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
