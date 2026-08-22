"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, Users, Maximize2, Headphones, Sparkles, Heart } from "lucide-react";
import { useRealtimeSession } from "@/lib/realtime-store";

interface MiniMusicPlayerProps {
  onOpenFullRoom: () => void;
}

export const MiniMusicPlayer: React.FC<MiniMusicPlayerProps> = ({ onOpenFullRoom }) => {
  const { session, togglePlayPause, nextTrack, sendReaction } = useRealtimeSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClickLocked, setIsClickLocked] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const playback = session.playbackState;
  const currentTrack = playback.currentTrack;

  // Listen for clicks outside the player to minimize automatically
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (playerRef.current && !playerRef.current.contains(event.target as Node)) {
        setIsClickLocked(false);
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!currentTrack) return null;

  const duration = currentTrack.duration || 200;
  const progressPercent = Math.min(100, (playback.currentPosition / duration) * 100);

  const showExpanded = isExpanded || isClickLocked;

  return (
    <div
      ref={playerRef}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        if (!isClickLocked) {
          setIsExpanded(false);
        }
      }}
      onClick={() => {
        if (!showExpanded) {
          setIsClickLocked(true);
        }
      }}
      className={`fixed bottom-18 lg:bottom-5 right-4 sm:right-6 z-40 bg-slate-950/90 border border-purple-500/40 shadow-2xl backdrop-blur-xl rounded-3xl transition-all duration-300 ease-in-out select-none cursor-pointer overflow-hidden text-white ${
        showExpanded
          ? "w-[calc(100vw-2rem)] sm:w-[420px] p-3.5 border-purple-500 shadow-purple-500/30"
          : "w-14 h-14 p-1 rounded-full border-purple-500/60 hover:scale-105 hover:border-purple-400 shadow-purple-500/20"
      }`}
    >
      {/* COLLAPSED GROIC MINI WIDGET */}
      {!showExpanded ? (
        <div className="w-full h-full relative flex items-center justify-center">
          {/* Spinning Album Art Disc with Groic Gradient Aura */}
          <div className="w-full h-full rounded-full p-[2px] bg-gradient-to-tr from-[#1877F2] via-purple-500 to-pink-500">
            <img
              src={currentTrack.coverArt}
              alt={currentTrack.title}
              className={`w-full h-full rounded-full object-cover border border-slate-900 ${
                playback.isPlaying ? "vinyl-rotation" : "vinyl-rotation-paused"
              }`}
            />
          </div>
          {/* Live Sync Badge Indicator */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1877F2] border-2 border-slate-950 flex items-center justify-center shadow-md">
            <Headphones className="w-2.5 h-2.5 text-white animate-pulse" />
          </span>
        </div>
      ) : (
        /* EXPANDED GROIC GLASS PLAYER WIDGET */
        <div className="space-y-2.5 animate-in fade-in duration-200">
          {/* Top Scrubber Line */}
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1877F2] to-pink-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Album Artwork & Song Details */}
            <div
              onClick={() => onOpenFullRoom()}
              className="flex items-center gap-3 min-w-0 flex-1 group"
            >
              <div className="relative flex-shrink-0 p-[2px] rounded-xl bg-gradient-to-tr from-[#1877F2] via-purple-500 to-pink-500">
                <img
                  src={currentTrack.coverArt}
                  alt={currentTrack.title}
                  className={`w-11 h-11 rounded-lg object-cover group-hover:scale-105 transition-transform ${
                    playback.isPlaying ? "vinyl-rotation" : "vinyl-rotation-paused"
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-extrabold text-white truncate group-hover:text-purple-300 transition-colors">
                    {currentTrack.title}
                  </p>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-0.5 shrink-0">
                    <Users className="w-2.5 h-2.5" />
                    <span>{session.participants.length}</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 truncate">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Playback Controls & Expand Button */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Animated Waveform Equalizer */}
              <div className="hidden sm:flex items-center gap-0.5 h-4 px-1">
                {[30, 80, 50, 90, 40].map((h, idx) => (
                  <div
                    key={idx}
                    className={`w-1 rounded-full bg-purple-400 transition-all ${
                      playback.isPlaying ? "animate-pulse" : "opacity-30"
                    }`}
                    style={{
                      height: playback.isPlaying ? `${h}%` : "30%",
                      animationDelay: `${idx * 100}ms`,
                    }}
                  />
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1877F2] to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/40 active:scale-95 transition-transform"
                title={playback.isPlaying ? "Pause" : "Play"}
              >
                {playback.isPlaying ? (
                  <Pause className="w-4 h-4 fill-white text-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextTrack();
                }}
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFullRoom();
                }}
                className="p-2 rounded-full text-purple-300 hover:bg-purple-500/20 transition-colors"
                title="Expand Groic Music Stage"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
