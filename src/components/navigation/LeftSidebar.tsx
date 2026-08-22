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
import { UserProfile } from "@/types";
import { NavTab } from "./Sidebar";

interface LeftSidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  unreadMessagesCount: number;
  unreadNotificationsCount?: number;
  currentUser: UserProfile;
  onOpenCreatePost: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadMessagesCount,
  currentUser,
  onOpenCreatePost,
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
    },
    { id: "live", label: "Live Voice", icon: Radio },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[250px] h-[calc(100vh-4rem)] sticky top-16 border-r border-[#E4E6EB] bg-[#F0F2F5] px-3 py-4 z-30 select-none transition-colors">
      {/* Primary Action Button */}
      <button
        onClick={onOpenCreatePost}
        className="w-full mb-4 py-2.5 px-4 rounded-xl btn-primary text-white flex items-center justify-center gap-2 text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
      >
        <PlusCircle className="w-4 h-4 stroke-[2.5] text-white" />
        <span className="text-white">Create Post & Vibe</span>
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as NavTab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "nav-active"
                  : "text-[#65676B] hover:text-[#050505] hover:bg-[#E4E6EB]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4.5 h-4.5 ${
                    isActive ? "text-[#1877F2]" : "text-[#65676B]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && item.badge > 0 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1877F2] text-white shadow-xs">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Bottom User Footer */}
      <div className="mt-auto pt-3 border-t border-[#E4E6EB] flex items-center justify-between px-2">
        <div
          onClick={() => setActiveTab("profile")}
          className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border border-[#1877F2]/40"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#050505] truncate">{currentUser.name}</p>
            <p className="text-[10px] text-[#65676B] truncate">@{currentUser.username}</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("settings")}
          className="p-2 rounded-lg text-[#65676B] hover:text-[#050505] hover:bg-[#E4E6EB]"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
