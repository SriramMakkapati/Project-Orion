"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiMessageSquare, FiFileText, FiDatabase, FiSun, FiMoon, FiDroplet, FiChevronLeft, FiChevronRight, FiPlus, FiTrash2 } from "react-icons/fi";
import { useThemeStore } from "@/store/themeStore";
import { useChatStore } from "@/store/chatStore";
import { useState } from "react";

const navItems = [
  { href: "/documents", label: "Documents", icon: FiFileText },
  { href: "/sources", label: "Sources", icon: FiDatabase },
];

const themes = [
  { id: "dark", icon: FiMoon, label: "Dark" },
  { id: "light", icon: FiSun, label: "Light" },
  { id: "midnight", icon: FiDroplet, label: "Night" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const { history, currentChatId, newChat, loadChat, deleteChat } = useChatStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleNewChat = () => {
    newChat();
    if (pathname !== "/") router.push("/");
  };

  const handleLoadChat = (chatId) => {
    loadChat(chatId);
    if (pathname !== "/") router.push("/");
  };

  return (
    <aside
      className="flex flex-col border-r transition-all duration-200 relative group/sidebar"
      style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border-primary)', width: collapsed ? '64px' : '240px' }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 z-10 w-6 h-6 rounded-full border flex items-center justify-center opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}
      >
        {collapsed ? <FiChevronRight size={12} /> : <FiChevronLeft size={12} />}
      </button>

      {/* Logo + New Chat */}
      <div className="h-14 flex items-center justify-between px-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-xl flex-shrink-0" role="img" aria-label="crystal ball">🔮</span>
          {!collapsed && <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>Orion</span>}
        </div>
        {!collapsed && (
          <button
            onClick={handleNewChat}
            className="p-1.5 rounded-lg transition-colors duration-150 hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            title="New chat"
          >
            <FiPlus size={16} />
          </button>
        )}
      </div>

      {/* Chat History */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {history.length === 0 ? (
            <p className="text-[11px] px-2 py-4 text-center" style={{ color: 'var(--text-muted)' }}>No conversations yet</p>
          ) : (
            history.map((chat) => (
              <div
                key={chat.id}
                className="group/item flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors duration-100"
                style={{
                  background: chat.id === currentChatId ? 'var(--bg-surface)' : 'transparent',
                  color: chat.id === currentChatId ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
                onClick={() => handleLoadChat(chat.id)}
              >
                <FiMessageSquare size={13} className="flex-shrink-0 opacity-50" />
                <span className="flex-1 text-xs truncate">{chat.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                  className="opacity-0 group-hover/item:opacity-100 p-0.5 rounded transition-opacity duration-100 hover:text-red-400"
                >
                  <FiTrash2 size={11} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Collapsed: just show new chat icon */}
      {collapsed && (
        <div className="flex-1 p-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center p-2 rounded-lg transition-colors duration-150"
            style={{ color: 'var(--text-muted)' }}
            title="New chat"
          >
            <FiPlus size={16} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-2 space-y-0.5 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${isActive ? "font-medium" : ""}`}
              style={{
                background: isActive ? 'var(--bg-surface)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={15} className="flex-shrink-0" />
              {!collapsed && <span className="text-xs">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Theme Switcher */}
      <div className="px-2 pb-3">
        {collapsed ? (
          <div className="flex flex-col gap-1">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className="flex items-center justify-center p-2 rounded-lg transition-colors duration-150"
                  style={{
                    background: isActive ? 'var(--bg-surface)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                  title={t.label}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex gap-0.5 p-1 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ${isActive ? "shadow-sm" : ""}`}
                  style={{
                    background: isActive ? 'var(--bg-elevated)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  <Icon size={11} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
