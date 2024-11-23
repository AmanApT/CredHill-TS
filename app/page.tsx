"use client"
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
  <div>
    <Header />
    <Hero />
  </div>
  );
}
