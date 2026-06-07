import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chrono — Personal Time Operating System",
  description: "Your personal time operating system. Plan, track, and optimize your productivity with Chrono.",
  icons: {
    icon: "/favicon.ico",
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
        {children}
      </body>
    </html>
  );
}
