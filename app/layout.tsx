import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SOLVIX",
  description: "Earn and invest like you should.",
  applicationName: "Solvix",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Solvix",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }
    ],
    apple: "/icon-192.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#07100d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
