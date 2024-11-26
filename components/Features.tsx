
import { Group } from "lucide-react";
import React from "react";

const Features = () => {
  return (
    <div>
      <section className="  ">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              What do we offer ?
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <a
              className="block rounded-xl border border-gray-200 p-8 shadow-xl transition hover:border-orange-500/10 hover:shadow-orange-500/10"
              href="#"
            >
              <Group className="text-orange-600" size={30} />

              <h2 className="mt-4 text-xl font-bold ">Invoice Generation</h2>

              <p className="mt-1 text-sm text-gray-800">
               Create beautifully stunning invoices with buttery smooth comfort
              </p>
            </a>
            <a
              className="block rounded-xl border border-gray-200 p-8 shadow-xl transition hover:border-orange-500/10 hover:shadow-orange-500/10"
              href="#"
            >
              <Group className="text-orange-600" size={30} />

              <h2 className="mt-4 text-xl font-bold ">Item Master</h2>

              <p className="mt-1 text-sm text-gray-800">
               Maintain your inventory using Item Master
              </p>
            </a>
            <a
              className="block rounded-xl border border-gray-200 p-8 shadow-xl transition hover:border-orange-500/10 hover:shadow-orange-500/10"
              href="#"
            >
              <Group className="text-orange-600" size={30} />

              <h2 className="mt-4 text-xl font-bold ">Analytics</h2>

              <p className="mt-1 text-sm text-gray-800">
                Invoice and Client Analysis helps you track your business progress
              </p>
            </a>
            <a
              className="block rounded-xl border border-gray-200 p-8 shadow-xl transition hover:border-orange-500/10 hover:shadow-orange-500/10"
              href="#"
            >
              <Group className="text-orange-600" size={30} />

              <h2 className="mt-4 text-xl font-bold ">Client Management</h2>

              <p className="mt-1 text-sm text-gray-800">
                Client Management made easier and simple
              </p>
            </a>
            <a
              className="block rounded-xl border border-gray-200 p-8 shadow-xl transition hover:border-orange-500/10 hover:shadow-orange-500/10"
              href="#"
            >
              <Group className="text-orange-600" size={30} />

              <h2 className="mt-4 text-xl font-bold ">Profile Management</h2>

              <p className="mt-1 text-sm text-gray-800">
                Update your profile information in one go
              </p>
            </a>
            <a
              className="block rounded-xl border border-gray-200 p-8 shadow-xl transition hover:border-orange-500/10 hover:shadow-orange-500/10"
              href="#"
            >
              <Group className="text-orange-600" size={30} />

              <h2 className="mt-4 text-xl font-bold ">Reliability</h2>

              <p className="mt-1 text-sm text-gray-800">
                Zero bug and free to use reliable service offered by CredHill
              </p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
