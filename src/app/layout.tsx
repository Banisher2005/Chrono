import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Sidebar, { MobileNav } from "@/components/Sidebar";

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
      <body className="antialiased">
        <StoreProvider>
          <div className="flex h-screen w-screen overflow-hidden bg-chrono-bg">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </div>
          <MobileNav />
        </StoreProvider>
      </body>
    </html>
  );
}
