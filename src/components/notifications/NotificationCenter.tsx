"use client";

import React, { useState } from "react";
import { Bell, Headphones, X, UserCheck, UserX, Check } from "lucide-react";
import { useNotifications } from "@/lib/realtime-store";
import { acceptFriendRequest, declineFriendRequest } from "@/lib/friends";
import { CURRENT_USER } from "@/lib/mock-data";
import { UserProfile } from "@/types";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenListenRoom: () => void;
  currentUser?: UserProfile;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onOpenListenRoom,
  currentUser,
}) => {
  const { notifications, markRead } = useNotifications();
  const user = currentUser || CURRENT_USER;
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAcceptRequest = (e: React.MouseEvent, notifId: string, actor: UserProfile) => {
    e.stopPropagation();
    acceptFriendRequest(user, actor);
    markRead(notifId);
    setToast(`Accepted ${actor.name}'s friend request! 🎉`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeclineRequest = (e: React.MouseEvent, notifId: string, actorId: string) => {
    e.stopPropagation();
    declineFriendRequest(user.id, actorId);
    markRead(notifId);
    setToast("Friend request declined");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="fixed top-16 right-4 lg:right-12 w-96 max-w-[90vw] vibe-card bg-white rounded-3xl p-5 border border-[#E4E6EB] shadow-2xl z-50 animate-fadeIn space-y-4 select-none">
      {toast && (
        <div className="bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-md animate-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3">
        <h3 className="font-bold text-sm text-[#050505] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#1877F2]" />
          <span>Notifications</span>
        </h3>
        <button onClick={onClose} className="p-1 rounded-full text-[#65676B] hover:text-[#050505] hover:bg-[#F0F2F5]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <p className="text-xs text-[#65676B] font-medium text-center py-6">
            No new notifications yet.
          </p>
        ) : (
          notifications.map((n) => (
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
                className="w-9 h-9 rounded-full object-cover border border-[#1877F2] shrink-0"
              />
              <div className="flex-1 min-w-0 text-xs">
                <p className="text-[#050505]">
                  <span className="font-bold text-[#050505]">{n.actor.name}</span> {n.text}
                </p>
                <span className="text-[10px] text-[#65676B] mt-0.5 block">{n.time}</span>

                {/* Friend Request Action Buttons */}
                {n.type === "friend-request" && (
                  <div className="flex items-center gap-2 mt-2.5">
                    <button
                      onClick={(e) => handleAcceptRequest(e, n.id, n.actor)}
                      className="py-1.5 px-3 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-white" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={(e) => handleDeclineRequest(e, n.id, n.actor.id)}
                      className="py-1.5 px-3 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}

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
          ))
        )}
      </div>
    </div>
  );
};
