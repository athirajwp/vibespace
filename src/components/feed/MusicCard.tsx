"use client";

import React, { useState } from "react";
import { Play, Pause, Headphones, Plus, Radio, Check } from "lucide-react";
import { Track } from "@/types";

interface MusicCardProps {
  track: Track;
  sharedNote?: string;
  onPlayPreview: (track: Track) => void;
  onStartListeningSession: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
}

export const MusicCard: React.FC<MusicCardProps> = ({
  track,
  sharedNote,
  onPlayPreview,
  onStartListeningSession,
  onAddToQueue,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [addedToQueue, setAddedToQueue] = useState(false);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
    onPlayPreview(track);
  };

  const handleQueueAdd = () => {
    setAddedToQueue(true);
    onAddToQueue(track);
    setTimeout(() => setAddedToQueue(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl p-4 relative overflow-hidden vibe-card border border-[#1877F2]/30 group hover:border-[#1877F2]/60 transition-all shadow-lg">
      {/* Blurred Album Artwork Background Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 blur-xl scale-125">
        <img src={track.coverArt} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#1877F2]/15 via-blue-900/10 to-transparent pointer-events-none" />

      {sharedNote && (
        <p className="text-xs font-semibold text-[#1877F2] mb-3 italic flex items-center gap-1.5 relative z-10">
          <Headphones className="w-3.5 h-3.5" />
          <span>"{sharedNote}"</span>
        </p>
      )}

      <div className="flex items-center gap-4 relative z-10">
        {/* Album Artwork with Play Overlay */}
        <div
          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shadow-lg flex-shrink-0 group/cover cursor-pointer"
          onClick={handlePlayToggle}
        >
          <img
            src={track.coverArt}
            alt={track.title}
            className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover/cover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full btn-primary flex items-center justify-center shadow-lg shadow-blue-500/50">
              {isPlaying ? <Pause className="w-5 h-5 fill-white text-white" /> : <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />}
            </div>
          </div>
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1877F2]/15 text-[#1877F2] border border-[#1877F2]/30">
              {track.genre || "Music Track"}
            </span>
            <span className="text-xs theme-text-muted">
              {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <h4 className="font-bold theme-text-primary text-base truncate group-hover:text-[#1877F2] transition-colors">
            {track.title}
          </h4>
          <p className="text-xs theme-text-secondary truncate font-medium">
            {track.artist} — <span className="theme-text-muted">{track.album}</span>
          </p>
        </div>
      </div>

      {/* Action Bar with Facebook Blue Primary Button */}
      <div className="mt-4 pt-3 theme-border border-t flex items-center justify-between gap-2 relative z-10">
        <button
          onClick={() => onStartListeningSession(track)}
          className="flex-1 py-2 px-3 rounded-xl btn-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95"
        >
          <Radio className="w-3.5 h-3.5 stroke-[2.5] text-white" />
          <span className="text-white">Listen Together</span>
        </button>

        <button
          onClick={handleQueueAdd}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            addedToQueue
              ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
              : "btn-secondary"
          }`}
        >
          {addedToQueue ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Plus className="w-3.5 h-3.5 text-[#1877F2]" />}
          <span>{addedToQueue ? "Queued" : "Add to Queue"}</span>
        </button>
      </div>
    </div>
  );
};
