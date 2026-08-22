"use client";

import React, { useState } from "react";
import { Headphones, Edit } from "lucide-react";
import { UserProfile, Track } from "@/types";
import { CURRENT_USER, MOCK_TRACKS } from "@/lib/mock-data";
import { MusicCard } from "../feed/MusicCard";

interface ProfileViewProps {
  user?: UserProfile;
  onPlayTrack: (track: Track) => void;
  onStartListenTogether: (track: Track) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user = CURRENT_USER,
  onPlayTrack,
  onStartListenTogether,
}) => {
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "music" | "tagged" | "saved">("posts");
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 select-none">
      {/* Profile Header & Banner */}
      <div className="vibe-card rounded-3xl overflow-hidden border border-[#E4E6EB] relative shadow-sm">
        {/* Cover Image */}
        <div className="h-44 sm:h-56 relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          {user.coverImage && (
            <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover opacity-70" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
        </div>

        {/* Profile Details Header */}
        <div className="px-6 sm:px-8 pb-6 -mt-16 sm:-mt-20 relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-md"
              />
              <div>
                <h1 className="font-bold text-2xl text-[#050505] flex items-center justify-center sm:justify-start gap-2">
                  <span>{user.name}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1877F2]/15 text-[#1877F2] font-semibold border border-[#1877F2]/30">
                    @{user.username}
                  </span>
                </h1>
                <p className="text-xs text-[#65676B] mt-1 max-w-md">{user.bio}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user.id !== CURRENT_USER.id ? (
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`py-2.5 px-6 rounded-xl text-xs font-bold transition-all ${
                    isFollowing
                      ? "btn-secondary text-[#050505]"
                      : "btn-primary text-white shadow-md shadow-blue-500/20"
                  }`}
                >
                  {isFollowing ? "Following ✓" : "Follow"}
                </button>
              ) : (
                <button className="py-2.5 px-4 rounded-xl btn-secondary text-xs font-bold flex items-center gap-1.5">
                  <Edit className="w-4 h-4 text-[#1877F2]" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-around sm:justify-start sm:gap-8 py-3 border-y border-[#E4E6EB] text-center text-xs font-semibold">
            <div>
              <p className="text-base font-bold text-[#050505]">{user.postsCount}</p>
              <p className="text-[#65676B] text-[10px]">Posts</p>
            </div>
            <div>
              <p className="text-base font-bold text-[#050505]">{user.followersCount.toLocaleString()}</p>
              <p className="text-[#65676B] text-[10px]">Followers</p>
            </div>
            <div>
              <p className="text-base font-bold text-[#050505]">{user.followingCount.toLocaleString()}</p>
              <p className="text-[#65676B] text-[10px]">Following</p>
            </div>
          </div>

          {/* Music Genres & Interests Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-[#65676B] uppercase tracking-widest mr-1">
              Favorite Genres:
            </span>
            {user.favoriteGenres.map((g) => (
              <span
                key={g}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20"
              >
                🎵 {g}
              </span>
            ))}
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center border-t border-[#E4E6EB] px-6 overflow-x-auto">
          {(["posts", "media", "music", "tagged", "saved"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all capitalize ${
                activeTab === tab
                  ? "border-[#1877F2] text-[#1877F2]"
                  : "border-transparent text-[#65676B] hover:text-[#050505]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          <MusicCard
            track={MOCK_TRACKS[0]}
            sharedNote="My all time favorite synthwave track!"
            onPlayPreview={onPlayTrack}
            onStartListeningSession={onStartListenTogether}
            onAddToQueue={() => {}}
          />
        </div>
      )}

      {activeTab === "music" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MOCK_TRACKS.map((track) => (
            <div
              key={track.id}
              onClick={() => onPlayTrack(track)}
              className="p-4 rounded-2xl vibe-card flex items-center gap-3 cursor-pointer hover:border-[#1877F2] transition-all"
            >
              <img src={track.coverArt} alt={track.title} className="w-12 h-12 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#050505] truncate">{track.title}</p>
                <p className="text-[10px] text-[#65676B] truncate">{track.artist}</p>
              </div>
              <Headphones className="w-4 h-4 text-[#1877F2]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
