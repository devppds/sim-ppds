"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import SplashScreen from "@/components/SplashScreen";
import ForceChangePasswordModal from "@/components/ForceChangePasswordModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [useSplashDelay, setUseSplashDelay] = useState(false);

  useEffect(() => {
    // Only apply the 15s delay if this is the first time the app is loaded in this session
    const hasSeenSplash = sessionStorage.getItem("splash_seen");
    if (!hasSeenSplash) {
      setUseSplashDelay(true);
    }
  }, []);

  return (
    <>
      <ForceChangePasswordModal />
      <SplashScreen />
      <div className={`${useSplashDelay ? "main-content-fade-in" : ""} main-content flex h-full w-full bg-slate-50 text-slate-800`}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          <Topbar onMenuToggle={() => setSidebarOpen((v) => !v)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
