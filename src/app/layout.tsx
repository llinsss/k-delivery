import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "K-Deliver — Kaduna's Open Delivery Network", template: "%s · K-Deliver" },
  description: "Book and track trusted local deliveries across Kaduna.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
