"use client";
import React, { useEffect, useState } from "react";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

import EditClient from "./EditClient";
import moment from "moment";

type Client = {
  _id?: string;
  clientName: string;
  add: string;
  clientOf: string;
  email: string;
  city: string;
  pincode: string;
  contact: string;
  gst: string;
  pan: string;
  _creationTime: string;
};

const Clients = () => {
  const convex = useConvex();
  const { user } = useKindeBrowserClient();

  const [clients, setClients] = useState<Client[]>([]);
  const getAllClients = async () => {
    const result = await convex.query(api.functions.clients.getClients, {
      email: user?.email ?? "",
    });
    console.log(result);
    setClients(result);
  };

  useEffect(() => {
    if (user?.email !== undefined) {
      getAllClients();
    }
  }, [user]);

  return (
    <section className="bg-slate-50">
      <div className="overflow-x-auto flex justify-center flex-wrap gap-10 w-full p-8">
        {clients?.map((eachClient, id) => (
          <div
            key={id}
            className="relative w-full md:w-[48%] border-gray-200 p-8 shadow-xl transition hover:border-orange-500/10 hover:shadow-orange-500/10 bg-white rounded-lg border sm:p-6 lg:p-8"
          >
            <span className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-orange-300 via-orange-500 to-purple-600"></span>

            <div className="sm:flex sm:justify-between sm:gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                  {eachClient?.clientName}
                </h3>
                <p className="mt-1 text-xs font-medium text-gray-600">
                  {eachClient?.email}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-pretty text-sm text-gray-500">
                {eachClient?.add} {eachClient?.city} {eachClient?.pincode}
              </p>
              <div className="text-pretty text-sm text-gray-500 mt-3">
                {eachClient?.gst && (
                  <div>
                    <span className="font-bold">GST: </span>
                    <span>{eachClient?.gst}</span>
                  </div>
                )}
                {eachClient?.pan && (
                  <div>
                    <span className="font-bold">PAN: </span>
                    <span>{eachClient?.pan}</span>
                  </div>
                )}
                {eachClient?.contact && (
                  <div>
                    <span className="font-bold">Contact: </span>
                    <span>{eachClient?.contact}</span>
                  </div>
                )}
              </div>
            </div>

            <dl className="mt-6 flex justify-between sm:gap-6">
              <div className="flex flex-col-reverse">
                <dt className="text-sm font-medium text-gray-600">
                  Created At
                </dt>
                <dd className="text-xs text-gray-500">
                  {moment(eachClient?._creationTime).format("DD MMM, YYYY")}
                </dd>
              </div>

              <EditClient clientDetails={eachClient} />
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Clients;
