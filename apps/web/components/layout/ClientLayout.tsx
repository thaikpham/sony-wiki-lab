"use client";

import TopNavigation from "./TopNavigation";
import LenisSmoothScroll from "@/components/scroll/LenisSmoothScroll";
import ScrollTop from "@/components/scroll/ScrollTop";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <div className="min-h-screen">
        <TopNavigation />

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      <ScrollTop />
      <LenisSmoothScroll />
    </>
  );
}
