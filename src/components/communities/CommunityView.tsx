"use client";

import React, { useState } from "react";
import { Hash, Radio, Headphones, Shield } from "lucide-react";
import { Community, Track } from "@/types";
import { MOCK_COMMUNITIES } from "@/lib/mock-data";

interface CommunityViewProps {
  onStartListenSession: (track: Track) => void;
  onOpenVoiceRoom: () => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  onStartListenSession,
  onOpenVoiceRoom,
}) => {
  const [selectedComm, setSelectedComm] = useState<Community>(MOCK_COMMUNITIES[0]);
  const [activeChannelId, setActiveChannelId] = useState("ch-general");
  const [isJoined, setIsJoined] = useState(selectedComm.isJoined);

  return (
    <div className="max-w-6xl mx-auto vibe-card rounded-3xl overflow-hidden border border-[#E4E6EB] grid grid-cols-1 md:grid-cols-12 shadow-sm h-[calc(100vh-6rem)]">
      {/* Left Sidebar: Community Server Switcher & Channels */}
      <div className="md:col-span-4 border-r border-[#E4E6EB] bg-[#F0F2F5] flex flex-col h-full">
        {/* Banner Header */}
        <div className="relative h-28 p-4 flex items-end">
          <img
            src={selectedComm.banner}
            alt={selectedComm.name}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F0F2F5] via-transparent to-transparent" />
          <div className="relative z-10 flex items-center gap-3">
            <img
              src={selectedComm.avatar}
              alt={selectedComm.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#1877F2] shadow-md"
            />
            <div>
              <h3 className="font-bold text-base text-[#050505]">{selectedComm.name}</h3>
              <p className="text-[10px] text-[#1877F2] font-semibold">{selectedComm.membersCount.toLocaleString()} Members</p>
            </div>
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#65676B] mb-2 block">
              Text Channels
            </span>
            <div className="space-y-1">
              {selectedComm.channels
                .filter((c) => c.type === "text")
                .map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannelId(ch.id)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                      activeChannelId === ch.id
                        ? "bg-[#1877F2]/15 text-[#1877F2] border border-[#1877F2]/40 font-bold"
                        : "text-[#65676B] hover:text-[#050505] hover:bg-[#E4E6EB]"
                    }`}
                  >
                    <Hash className="w-4 h-4 text-[#1877F2]" />
                    <span>{ch.name}</span>
                  </button>
                ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#65676B] mb-2 block">
              Voice & Music Rooms
            </span>
            <div className="space-y-1">
              {selectedComm.channels
                .filter((c) => c.type !== "text")
                .map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      if (ch.type === "voice") onOpenVoiceRoom();
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between vibe-card hover:border-[#1877F2] text-[#050505] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      {ch.type === "voice" ? (
                        <Radio className="w-4 h-4 text-[#1877F2] animate-pulse" />
                      ) : (
                        <Headphones className="w-4 h-4 text-[#1877F2]" />
                      )}
                      <span>{ch.name}</span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1877F2]/15 text-[#1877F2]">
                      Join
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Join / Leave Community Button */}
        <div className="p-4 border-t border-[#E4E6EB]">
          <button
            onClick={() => setIsJoined(!isJoined)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
              isJoined
                ? "btn-secondary text-[#050505] hover:text-red-600"
                : "btn-primary text-white shadow-md shadow-blue-500/20"
            }`}
          >
            {isJoined ? "Joined Community ✓" : "Join Community"}
          </button>
        </div>
      </div>

      {/* Right Content Area: Channel Chat & Community Feed */}
      <div className="md:col-span-8 flex flex-col h-full bg-white p-6 space-y-6 overflow-y-auto">
        <div className="border-b border-[#E4E6EB] pb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-xl text-[#050505] flex items-center gap-2">
              <Hash className="w-5 h-5 text-[#1877F2]" />
              <span>general</span>
            </h2>
            <p className="text-xs text-[#65676B] mt-1">{selectedComm.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1877F2] bg-[#1877F2]/10 px-3 py-1.5 rounded-xl border border-[#1877F2]/30">
              🛡️ Moderated Community
            </span>
          </div>
        </div>

        {/* Community Rules Card */}
        <div className="p-4 rounded-2xl vibe-card border border-[#1877F2]/30 space-y-2">
          <h4 className="font-bold text-xs text-[#1877F2] uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            <span>Community Guidelines</span>
          </h4>
          <ul className="text-xs text-[#65676B] space-y-1">
            {selectedComm.rules.map((rule, idx) => (
              <li key={idx}>• {rule}</li>
            ))}
          </ul>
        </div>

        {/* Channel Chat Messages */}
        <div className="space-y-4 flex-1">
          <div className="p-4 rounded-2xl vibe-card border border-[#E4E6EB] space-y-2">
            <div className="flex items-center gap-3">
              <img
                src={selectedComm.moderators[0].avatar}
                alt="Mod"
                className="w-9 h-9 rounded-full object-cover border border-[#1877F2]"
              />
              <div>
                <p className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                  <span>{selectedComm.moderators[0].name}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1877F2]/15 text-[#1877F2]">MOD</span>
                </p>
                <p className="text-[10px] text-[#65676B]">2h ago</p>
              </div>
            </div>
            <p className="text-xs text-[#050505]">
              Welcome everyone to Tamil Music Lovers! Join our 🎵 Friday Listening Party music room on the sidebar to listen to synchronized beat drops together!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
