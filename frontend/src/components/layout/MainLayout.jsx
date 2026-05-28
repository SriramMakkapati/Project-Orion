"use client";

import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { useThemeStore } from "@/store/themeStore";
import { useChatStore } from "@/store/chatStore";

export default function MainLayout({ children }) {
  const { initTheme } = useThemeStore();
  const hydrate = useChatStore((s) => s.hydrate);

  useEffect(() => {
    initTheme();
    hydrate();
  }, [initTheme, hydrate]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        {children}
      </main>
    </div>
  );
}
