"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  Users,
  Eye,
  Package,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Settings,
  FileText,
  SlidersHorizontal,
  ScrollText,
  Files,
  FilePlus2,
  FileStack,
} from "lucide-react";
import Image from "next/image";
import { AnnouncementCard } from "@/app/_components/AnnouncementCard";


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
      title: "Sales Documents",
      items: [
        {
          icon: <ScrollText className="h-5 w-5" />,
          label: "Create Quotation",
          href: "/create_quotation",
        },
        {
          icon: <Files className="h-5 w-5" />,
          label: "View Quotations",
          href: "/view_quotations",
        },
        {
          icon: <FilePlus2 className="h-5 w-5" />,
          label: "Create Proforma",
          href: "/create_proforma",
        },
        {
          icon: <FileStack className="h-5 w-5" />,
          label: "View Proformas",
          href: "/view_proformas",
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
        {
          icon: <SlidersHorizontal className="h-5 w-5" />,
          label: "Invoice Settings",
          href: "/invoice_settings",
        },
      ],
    },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-white text-gray-800 transition-all duration-300 z-40 ${
        isCollapsed ? "w-16" : "w-60"
      } shadow-[0_4px_24px_rgba(0,0,0,0.08)] border-r border-gray-100`}
    >
      {/* Header */}
      <div className={`flex items-center border-b border-gray-100 px-3 py-4 ${isCollapsed ? "flex-col gap-3" : "justify-between px-4"}`}>
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg flex-shrink-0">
            <Image src="/favicon.ico" alt="CredHill" width={32} height={32} className="rounded-lg" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-[15px] font-bold text-gray-900 leading-tight">CredHill</h1>
              <p className="small-text text-gray-500">Manage Invoices</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500 flex-shrink-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex flex-col justify-between h-[calc(100vh-64px)]">
      <div className="overflow-y-auto py-2 flex-1">
        {mainSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="py-2">
            {!isCollapsed && (
              <h3 className="px-4 py-1.5 small-text font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <nav className="space-y-0.5">
              {section.items.map((item, itemIdx) => (
                <Link
                  key={itemIdx}
                  href={item.href}
                  className={`flex items-center gap-3 py-2.5 mx-2 rounded-lg transition ${
                    isCollapsed ? "justify-center px-2" : "px-3"
                  } ${
                    isActive(item.href)
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  title={isCollapsed ? item.label : ""}
                >
                  <span className={`flex-shrink-0 ${isActive(item.href) ? "text-orange-500" : ""}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className={`label-text ${isActive(item.href) ? "font-semibold text-orange-600" : ""}`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Announcement card at the bottom */}
      <div className="pb-2">
        <AnnouncementCard
          collapsed={isCollapsed}
          title="Invoice Theme Customizer & Client Wise Dashboard Filter"
          description="Personalize your invoice colors and font size. Open any invoice preview and click the Theme button.
          Also, now you can filter you dashboard and invoices data client wise
          "
        />
      </div>

      </div>
    </div>
  );
}
