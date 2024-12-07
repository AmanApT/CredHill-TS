import { LoginLink } from "@kinde-oss/kinde-auth-nextjs";
import React from "react";

const Hero = () => {
  return (
    <section className="mt-20 sm:mt-0">
      <div className="mx-auto max-w-screen-xl px-4  lg:flex lg:h-[70vh] lg:items-center">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Smart Solutions for Your Business Needs
            <strong className="font-extrabold text-orange-500 sm:block ">
              {" "}
              Invoice Simplified{" "}
            </strong>
          </h1>

          <p className="mt-4 sm:text-xl/relaxed">
            From polished invoices to inventory control, manage everything at
            your fingertips!
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <LoginLink postLoginRedirectURL="/dashboard">
              <p
                className="block w-full rounded bg-orange-500 px-12 py-3 text-sm font-medium text-white shadow hover:bg-orange-600 focus:outline-none focus:ring active:bg-orange-500 sm:w-auto"
                
              >
                Get Started
              </p>
            </LoginLink>

            <a
              className="block  rounded px-12 py-3 text-sm font-medium text-orange-600 shadow hover:text-orange-700 focus:outline-none focus:ring active:text-red-500 sm:w-auto"
              href="#"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
