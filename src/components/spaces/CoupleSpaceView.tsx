"use client";

import React, { useState } from "react";
import {
  Heart,
  Sparkles,
  Flame,
  Plus,
  Headphones,
  Music,
  Radio,
} from "lucide-react";
import { Space, Track, UserProfile } from "@/types";
import { MOCK_COUPLE_SPACE, MOCK_TRACKS } from "@/lib/mock-data";

interface CoupleSpaceViewProps {
  space?: Space;
  currentUser: UserProfile;
  onStartListenTogether: (track: Track) => void;
}

export const CoupleSpaceView: React.FC<CoupleSpaceViewProps> = ({
  space = MOCK_COUPLE_SPACE,
  currentUser,
  onStartListenTogether,
}) => {
  const [activeTab, setActiveTab] = useState<"home" | "chat" | "music" | "memories" | "timeline">("home");
  const coupleData = space.coupleData!;
  const [notes, setNotes] = useState(coupleData.sharedNotes);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes((prev) => [
      ...prev,
      { id: `sn-${Date.now()}`, author: currentUser.name.split(" ")[0], content: newNote, date: "Today" },
    ]);
    setNewNote("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 select-none">
      {/* Couple Banner & Header */}
      <div className="relative rounded-3xl overflow-hidden vibe-card border border-pink-500/30 p-6 sm:p-8 shadow-sm">
        <img
          src={space.coverImage}
          alt="Couple Cover"
          className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-100/50 via-purple-100/40 to-white/90 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative flex items-center">
              <img
                src={coupleData.partner1.avatar}
                alt={coupleData.partner1.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-pink-500 z-10 shadow-md"
              />
              <img
                src={coupleData.partner2.avatar}
                alt={coupleData.partner2.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#1877F2] -ml-5 z-0 shadow-md"
              />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md z-20">
                <Heart className="w-4 h-4 fill-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-2xl text-[#050505]">
                  {coupleData.partner1.name.split(" ")[0]} ❤️ {coupleData.partner2.name.split(" ")[0]}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/15 text-pink-600 font-bold border border-pink-500/30">
                  Couple Space
                </span>
              </div>
              <p className="text-xs text-[#65676B] mt-1">{space.description}</p>
            </div>
          </div>

          {/* Relationship Streak & Anniversary Badge */}
          <div className="flex items-center gap-3">
            <div className="vibe-card px-4 py-2.5 rounded-2xl flex items-center gap-2 border border-amber-500/30 text-amber-600">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-[#050505]">{coupleData.streakDays} Days</p>
                <p className="text-[10px] text-[#65676B]">Together Streak</p>
              </div>
            </div>

            <button
              onClick={() => onStartListenTogether(MOCK_TRACKS[0])}
              className="py-3 px-5 rounded-2xl btn-primary text-white flex items-center gap-2 text-xs font-bold shadow-md shadow-blue-500/20"
            >
              <Headphones className="w-4 h-4 text-white" />
              <span>Couple Listen</span>
            </button>
          </div>
        </div>

        {/* Space Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-[#E4E6EB] flex items-center gap-2 overflow-x-auto relative z-10">
          {(["home", "chat", "music", "memories", "timeline"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-[#1877F2] text-white shadow-md shadow-blue-500/20"
                  : "btn-secondary text-[#65676B]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "home" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Anniversary Countdown & Daily Intimate Question */}
          <div className="md:col-span-8 space-y-6">
            {/* Daily Intimate Question Card */}
            <div className="vibe-card p-6 rounded-3xl border border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Daily Intimate Question
                </span>
                <span className="text-[10px] text-[#65676B]">Refreshes in 8h</span>
              </div>
              <h3 className="font-bold text-lg text-[#050505]">
                "{coupleData.dailyQuestion.question}"
              </h3>
              <div className="space-y-2">
                <div className="p-3 rounded-xl vibe-card text-xs text-[#050505] border border-pink-200">
                  {coupleData.dailyQuestion.answer1}
                </div>
                <div className="p-3 rounded-xl vibe-card text-xs text-[#050505] border border-blue-200">
                  {coupleData.dailyQuestion.answer2}
                </div>
              </div>
            </div>

            {/* Couple Music Playlist Preview */}
            <div className="vibe-card p-6 rounded-3xl border border-[#E4E6EB] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#050505] flex items-center gap-2">
                  <Music className="w-5 h-5 text-[#1877F2]" />
                  <span>Shared Couple Playlist</span>
                </h3>
                <button
                  onClick={() => onStartListenTogether(MOCK_TRACKS[1])}
                  className="text-xs text-[#1877F2] font-bold hover:underline flex items-center gap-1"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Play Session</span>
                </button>
              </div>

              <div className="space-y-2">
                {MOCK_TRACKS.slice(0, 3).map((track) => (
                  <div
                    key={track.id}
                    onClick={() => onStartListenTogether(track)}
                    className="p-3 rounded-2xl vibe-card flex items-center justify-between cursor-pointer hover:border-[#1877F2] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={track.coverArt}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#050505]">{track.title}</p>
                        <p className="text-[10px] text-[#65676B]">{track.artist}</p>
                      </div>
                    </div>
                    <Headphones className="w-4 h-4 text-[#1877F2]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Widgets: Mood Sharing & Notes */}
          <div className="md:col-span-4 space-y-6">
            {/* Mood Tracker */}
            <div className="vibe-card p-6 rounded-3xl border border-pink-500/30 space-y-4">
              <h3 className="font-bold text-sm text-[#050505] flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                <span>Live Partner Moods</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl theme-bg-secondary border border-[#E4E6EB] flex items-center gap-3">
                  <span className="text-2xl">{coupleData.moodPartner1.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-[#050505]">{coupleData.partner1.name}</p>
                    <p className="text-[11px] text-pink-600">{coupleData.moodPartner1.status}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl theme-bg-secondary border border-[#E4E6EB] flex items-center gap-3">
                  <span className="text-2xl">{coupleData.moodPartner2.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-[#050505]">{coupleData.partner2.name}</p>
                    <p className="text-[11px] text-[#1877F2]">{coupleData.moodPartner2.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Private Notes */}
            <div className="vibe-card p-6 rounded-3xl border border-[#E4E6EB] space-y-3">
              <h3 className="font-bold text-sm text-[#050505]">Private Notes</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="p-2.5 rounded-xl vibe-card text-xs">
                    <p className="text-[#050505]">{note.content}</p>
                    <p className="text-[10px] text-pink-600 mt-1 font-semibold">— {note.author}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Leave a sweet note..."
                  className="flex-1 py-2 px-3 rounded-xl vibe-input text-xs"
                />
                <button
                  onClick={handleAddNote}
                  className="px-3 py-2 rounded-xl btn-primary text-xs font-bold"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memories Tab */}
      {activeTab === "memories" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {coupleData.sharedMemories.map((mem) => (
            <div key={mem.id} className="vibe-card rounded-3xl overflow-hidden border border-[#E4E6EB]">
              <img src={mem.imageUrl} alt={mem.title} className="w-full h-48 object-cover" />
              <div className="p-4 space-y-1">
                <span className="text-[10px] text-pink-600 font-bold uppercase">{mem.date}</span>
                <h4 className="font-bold text-[#050505] text-base">{mem.title}</h4>
                <p className="text-xs text-[#65676B]">{mem.note}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
