import React from "react";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";

const Header = () => {
  const {user} = useKindeBrowserClient();
  return (
    <header className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4 py-2 sm:px-6 sm:py-2 lg:px-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              CredHill
            </h1>

            <p className="mt-1.5 text-sm text-gray-500"></p>
          </div>

          <div className="flex items-center gap-4">
            {
              !user? 
              <button
              className="inline-flex items-center justify-center gap-1.5 rounded border border-gray-200 bg-white px-5 py-3 text-gray-900 transition hover:text-gray-700 focus:outline-none focus:ring"
              type="button"
            >
              
             
              <LoginLink postLoginRedirectURL="/dashboard">Sign in</LoginLink>
             
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
            </button>: <Link href={"/dashboard"}>Go to dashboard</Link>
            }
          

            <RegisterLink className="text-black">Sign up</RegisterLink>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;