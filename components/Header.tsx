import React from "react";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { LogInIcon } from "lucide-react";

const Header = () => {
  const { user } = useKindeBrowserClient();
  return (
    <header className="">
      <div className="mx-auto max-w-screen-xl px-4 py-2 sm:px-6 sm:py-2 lg:px-8">
        <div className="flex justify-between items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black sm:text-3xl">
              CredHill
            </h1>

            <p className="mt-1.5 text-sm text-gray-500"></p>
          </div>

          <div className="flex items-center gap-4">
            {!user ? (
              <div
                className="inline-flex items-center justify-center gap-2 rounded px-5 py-3 text-gray-900 transition hover:text-gray-700 focus:outline-none focus:ring"
                
              >
                <LoginLink postLoginRedirectURL="/dashboard">
                  <Button className="bg-orange-500 text-white">Sign In</Button>
                </LoginLink>
                <RegisterLink className="text-black">
                  <Button className="bg-orange-500 text-white">
                    <LogInIcon />
                    Register
                  </Button>
                </RegisterLink>
              </div>
            ) : (
              <Link href={"/dashboard"}>
                <Button className="bg-orange-500 text-white">
                  Go to dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
