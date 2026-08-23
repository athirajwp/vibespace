"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, Users, Maximize2, Headphones, ListMusic } from "lucide-react";
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
      className={`fixed bottom-18 lg:bottom-5 right-4 sm:right-6 z-40 bg-white/95 border shadow-xl backdrop-blur-2xl rounded-3xl transition-all duration-300 ease-in-out select-none cursor-pointer overflow-hidden text-[#050505] ${
        showExpanded
          ? "w-[calc(100vw-2rem)] sm:w-[420px] p-3.5 border-[#1877F2]/35 shadow-blue-500/15"
          : "w-14 h-14 p-1 rounded-full border-[#1877F2]/40 hover:scale-105 hover:border-[#1877F2] shadow-blue-500/20"
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
              className={`w-full h-full rounded-full object-cover border border-white ${
                playback.isPlaying ? "vinyl-rotation" : "vinyl-rotation-paused"
              }`}
            />
          </div>
          {/* Live Sync Badge Indicator */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1877F2] border-2 border-white flex items-center justify-center shadow-md">
            <Headphones className="w-2.5 h-2.5 text-white animate-pulse" />
          </span>
        </div>
      ) : (
        /* EXPANDED GROIC LIGHT GLASS PLAYER WIDGET */
        <div className="animate-in fade-in duration-200">
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
                  <p className="text-xs font-extrabold text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                    {currentTrack.title}
                  </p>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 flex items-center gap-0.5 shrink-0">
                    <Users className="w-2.5 h-2.5" />
                    <span>{session.participants.length}</span>
                  </span>
                </div>
                <p className="text-[10px] text-[#65676B] font-medium truncate">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Playback Controls & Expand Button */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Animated Waveform Equalizer */}
              <div className="hidden sm:flex items-center gap-0.5 h-4 px-1">
                {[30, 80, 50, 90, 40].map((h, idx) => (
                  <div
                    key={idx}
                    className={`w-1 rounded-full bg-[#1877F2] transition-all ${
                      playback.isPlaying ? "animate-pulse" : "opacity-30"
                    }`}
                    style={{
                      height: playback.isPlaying ? `${h}%` : "30%",
                      animationDelay: `${idx * 100}ms`,
                    }}
                  />
                ))}
              </div>

              {/* Playlist / Queue Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFullRoom();
                }}
                className="w-8 h-8 rounded-full bg-[#1877F2] text-white hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center shadow-md shadow-blue-500/20 relative shrink-0"
                title={`View Playlist & Queue (${session.queue.length})`}
              >
                <ListMusic className="w-4 h-4 text-white" />
                {session.queue.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-purple-600 text-white font-extrabold text-[8px] flex items-center justify-center border-2 border-white">
                    {session.queue.length}
                  </span>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1877F2] via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30 active:scale-95 transition-transform"
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
                className="p-2 rounded-full text-[#65676B] hover:text-[#050505] hover:bg-[#F0F2F5] transition-colors"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4 fill-[#65676B]" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFullRoom();
                }}
                className="p-2 rounded-full text-[#1877F2] hover:bg-[#1877F2]/10 transition-colors"
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
