"use client";
import React, { useEffect, useState } from "react";

import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

import EditClient from "./EditClient";
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
  // const clients = [
  //   {
  //     invoiceNo: 1,
  //     clientName: "Cipla",
  //     invoiceDate: "1234",
  //     totalAmount: 5000,
  //   },
  //   {
  //     invoiceNo: 2,
  //     clientName: "Cipla",
  //     invoiceDate: "1234",
  //     totalAmount: 5000,
  //   },
  //   {
  //     invoiceNo: 3,
  //     clientName: "Cipla",
  //     invoiceDate: "1234",
  //     totalAmount: 5000,
  //   },
  // ];
  return (
    <section className="">
      <div className="overflow-x-auto flex  flex-wrap gap-10 w-full p-8">
        {clients?.map(
          (
            eachClient: {
              clientName: string;
              email: string;
              contact: string;
              gst: string;
              pan: string;
              add: string;
              city: string;
              pincode: string;
              clientOf?: string;
            },
            id: React.Key | null | undefined
          ) => {
            return (
              <section
                key={id}
                className="w-[45%] h-72 text-sm flex rounded-lg shadow bg-slate-600 transition hover:shadow-lg "
              >
                <div className="w-1/2 flex rounded-lg justify-center  bg-slate-600 text-white items-center text-[72px]">
                  {eachClient?.clientName.charAt(0)}
                </div>
                <div className="w-full flex flex-col justify-center  relative rounded-lg rounded-l-none bg-white p-4">
                  <p className="text-xl font-bold text-gray-600">
                    {eachClient?.clientName}
                  </p>
                  {eachClient?.clientName && (
                    <p className=" ">{eachClient?.email}</p>
                  )}
                  {eachClient?.contact && <hr className="border-[1px] my-2" />}

                  {eachClient?.contact && (
                    <p>Contact : {eachClient?.contact}</p>
                  )}

                  {eachClient?.gst && (
                    <p>
                      GSTIN :{" "}
                      <span className="text-blue-500 "> {eachClient?.gst}</span>
                    </p>
                  )}

                  {eachClient?.pan && (
                    <p>
                      PAN :{" "}
                      <span className="text-blue-500 "> {eachClient?.pan}</span>
                    </p>
                  )}
                  {eachClient?.add && <hr className="border-[1px] my-2" />}

                  {eachClient?.add && <p>Address: {eachClient?.add}</p>}
                  {eachClient?.city && (
                    <p>
                      City:{" "}
                      <span className="text-blue-500 ">
                        {" "}
                        {eachClient?.city}
                      </span>
                    </p>
                  )}
                  {eachClient?.pincode && (
                    <p>
                      PIN:{" "}
                      <span className="text-blue-500 ">
                        {" "}
                        {eachClient?.pincode}
                      </span>
                    </p>
                  )}
                  {/* <Button className="bg-green-700 mb-2 absolute bottom-0 right-0 mx-4">
                  Edit Details
                </Button> */}
                  <EditClient clientDetails={eachClient} />
                </div>
              </section>
            );
          }
        )}
      </div>
    </section>
  );
};

export default Clients;
