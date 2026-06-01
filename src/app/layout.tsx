import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chronos",
  description: "Pay only for the seconds your agents run. USDC-native, on-chain, autonomous.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
