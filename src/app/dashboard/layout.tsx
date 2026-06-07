'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { StoreProvider } from "@/lib/store";
import Sidebar, { MobileNav } from "@/components/Sidebar";
import CommandCenter from "@/components/CommandCenter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Basic onboarding check
    if (pathname !== '/dashboard/onboarding') {
      const onboarded = localStorage.getItem('chrono_onboarded_guest') || localStorage.getItem('chrono_onboarded_null');
      // In a real app we would check chrono_onboarded_${user.id} but for now we just check any
      let isOnboarded = false;
      for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i)?.startsWith('chrono_onboarded_')) isOnboarded = true;
      }
      if (!isOnboarded) {
        router.push('/dashboard/onboarding');
      }
    }
    setChecking(false);
  }, [pathname, router]);

  if (checking) return <div className="h-screen w-screen bg-chrono-bg" />;

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
