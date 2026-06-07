'use client';

import { StoreProvider } from "@/lib/store";
import Sidebar, { MobileNav } from "@/components/Sidebar";
import CommandCenter from "@/components/CommandCenter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-chrono-bg">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
      <MobileNav />
      <CommandCenter />
    </StoreProvider>
  );
}
