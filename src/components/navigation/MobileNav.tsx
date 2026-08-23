"use client";

import React from "react";
import {
  Home,
  MessageSquare,
  Headphones,
  Radio,
  User,
} from "lucide-react";
import { NavTab } from "./Sidebar";
import { UserProfile } from "@/types";

interface MobileNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  unreadMessagesCount: number;
  currentUser?: UserProfile;
  onOpenCreateModal?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  unreadMessagesCount,
  currentUser,
}) => {
  const items = [
    {
      id: "home",
      label: "Home",
      icon: Home,
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      badge: unreadMessagesCount,
    },
    {
      id: "listen",
      label: "Listen",
      icon: Headphones,
    },
    {
      id: "live",
      label: "Live Voice",
      icon: Radio,
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-t border-[#E4E6EB] flex items-center justify-around px-4 z-40 select-none shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as NavTab)}
            className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-2xl relative transition-all active:scale-90 ${
              isActive
                ? "bg-[#1877F2]/10 text-[#1877F2]"
                : "text-[#65676B] hover:text-[#050505]"
            }`}
            title={item.label}
          >
            <div className="relative flex items-center justify-center">
              {item.id === "profile" && currentUser ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className={`w-6 h-6 rounded-full object-cover border transition-all ${
                    isActive
                      ? "border-[#1877F2] ring-2 ring-[#1877F2]/40"
                      : "border-[#65676B]/40"
                  }`}
                />
              ) : (
                <Icon
                  className={`w-6 h-6 stroke-[2] ${
                    isActive ? "text-[#1877F2]" : "text-[#65676B]"
                  }`}
                />
              )}

              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#1877F2] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {item.badge}
                </span>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
};
