"use client";

import { Sidebar } from "./Sidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 transition-all duration-300 md:ml-64 lg:ml-64">
        <div className="w-full">{children}</div>
      </main>

      {/* Mobile Margin Adjustment */}
      <style>{`
        @media (max-width: 768px) {
          main {
            margin-left: 5rem;
          }
        }
      `}</style>
    </div>
  );
}
