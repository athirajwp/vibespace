"use client";

import React, { useState } from "react";
import { Search, Plus, Bell, Headphones } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { UserProfile } from "@/types";
import { useRealtimeSession } from "@/lib/realtime-store";

interface TopNavProps {
  user: UserProfile;
  unreadMessagesCount?: number;
  unreadNotificationsCount: number;
  isListeningActive?: boolean;
  onOpenCreatePost: () => void;
  onOpenMessages?: () => void;
  onOpenNotifications: () => void;
  onOpenListenRoom?: () => void;
  onOpenProfile: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  user,
  unreadNotificationsCount,
  onOpenCreatePost,
  onOpenNotifications,
  onOpenListenRoom,
  onOpenProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { session } = useRealtimeSession();
  const playback = session.playbackState;
  const currentTrack = playback.currentTrack;

  return (
    <header className="sticky top-0 h-16 bg-white border-b border-[#E4E6EB] px-3 sm:px-6 flex items-center justify-between z-40 select-none shadow-xs transition-colors">
      {/* Left: VibeSpace Brand Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <Logo size="md" />
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8D91]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search VibeSpace (people, songs, spaces)..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-[#F0F2F5] text-xs text-[#050505] placeholder-[#8A8D91] border border-[#E4E6EB] focus:outline-none focus:bg-white focus:border-[#1877F2] transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Create Post Button: Facebook Blue with White Text */}
        <button
          onClick={onOpenCreatePost}
          className="hidden sm:flex px-3.5 py-1.5 rounded-full btn-primary text-white text-xs font-semibold items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5] text-white" />
          <span className="text-white">Create</span>
        </button>

        {/* Top Music Player Vinyl Disc Button (Moved from bottom right as requested) */}
        {currentTrack && (
          <button
            onClick={onOpenListenRoom}
            className="flex items-center gap-2 p-1 pr-3 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/30 hover:border-[#1877F2] text-[#1877F2] transition-all shadow-xs group shrink-0 active:scale-95"
            title={`Now Playing: ${currentTrack.title} by ${currentTrack.artist}`}
          >
            {/* Spinning Album Art Cover */}
            <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-[#1877F2]/40">
              <img
                src={currentTrack.coverArt}
                alt={currentTrack.title}
                className={`w-full h-full object-cover ${
                  playback.isPlaying ? "vinyl-rotation" : "vinyl-rotation-paused"
                }`}
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>

            <div className="hidden sm:flex flex-col text-left min-w-0 max-w-[110px]">
              <span className="text-[11px] font-bold text-[#050505] truncate leading-tight group-hover:text-[#1877F2] transition-colors">
                {currentTrack.title}
              </span>
              <span className="text-[9px] text-[#65676B] truncate">
                {currentTrack.artist}
              </span>
            </div>

            <Headphones className="w-3.5 h-3.5 text-[#1877F2] animate-pulse shrink-0 ml-0.5" />
          </button>
        )}

        {/* Notifications Launcher */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] transition-colors shadow-xs shrink-0"
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#1877F2] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Profile Avatar */}
        <div onClick={onOpenProfile} className="cursor-pointer pl-1 group shrink-0">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-[#1877F2]/40 group-hover:border-[#1877F2] transition-all shadow-sm"
          />
        </div>
      </div>
    </header>
  );
};
