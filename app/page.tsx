"use client"
import Faq from "@/components/Faq";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect } from "react";


export default function Home() {
  const {user} = useKindeBrowserClient();
  console.log(user)
  useEffect(()=>{
    console.log("User Details : ", user)
      },[user])
  return (
  <div className="absolute inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
    <Header />
    <Hero />
    <Features />
    <Faq />
    <Footer />
  </div>
  );
}
