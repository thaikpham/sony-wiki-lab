"use client";

import dynamic from "next/dynamic";
import TopNavigation from "./TopNavigation";
import ScrollTop from "@/components/scroll/ScrollTop";

const LenisSmoothScroll = dynamic(
  () => import("@/components/scroll/LenisSmoothScroll"),
  { ssr: false }
);

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <div className="min-h-screen">
        <TopNavigation />

        <main className="px-4 py-4 lg:px-6 lg:py-6 xl:px-8 2xl:px-10">
          {children}
        </main>
      </div>

      <ScrollTop />
      <LenisSmoothScroll />
    </>
  );
}
