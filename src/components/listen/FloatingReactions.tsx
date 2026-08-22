"use client";

import React from "react";

interface FloatingReactionItem {
  id: string;
  emoji: string;
  userName: string;
}

interface FloatingReactionsProps {
  reactions: FloatingReactionItem[];
}

export const FloatingReactions: React.FC<FloatingReactionsProps> = ({ reactions }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {reactions.map((r, index) => {
        // Random horizontal positioning between 15% and 85%
        const leftPercent = 20 + ((index * 37) % 60);
        return (
          <div
            key={r.id}
            className="absolute bottom-10 flex flex-col items-center animate-float-up"
            style={{ left: `${leftPercent}%` }}
          >
            <span className="text-4xl drop-shadow-[0_0_12px_rgba(0,242,254,0.6)]">
              {r.emoji}
            </span>
            <span className="text-[10px] font-bold text-cyan-300 bg-black/60 px-2 py-0.5 rounded-full border border-cyan-500/40 mt-1">
              {r.userName}
            </span>
          </div>
        );
      })}
    </div>
  );
};
