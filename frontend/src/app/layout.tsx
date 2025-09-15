import "./globals.css";

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import Providers from "./providers";

export const metadata: Metadata = {
  title: "Plunderly",
  description:
    "Puzzle Pirates Tools: Greedy Counter, Shoppe Recipes & Labor Manager, and more.",
  keywords: [
    "plunderly",
    "plunderly ypp",
    "plunderly tools",
    "ypp bashing counter",
    "ypp tools",
    "first mate",
    "ypp first mate",
    "ypp pillage tracker",
    "ypp pillage battle tracker",
    "ypp greedy counter",
    "ypp greedy counter plus",
    "ypp shoppe recipes",
    "ypp labor management",
    "ypp labor manager",
  ],
  icons: {
    icon: [
      { url: "/images/favicons/favicon.ico" }, // fallback
      { url: "/images/favicons/favicon.svg", type: "image/svg+xml" },
      {
        url: "/images/favicons/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
    apple: "/images/favicons/apple-touch-icon.png",
    shortcut: "/images/favicons/favicon.ico",
  },
  manifest: "/images/favicons/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/favicons/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/images/favicons/favicon.svg"
        />
        <link
          rel="apple-touch-icon"
          href="/images/favicons/apple-touch-icon.png"
        />
        <link rel="manifest" href="/images/favicons/site.webmanifest" />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
