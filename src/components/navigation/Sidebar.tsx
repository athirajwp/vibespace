"use client";

import React from "react";
import {
  Home,
  MessageSquare,
  Headphones,
  Radio,
  User,
  Settings,
  PlusCircle,
} from "lucide-react";

export type NavTab =
  | "home"
  | "messages"
  | "listen"
  | "live"
  | "profile"
  | "settings";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  unreadMessagesCount: number;
  unreadNotificationsCount?: number;
  isListeningActive?: boolean;
  onOpenCreateModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadMessagesCount,
  isListeningActive,
  onOpenCreateModal,
}) => {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      badge: unreadMessagesCount,
    },
    {
      id: "listen",
      label: "Listen Together",
      icon: Headphones,
      highlight: true,
      badgeText: isListeningActive ? "LIVE" : undefined,
    },
    { id: "live", label: "Live Voice", icon: Radio },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-surface-border bg-[#0B0F19]/90 backdrop-blur-xl px-4 py-6 z-30 select-none">
      {/* Brand Logo */}
      <div className="flex items-center justify-between px-3 mb-8">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab("home")}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <Headphones className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              Vibe<span className="gradient-text-cyan">Space</span>
            </span>
            <span className="block text-[10px] uppercase font-semibold tracking-widest text-gray-400">
              Listen Together
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={onOpenCreateModal}
        className="w-full mb-6 py-3 px-4 rounded-xl gradient-btn-primary flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all"
      >
        <PlusCircle className="w-5 h-5" />
        <span>Create Post & Vibe</span>
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as NavTab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? item.highlight
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/10"
                    : "bg-surface-hover text-white border border-surface-border font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-surface/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? item.highlight
                        ? "text-cyan-400 animate-pulse"
                        : "text-cyan-400"
                      : "text-gray-400 group-hover:text-white"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5">
                {item.badgeText && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-black animate-pulse">
                    {item.badgeText}
                  </span>
                )}
                {item.badge && item.badge > 0 ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-500/90 text-white shadow-sm shadow-pink-500/50">
                    {item.badge}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Synchronized Mini Indicator Footnote */}
      <div className="mt-auto pt-4 border-t border-surface-border">
        <div
          onClick={() => setActiveTab("listen")}
          className="glass-card rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-cyan-500/40 transition-colors"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center border border-white/10">
              <Headphones className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0B0F19] animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0B0F19]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Listen Together</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span>🟢 Synced Engine</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
