"use client";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";
import React from "react";
import { Sun, CloudSun, Sunset, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function getGreeting(): { text: string; Icon: LucideIcon; color: string } {
  // IST = UTC + 5:30
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset - now.getTimezoneOffset() * 60 * 1000);
  const hour = istTime.getUTCHours();

  if (hour >= 5 && hour < 12) return { text: "Good Morning", Icon: Sun, color: "text-amber-400" };
  if (hour >= 12 && hour < 17) return { text: "Good Afternoon", Icon: CloudSun, color: "text-orange-400" };
  if (hour >= 17 && hour < 21) return { text: "Good Evening", Icon: Sunset, color: "text-rose-400" };
  return { text: "Good Night", Icon: Moon, color: "text-indigo-400" };
}

const Header = () => {
  const { user } = useKindeBrowserClient();
  const { text, Icon, color } = getGreeting();

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="page-title text-gray-900 flex items-center gap-2">
          <Icon className={`h-6 w-6 ${color}`} />
          {text}, {user?.given_name}!
        </h1>

        <div className="flex items-center gap-3">
          <Link href="/create_invoice">
            <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-gray-700 transition hover:bg-gray-50 focus:outline-none">
              <span className="label-text">Create Invoice</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </Link>
          <Link href="/profile">
            <div className="inline-block rounded-lg bg-orange-500 px-4 py-1.5 label-text text-white transition hover:bg-slate-700 focus:outline-none">
              Profile
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
