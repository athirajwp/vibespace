"use client";

import React from "react";
import { Bell, Headphones, X } from "lucide-react";
import { useNotifications } from "@/lib/realtime-store";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenListenRoom: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onOpenListenRoom,
}) => {
  const { notifications, markRead } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 lg:right-12 w-96 max-w-[90vw] vibe-card bg-white rounded-3xl p-5 border border-[#E4E6EB] shadow-2xl z-50 animate-fadeIn space-y-4">
      <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3">
        <h3 className="font-bold text-sm text-[#050505] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#1877F2]" />
          <span>Notifications</span>
        </h3>
        <button onClick={onClose} className="p-1 rounded-full text-[#65676B] hover:text-[#050505] hover:bg-[#F0F2F5]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`p-3 rounded-2xl vibe-card flex items-start gap-3 cursor-pointer transition-all ${
              !n.read ? "border-[#1877F2]/40 bg-[#1877F2]/10" : "border-[#E4E6EB] bg-white"
            }`}
          >
            <img
              src={n.actor.avatar}
              alt={n.actor.name}
              className="w-9 h-9 rounded-full object-cover border border-[#1877F2]"
            />
            <div className="flex-1 min-w-0 text-xs">
              <p className="text-[#050505]">
                <span className="font-bold text-[#050505]">{n.actor.name}</span> {n.text}
              </p>
              <span className="text-[10px] text-[#65676B] mt-0.5 block">{n.time}</span>

              {n.type === "listen-invite" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenListenRoom();
                    onClose();
                  }}
                  className="mt-2 py-1.5 px-3 rounded-lg btn-primary text-white font-bold text-[10px] flex items-center gap-1 shadow-md shadow-blue-500/20"
                >
                  <Headphones className="w-3 h-3 text-white" />
                  <span className="text-white">Join Session</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
