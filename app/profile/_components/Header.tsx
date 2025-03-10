"use client"
import { Button } from "@/components/ui/button";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { LogOut } from "lucide-react";
import Link from "next/link";
// import { useRouter } from 'next/router';
import React from "react";

const Header = () => {
  return (
    <header className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4 py-2 sm:px-2 sm:py-4 lg:px-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Manage Profile
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center justify-center gap-1.5 rounded border border-gray-200 bg-white px-5 py-3 text-gray-900 transition hover:text-gray-700 focus:outline-none focus:ring"
              type="button"
            >
              <Link href="/dashboard">
                <span className="text-sm font-medium"> Dashboard </span>
              </Link>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
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
            </button>
            <LogoutLink postLogoutRedirectURL="/">
        <Button className=" text-white flex items-center gap-2">
          <LogOut size={18} /> 
          
         Logout
        </Button>
      </LogoutLink>
            {/* <LogoutLink postLogoutRedirectURL="/">Logout</LogoutLink> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
