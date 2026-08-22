"use client";

import React, { useState } from "react";
import { Plus, Music } from "lucide-react";
import { Moment, UserProfile } from "@/types";
import { MomentViewerModal } from "./MomentViewerModal";

interface MomentsBarProps {
  moments: Moment[];
  currentUser: UserProfile;
  onPlayTrack: (track: any) => void;
}

export const MomentsBar: React.FC<MomentsBarProps> = ({
  moments,
  currentUser,
  onPlayTrack,
}) => {
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);

  return (
    <>
      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 px-1 scrollbar-none select-none">
        {/* Create Moment Card */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
          <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl border-2 border-dashed border-[#1877F2]/40 bg-white flex flex-col items-center justify-center relative overflow-hidden group-hover:border-[#1877F2] group-hover:bg-[#1877F2]/10 transition-all shadow-xs">
            <div className="w-8 h-8 rounded-full btn-primary text-white flex items-center justify-center shadow-md shadow-blue-500/40 mb-1 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 stroke-[2.5] text-white" />
            </div>
            <span className="text-[10px] font-bold text-[#1877F2]">Add Moment</span>
          </div>
          <span className="text-[11px] font-semibold text-[#65676B] truncate max-w-[70px]">Your Vibe</span>
        </div>

        {/* Moments List */}
        {moments.map((moment) => (
          <div
            key={moment.id}
            onClick={() => setSelectedMoment(moment)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl p-[2px] bg-gradient-to-tr from-[#1877F2] via-blue-500 to-pink-500 shadow-sm group-hover:scale-105 transition-transform relative">
              <div className="w-full h-full rounded-[14px] bg-[#F0F2F5] overflow-hidden relative">
                {moment.type === "photo" && moment.mediaUrl ? (
                  <img
                    src={moment.mediaUrl}
                    alt={moment.author.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : moment.track ? (
                  <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center p-2 text-center bg-gradient-to-b from-[#1877F2] to-blue-800">
                    <img
                      src={moment.track.coverArt}
                      alt={moment.track.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 blur-xs"
                    />
                    <div className="relative z-10 w-8 h-8 rounded-full btn-primary text-white flex items-center justify-center shadow-md shadow-blue-500/50">
                      <Music className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ) : null}

                {/* Author Avatar Badge */}
                <div className="absolute top-1.5 left-1.5 ring-2 ring-[#1877F2] rounded-full overflow-hidden w-6 h-6">
                  <img
                    src={moment.author.avatar}
                    alt={moment.author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#050505] truncate max-w-[75px]">
              {moment.author.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Moment Fullscreen Modal */}
      {selectedMoment && (
        <MomentViewerModal
          moment={selectedMoment}
          onClose={() => setSelectedMoment(null)}
          onPlayTrack={onPlayTrack}
        />
      )}
    </>
  );
};
