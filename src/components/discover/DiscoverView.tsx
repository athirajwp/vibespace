"use client";

import React from "react";
import { Compass, Headphones, Flame, Radio, Play } from "lucide-react";
import { Track } from "@/types";
import { MOCK_TRACKS } from "@/lib/mock-data";

interface DiscoverViewProps {
  onPlayTrack: (track: Track) => void;
  onJoinListeningRoom: () => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onPlayTrack,
  onJoinListeningRoom,
}) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 select-none">
      {/* Header Banner */}
      <div className="vibe-card p-6 sm:p-8 rounded-3xl border border-[#1877F2]/30 relative overflow-hidden shadow-sm bg-gradient-to-r from-[#1877F2]/10 via-blue-50 to-[#FFFFFF]">
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1877F2] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#1877F2]" />
            Explore VibeSpace
          </span>
          <h1 className="font-bold text-2xl sm:text-3xl text-[#050505]">
            Discover Live Synchronized Rooms & Music
          </h1>
          <p className="text-xs sm:text-sm text-[#65676B] max-w-xl">
            Join public listening parties, explore trending indie tracks across genres, and find public spaces.
          </p>
        </div>
      </div>

      {/* Active Public Listening Rooms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-[#050505] flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#1877F2] animate-pulse" />
            <span>Active Public Listening Rooms</span>
          </h2>
          <span className="text-xs text-[#1877F2] font-semibold">Live Now</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="vibe-card p-5 rounded-2xl border border-[#1877F2]/30 flex items-center justify-between gap-4 relative overflow-hidden group hover:border-[#1877F2] transition-all">
            <div className="flex items-center gap-4">
              <img
                src={MOCK_TRACKS[0].coverArt}
                alt="Cover"
                className="w-16 h-16 rounded-xl object-cover shadow-sm"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1877F2]/15 text-[#1877F2]">
                    128 listeners
                  </span>
                </div>
                <h3 className="font-bold text-[#050505] text-base truncate">
                  Late Night Synthwave Vibes 🌙
                </h3>
                <p className="text-xs text-[#65676B] truncate">
                  {MOCK_TRACKS[0].title} — {MOCK_TRACKS[0].artist}
                </p>
              </div>
            </div>

            <button
              onClick={onJoinListeningRoom}
              className="py-2.5 px-4 rounded-xl btn-primary text-white text-xs font-bold shadow-md shadow-blue-500/20 flex-shrink-0"
            >
              Join Session
            </button>
          </div>

          <div className="vibe-card p-5 rounded-2xl border border-[#1877F2]/30 flex items-center justify-between gap-4 relative overflow-hidden group hover:border-[#1877F2] transition-all">
            <div className="flex items-center gap-4">
              <img
                src={MOCK_TRACKS[1].coverArt}
                alt="Cover"
                className="w-16 h-16 rounded-xl object-cover shadow-sm"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1877F2]/15 text-[#1877F2]">
                    64 listeners
                  </span>
                </div>
                <h3 className="font-bold text-[#050505] text-base truncate">
                  Lo-Fi Study & Chill Party ☕
                </h3>
                <p className="text-xs text-[#65676B] truncate">
                  {MOCK_TRACKS[1].title} — {MOCK_TRACKS[1].artist}
                </p>
              </div>
            </div>

            <button
              onClick={onJoinListeningRoom}
              className="py-2.5 px-4 rounded-xl btn-primary text-white text-xs font-bold shadow-md shadow-blue-500/20 flex-shrink-0"
            >
              Join Session
            </button>
          </div>
        </div>
      </div>

      {/* Trending Songs Section */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg text-[#050505] flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          <span>Trending Songs in VibeSpace</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MOCK_TRACKS.slice(0, 3).map((track) => (
            <div
              key={track.id}
              onClick={() => onPlayTrack(track)}
              className="p-4 rounded-2xl vibe-card flex items-center gap-3 cursor-pointer hover:border-[#1877F2] transition-all group"
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={track.coverArt}
                  alt={track.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#050505] truncate group-hover:text-[#1877F2]">
                  {track.title}
                </p>
                <p className="text-[10px] text-[#65676B] truncate">{track.artist}</p>
                <span className="text-[9px] font-bold text-[#1877F2] uppercase mt-1 inline-block">
                  {track.genre}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
