"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";
import LenisSmoothScroll from "@/components/scroll/LenisSmoothScroll";
import ScrollTop from "@/components/scroll/ScrollTop";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-[var(--spacing-sidebar)] min-h-screen flex flex-col">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>

      <ScrollTop />
      <LenisSmoothScroll />
    </>
  );
}
