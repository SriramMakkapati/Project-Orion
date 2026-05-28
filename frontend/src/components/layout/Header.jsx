"use client";

import { usePathname } from "next/navigation";

const pageTitles = {
  "/": "Research",
  "/documents": "Knowledge Base",
  "/sources": "Sources",
};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Research";

  return (
    <header className="h-14 border-b flex items-center px-6 sticky top-0 z-10 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border-primary)' }}>
      <h2 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>{title}</h2>
    </header>
  );
}
