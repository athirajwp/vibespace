"use client";

import React, { useState } from "react";
import { Search, Headphones, Bell, Heart, Sparkles, UserCheck } from "lucide-react";
import { UserProfile } from "@/types";
import { NavTab } from "./Sidebar";

interface HeaderProps {
  user: UserProfile;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenListenRoom: () => void;
  onOpenNotifications: () => void;
  onOpenAuthModal: () => void;
  unreadNotifications: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenListenRoom,
  onOpenNotifications,
  onOpenAuthModal,
  unreadNotifications,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 h-16 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-surface-border px-4 lg:px-8 flex items-center justify-between z-20">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs, moments, spaces, communities..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface/80 border border-surface-border text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Listen Room Button */}
        <button
          onClick={() => setActiveTab("listen")}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill text-xs font-semibold text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 transition-all shadow-sm shadow-cyan-500/10"
        >
          <Headphones className="w-3.5 h-3.5 text-cyan-400" />
          <span>Listen Together</span>
        </button>

        {/* Listen Together Trigger Button */}
        <button
          onClick={onOpenListenRoom}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all active:scale-95"
        >
          <Headphones className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">Listen Room</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>

        {/* Notifications Icon */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl glass-pill text-gray-300 hover:text-white hover:border-cyan-500/30 transition-all"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-[#0B0F19] animate-pulse" />
          )}
        </button>

        {/* User Profile Avatar / Auth */}
        <div
          onClick={() => setActiveTab("profile")}
          className="flex items-center gap-2.5 cursor-pointer pl-1 group"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-cyan-500/40 group-hover:border-cyan-400 transition-all shadow-md shadow-cyan-500/20"
          />
        </div>
      </div>
    </header>
  );
};
