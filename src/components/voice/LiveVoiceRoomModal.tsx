"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Hand,
  Radio,
  Headphones,
  X,
} from "lucide-react";
import { UserProfile } from "@/types";
import { MOCK_VOICE_ROOMS } from "@/lib/mock-data";

interface LiveVoiceRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const LiveVoiceRoomModal: React.FC<LiveVoiceRoomModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const room = MOCK_VOICE_ROOMS[0];
  const [isMuted, setIsMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
      <div className="vibe-card bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-[#E4E6EB] shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1877F2] to-blue-600 p-[2px]">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-[#1877F2] animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-[#050505]">{room.title}</h2>
                {room.isMusicConnected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1877F2]/15 text-[#1877F2] border border-[#1877F2]/30 flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    <span>🎙️ + 🎵 Voice + Music</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#65676B]">Host: {room.host.name}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full text-[#65676B] hover:text-[#050505] hover:bg-[#F0F2F5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Speakers Stage Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1877F2]">
            Speakers Stage ({room.speakers.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {room.speakers.map((speaker) => (
              <div key={speaker.id} className="flex flex-col items-center gap-2 p-3 rounded-2xl vibe-card border border-[#E4E6EB] relative">
                <div className="relative">
                  <img
                    src={speaker.avatar}
                    alt={speaker.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#1877F2]"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Mic className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>
                <span className="text-xs font-bold text-[#050505] truncate max-w-[90px]">
                  {speaker.name}
                </span>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#1877F2]/15 text-[#1877F2]">
                  {speaker.id === room.host.id ? "Host" : "Speaker"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Listeners Stage Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#65676B]">
            Audience Listeners ({room.listeners.length})
          </h3>
          <div className="flex items-center gap-3">
            {room.listeners.map((listener) => (
              <div key={listener.id} className="flex flex-col items-center gap-1">
                <img
                  src={listener.avatar}
                  alt={listener.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#E4E6EB]"
                />
                <span className="text-[10px] text-[#65676B] truncate max-w-[60px]">
                  {listener.name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="pt-4 border-t border-[#E4E6EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isMuted
                  ? "bg-red-500/15 text-red-600 border border-red-500/30"
                  : "btn-primary text-white shadow-md shadow-blue-500/20"
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 stroke-[2.5] text-white" />}
              <span>{isMuted ? "Muted" : "Mute Mic"}</span>
            </button>

            <button
              onClick={() => setIsHandRaised(!isHandRaised)}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 btn-secondary ${
                isHandRaised ? "text-amber-600 border-amber-500/50" : "text-[#65676B]"
              }`}
            >
              <Hand className="w-4 h-4" />
              <span>{isHandRaised ? "Hand Raised 🖐️" : "Raise Hand"}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-red-500/15 text-red-600 border border-red-500/30 text-xs font-bold hover:bg-red-500/25"
          >
            Leave Voice Room
          </button>
        </div>
      </div>
    </div>
  );
};
