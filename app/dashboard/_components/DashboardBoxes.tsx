import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardData {
  title: string;
  desc: string;
  cta: string;
  ctaColor: string;
  href: string;
  image: unknown; // Adjust to Image type if using TS or explicitly type imported images.
}

interface DashboardBoxesProps {
  data: DashboardData;
}

const DashboardBoxes: React.FC<DashboardBoxesProps> = ({ data }) => {
  return (
    <div className="flex gap-8 w-[49%] h-56 items-center bg-white rounded-md p-6">
      <Image
        className="w-48"
        src={data.image}
        width={192}
        height={192}
        alt={data.title}
      />
      <div className="flex flex-col gap-3 mt-4">
        <p className="font-semibold">{data.title}</p>
        <p>{data.desc}</p>
        {data?.ctaColor === "green" ? (
          <Link href={data?.href}>
            <Button className={`bg-green-500 w-36`}>{data.cta}</Button>
          </Link>
        ) : (
          <Link href={data?.href}>
            <Button className={`bg-orange-500 w-36`}>{data.cta}</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default DashboardBoxes;
