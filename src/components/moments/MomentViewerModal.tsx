"use client";

import React, { useState } from "react";
import { X, Heart, Send, Music, Headphones, Radio } from "lucide-react";
import { Moment } from "@/types";

interface MomentViewerModalProps {
  moment: Moment;
  onClose: () => void;
  onPlayTrack: (track: any) => void;
}

export const MomentViewerModal: React.FC<MomentViewerModalProps> = ({
  moment,
  onClose,
  onPlayTrack,
}) => {
  const [replyText, setReplyText] = useState("");
  const [reactionsCount, setReactionsCount] = useState(moment.reactionsCount);
  const [hasLiked, setHasLiked] = useState(false);

  const handleReact = (emoji: string) => {
    setReactionsCount((prev) => prev + 1);
    setHasLiked(true);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
      <div className="relative w-full max-w-sm h-[85vh] max-h-[680px] rounded-3xl overflow-hidden glass-panel border border-white/10 flex flex-col justify-between shadow-2xl">
        {/* Top Story Progress & Header */}
        <div className="p-4 bg-gradient-to-b from-black/80 to-transparent z-20">
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-cyan-400 w-2/3 animate-pulse" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={moment.author.avatar}
                alt={moment.author.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400"
              />
              <div>
                <h4 className="font-display font-bold text-white text-sm">
                  {moment.author.name}
                </h4>
                <p className="text-[10px] text-cyan-300 font-semibold">{moment.expiresAt}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full glass-pill text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Story Main Visual */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {moment.type === "photo" && moment.mediaUrl ? (
            <img
              src={moment.mediaUrl}
              alt="Story"
              className="w-full h-full object-cover"
            />
          ) : moment.track ? (
            <div className="w-full h-full relative flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-purple-900 via-indigo-950 to-black">
              {/* Spinning Vinyl Album Artwork */}
              <div
                onClick={() => onPlayTrack(moment.track)}
                className="w-48 h-48 rounded-full overflow-hidden border-4 border-cyan-400/50 shadow-2xl shadow-cyan-500/40 cursor-pointer vinyl-spin hover:scale-105 transition-transform"
              >
                <img
                  src={moment.track.coverArt}
                  alt={moment.track.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-6 space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/20">
                  Music Moment
                </span>
                <h3 className="font-display font-bold text-2xl text-white">
                  {moment.track.title}
                </h3>
                <p className="text-sm text-gray-300">{moment.track.artist}</p>
              </div>
            </div>
          ) : null}

          {/* Caption Overlay */}
          {moment.caption && (
            <div className="absolute bottom-20 left-4 right-4 p-3 rounded-2xl glass-card text-center text-sm font-semibold text-white">
              {moment.caption}
            </div>
          )}
        </div>

        {/* Bottom Reaction & Reply Bar */}
        <div className="p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20 space-y-3">
          {/* Quick Floating Emoji Reactions */}
          <div className="flex items-center justify-around px-2">
            {["❤️", "🔥", "😭", "🎧", "🤯"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-2xl hover:scale-130 active:scale-95 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* DM Input Bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${moment.author.name}...`}
              className="flex-1 py-2.5 px-4 rounded-full bg-surface/90 border border-white/20 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => {
                setReplyText("");
                onClose();
              }}
              className="w-10 h-10 rounded-full gradient-btn-primary flex items-center justify-center shadow-lg shadow-cyan-400/30"
            >
              <Send className="w-4 h-4 text-black translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
