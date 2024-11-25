"use client";
import { api } from "@/convex/_generated/api";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useConvex } from "convex/react";
import React, { useEffect, useState } from "react";
import EditItem from "./EditItem";
import DeleteItem from "./DeleteItem";
// import DeleteItem from "./DeleteItem";

const ItemCards = () => {
  const convex = useConvex();
  const { user } = useKindeBrowserClient();

  const [items, setItems] = useState([]);
  const getAllItems = async () => {
    const result = await convex.query(api.functions.items.getItems, {
      email: user?.email,
    });
    console.log(result);
    setItems(result);
  };

  // const handleDelete = (id) => {};
  useEffect(() => {
    if (user?.email !== undefined) {
      getAllItems();
    }
  }, [user]);
  return (
    <div className="p-8">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead className="text-left">
            <tr>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                Name
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                HSN/SAC{" "}
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                Actions{" "}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {items?.map((eachItem, id) => {
              return (
                <tr key={id}>
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 font-semibold">
                    {eachItem?.itemName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {eachItem?.hsn}
                  </td>

                  <td className="whitespace-nowrap px-4 py-2 flex gap-4">
                    <EditItem itemDetails={eachItem} />

                    <DeleteItem itemId={eachItem?._id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemCards;
