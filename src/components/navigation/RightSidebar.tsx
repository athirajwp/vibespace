"use client";

import React from "react";
import { Headphones, Radio, Flame, Users, ChevronRight } from "lucide-react";
import { UserProfile } from "@/types";
import { MOCK_USERS, MOCK_TRACKS, MOCK_SPACES } from "@/lib/mock-data";

interface RightSidebarProps {
  onJoinListeningRoom: () => void;
  onOpenSpace: (spaceId: string) => void;
  onOpenProfile: (user: UserProfile) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  onJoinListeningRoom,
  onOpenSpace,
  onOpenProfile,
}) => {
  const onlineFriends = MOCK_USERS.filter(
    (u) => u.onlineStatus === "online" || u.onlineStatus === "listening"
  );

  return (
    <aside className="hidden xl:block w-[310px] h-[calc(100vh-4rem)] sticky top-16 border-l border-[#E4E6EB] bg-[#F0F2F5] p-4 z-20 space-y-5 overflow-y-auto select-none transition-colors">
      {/* NOW LISTENING CARD WITH FACEBOOK BLUE ACCENTS */}
      <div className="vibe-card p-4 border border-[#1877F2]/30 relative overflow-hidden bg-gradient-to-b from-[#1877F2]/10 to-[#FFFFFF] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1877F2] flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#1877F2]" />
            Now Listening Live
          </span>
          <span className="text-[10px] font-bold text-emerald-600">5 listening</span>
        </div>

        <div className="flex items-center gap-3 my-2">
          <img
            src={MOCK_TRACKS[0].coverArt}
            alt={MOCK_TRACKS[0].title}
            className="w-12 h-12 rounded-xl object-cover shadow-xs"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#050505] truncate">{MOCK_TRACKS[0].title}</p>
            <p className="text-[10px] text-[#65676B] truncate">{MOCK_TRACKS[0].artist}</p>
          </div>
        </div>

        <button
          onClick={onJoinListeningRoom}
          className="w-full mt-2 py-2 rounded-xl btn-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
        >
          <Headphones className="w-3.5 h-3.5 text-white" />
          <span className="text-white">Join Session</span>
        </button>
      </div>

      {/* FRIENDS ONLINE */}
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#65676B] flex items-center justify-between">
          <span>Friends Online ({onlineFriends.length})</span>
        </h4>

        <div className="space-y-1">
          {onlineFriends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => onOpenProfile(friend)}
              className="p-2 rounded-xl hover:bg-[#E4E6EB] cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#F0F2F5]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#050505] truncate">{friend.name}</p>
                  <p className="text-[10px] text-[#65676B] truncate">@{friend.username}</p>
                </div>
              </div>

              {friend.onlineStatus === "listening" && (
                <span className="text-[10px] text-[#1877F2] font-semibold flex items-center gap-1">
                  <Headphones className="w-3 h-3 text-[#1877F2]" />
                  <span>Listening</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* TRENDING HASHTAGS */}
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#65676B] flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Trending Hashtags</span>
        </h4>

        <div className="space-y-1.5">
          {[
            { tag: "#TamilMusic", posts: "14.2K posts" },
            { tag: "#WeekendVibes", posts: "8.9K posts" },
            { tag: "#SynthwaveIndie", posts: "5.4K posts" },
          ].map((item) => (
            <div
              key={item.tag}
              className="p-2.5 rounded-xl vibe-card flex items-center justify-between cursor-pointer hover:border-[#1877F2]/40"
            >
              <div>
                <p className="text-xs font-bold text-[#1877F2]">{item.tag}</p>
                <p className="text-[10px] text-[#65676B]">{item.posts}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#65676B]" />
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVE SPACES */}
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#65676B] flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#1877F2]" />
          <span>Active Spaces</span>
        </h4>

        <div className="space-y-1.5">
          {MOCK_SPACES.map((space) => (
            <div
              key={space.id}
              onClick={() => onOpenSpace(space.id)}
              className="p-2.5 rounded-xl vibe-card flex items-center gap-3 cursor-pointer hover:border-[#1877F2]/40"
            >
              <span className="text-lg">{space.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#050505] truncate">{space.name}</p>
                <p className="text-[10px] text-[#65676B]">{space.membersCount} Members</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
