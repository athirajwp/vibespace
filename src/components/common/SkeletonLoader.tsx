"use client";

import React from "react";

export const PostSkeleton: React.FC = () => {
  return (
    <div className="vibe-card p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-white/10" />
        <div className="space-y-1.5 flex-1">
          <div className="w-32 h-3.5 bg-white/10 rounded-md" />
          <div className="w-20 h-2.5 bg-white/10 rounded-md" />
        </div>
      </div>
      <div className="w-full h-4 bg-white/10 rounded-md" />
      <div className="w-3/4 h-4 bg-white/10 rounded-md" />
      <div className="w-full h-48 bg-white/10 rounded-2xl" />
    </div>
  );
};

export const MusicCardSkeleton: React.FC = () => {
  return (
    <div className="vibe-card p-4 flex items-center gap-4 animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="w-36 h-4 bg-white/10 rounded-md" />
        <div className="w-24 h-3 bg-white/10 rounded-md" />
      </div>
    </div>
  );
};
