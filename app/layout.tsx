import type { Metadata } from "next";
import "./globals.css";
import PwaManager from "@/components/PwaManager";

export const metadata: Metadata = {
  title: "Chrono — Personal Time Operating System",
  description: "Your personal time operating system. Plan, track, and optimize your productivity with Chrono.",
  manifest: "/manifest.json",
  icons: {
    icon: "/branding/favicon.ico",
    shortcut: "/branding/favicon.ico",
    apple: "/branding/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-chrono-bg text-chrono-text">
        <PwaManager />
        {children}
      </body>
    </html>
  );
}
