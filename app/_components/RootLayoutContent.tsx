"use client";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/app/dashboard/_components/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";

interface RootLayoutContentProps {
  children: React.ReactNode;
}

export function RootLayoutContent({ children }: RootLayoutContentProps) {
  const { user } = useKindeBrowserClient();
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  // Only show sidebar on authenticated pages (not landing page)
  const isAuthenticated = !!user;
  const isLandingPage = pathname === "/";
  const shouldShowSidebar = isAuthenticated && !isLandingPage;

  // Adjust margin based on sidebar state (matches Sidebar w-16 collapsed / w-60 expanded)
  const marginClass = shouldShowSidebar
    ? isCollapsed
      ? "ml-16"
      : "ml-60"
    : "";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Only show on authenticated pages (not landing page) */}
      {shouldShowSidebar && <Sidebar />}

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 overflow-x-hidden ${marginClass}`}>
        <div className="w-full max-w-full">{children}</div>
      </main>
    </div>
  );
}
