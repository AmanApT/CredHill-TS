// 'use client'
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";
// import { useRouter } from 'next/router';
import React from "react";

const Header = () => {
  const { user } = useKindeBrowserClient();

  return (
    <header className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4 py-2 sm:px-2 sm:py-4 lg:px-8">
        <div className="flex md:flex-row flex-col  gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Hi {user?.given_name}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/create_invoice">
              <div className="inline-flex items-center justify-center gap-1.5 rounded border border-gray-200 bg-white px-5 py-3 text-gray-900 transition hover:text-gray-700 focus:outline-none focus:ring">
                <span className="text-sm font-medium"> Create Invoice </span>

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
              </div>
            </Link>
            <Link href="/profile">
              <div className="inline-block rounded bg-orange-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring">
                Profile
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
