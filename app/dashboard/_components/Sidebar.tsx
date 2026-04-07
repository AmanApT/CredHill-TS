"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  FileText,
  Users,
  Eye,
  Package,
  Home,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  HelpCircle,
  MessageSquare,
} from "lucide-react";


interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  const { setIsCollapsed: setContextCollapsed } = useSidebar();

  // Sync local state with context
  useEffect(() => {
    setContextCollapsed(isCollapsed);
  }, [isCollapsed, setContextCollapsed]);

  const mainSections: SidebarSection[] = [
    {
      title: "Main",
      items: [
        {
          icon: <LayoutDashboard className="h-5 w-5" />,
          label: "Dashboard",
          href: "/dashboard",
        },
        {
          icon: <FileText className="h-5 w-5" />,
          label: "Create Invoice",
          href: "/create_invoice",
        },
        {
          icon: <Users className="h-5 w-5" />,
          label: "Manage Clients",
          href: "/clients",
        },
        {
          icon: <Eye className="h-5 w-5" />,
          label: "View Invoices",
          href: "/view_invoices",
        },
        {
          icon: <Package className="h-5 w-5" />,
          label: "Item Master",
          href: "/item_master",
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          icon: <Settings className="h-5 w-5" />,
          label: "Profile",
          href: "/profile",
        },
      ],
    },
    // {
    //   title: "Help",
    //   items: [
    //     {
    //       icon: <MessageSquare className="h-5 w-5" />,
    //       label: "Support",
    //       href: "#",
    //     },
    //   ],
    // },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-white text-gray-800 transition-all duration-300 z-40 ${
        isCollapsed ? "w-20" : "w-64"
      } shadow-[0_10px_30px_rgba(249,115,22,0.1)]`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}>
          <div className="bg-orange-50 rounded-lg p-2">
            <FileText className="h-6 w-6 text-orange-500" />

          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">CredHill</h1>
              <p className="text-xs text-gray-500">Manage Invoices</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-200 rounded transition hidden md:block text-gray-600"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="overflow-y-auto h-[calc(100vh-100px)]">
        {mainSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="py-4">
            {!isCollapsed && (
              <h3 className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <nav className="space-y-1">
              {section.items.map((item, itemIdx) => (
                <Link
                  key={itemIdx}
                  href={item.href}
                  className={`flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition ${
                    isActive(item.href)
                      ? "bg-orange-100 text-orange-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title={isCollapsed ? item.label : ""}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {false && (
      // {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-orange-50 border-t border-orange-200 text-xs text-gray-600">
          <p className="text-center">
            {/* 💡 */}
             <span className="block mt-1 text-orange-600 font-semibold">Made with  </span>
          </p>
        </div>
      )}
    </div>
  );
}
