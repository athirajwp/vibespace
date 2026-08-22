"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Headphones,
  ListMusic,
  Plus,
  Search,
  X,
  Check,
  Music,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRealtimeSession } from "@/lib/realtime-store";
import { FloatingReactions } from "./FloatingReactions";
import { QueueManager } from "./QueueManager";
import { YouTubeAudioPlayer } from "./YouTubeAudioPlayer";
import { Track } from "@/types";

interface ListenTogetherRoomProps {
  onClose?: () => void;
}

const DEFAULT_AVAILABLE_SONGS: Track[] = [
  {
    id: "GqlGdhjEXNg",
    title: "Kutti Story (From \"Master\")",
    artist: "Anirudh Ravichander, Thalapathy Vijay",
    album: "Master",
    coverArt: "https://img.youtube.com/vi/GqlGdhjEXNg/hqdefault.jpg",
    duration: 290,
    audioUrl: "https://www.youtube-nocookie.com/embed/GqlGdhjEXNg",
  },
  {
    id: "N2z0kXQ_474",
    title: "Kutty Pattas",
    artist: "Santhosh Dhayanidhi, Rakshita Suresh",
    album: "Kutty Pattas",
    coverArt: "https://img.youtube.com/vi/N2z0kXQ_474/hqdefault.jpg",
    duration: 230,
    audioUrl: "https://www.youtube-nocookie.com/embed/N2z0kXQ_474",
  },
  {
    id: "1f_9g2tUjCg",
    title: "Anul Maale Panithuli",
    artist: "Harris Jayaraj • V.V. Prasanna",
    album: "Vaaranam Aayiram",
    coverArt: "https://img.youtube.com/vi/1f_9g2tUjCg/hqdefault.jpg",
    duration: 315,
    audioUrl: "https://www.youtube-nocookie.com/embed/1f_9g2tUjCg",
  },
  {
    id: "v_3Lp9Z-4vI",
    title: "Pallikoodam - The Farewell Song",
    artist: "Sanjith Hegde",
    album: "Natpe Thunai",
    coverArt: "https://img.youtube.com/vi/v_3Lp9Z-4vI/hqdefault.jpg",
    duration: 245,
    audioUrl: "https://www.youtube-nocookie.com/embed/v_3Lp9Z-4vI",
  },
  {
    id: "YxWlaYCA8f0",
    title: "Arabic Kuthu - Halamithi Habibo",
    artist: "Anirudh Ravichander",
    album: "Beast",
    coverArt: "https://img.youtube.com/vi/YxWlaYCA8f0/hqdefault.jpg",
    duration: 275,
    audioUrl: "https://www.youtube-nocookie.com/embed/YxWlaYCA8f0",
  },
  {
    id: "yKNxeF4KMsY",
    title: "Othayilae",
    artist: "Harris Jayaraj",
    album: "Endrendrum Punnagai",
    coverArt: "https://img.youtube.com/vi/yKNxeF4KMsY/hqdefault.jpg",
    duration: 285,
    audioUrl: "https://www.youtube-nocookie.com/embed/yKNxeF4KMsY",
  },
  {
    id: "4NRXx6U8ABQ",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    coverArt: "https://img.youtube.com/vi/4NRXx6U8ABQ/hqdefault.jpg",
    duration: 200,
    audioUrl: "https://www.youtube-nocookie.com/embed/4NRXx6U8ABQ",
  },
];

export const ListenTogetherRoom: React.FC<ListenTogetherRoomProps> = ({ onClose }) => {
  const {
    session,
    playTrack,
    togglePlayPause,
    seek,
    nextTrack,
    prevTrack,
    addToQueue,
    removeFromQueue,
    sendChatMessage,
  } = useRealtimeSession();

  const [activeTab, setActiveTab] = useState<"queue" | "chat">("queue");
  const [chatInput, setChatInput] = useState("");
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [queueSearch, setQueueSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>(DEFAULT_AVAILABLE_SONGS);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const searchSectionRef = useRef<HTMLDivElement>(null);

  // Auto-play Kutti Story (Thalapathy Vijay) if no active track is loaded when music section opens
  useEffect(() => {
    if (!session.playbackState.currentTrack) {
      const kuttiStoryTrack: Track = DEFAULT_AVAILABLE_SONGS[0];
      playTrack(kuttiStoryTrack);
    }
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchSectionRef.current && !searchSectionRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const playback = session.playbackState;
  const currentTrack = playback.currentTrack;

  // Live YouTube Music Search Engine for ADD SONG TO QUEUE
  useEffect(() => {
    if (!queueSearch.trim()) {
      setSearchResults(DEFAULT_AVAILABLE_SONGS);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/yt-search?q=${encodeURIComponent(queueSearch)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.tracks && data.tracks.length > 0) {
            const formattedTracks: Track[] = data.tracks.map((t: any) => ({
              id: t.id,
              title: t.title,
              artist: t.artist || "YouTube Artist",
              album: t.album || "YouTube Music",
              coverArt: t.cover || `https://img.youtube.com/vi/${t.id}/hqdefault.jpg`,
              duration: 240,
              audioUrl: `https://www.youtube-nocookie.com/embed/${t.id}`,
            }));
            setSearchResults(formattedTracks);
          }
        }
      } catch (e) {
        // Fallback filtering
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [queueSearch]);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pos = parseFloat(e.target.value);
    seek(pos);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput("");
  };

  const handleAddTrack = (track: Track) => {
    addToQueue(track);
    setAddedToast(`Added "${track.title}" to Queue!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 select-none animate-in fade-in duration-300">
      {/* MUSIC ROOM TOP HEADER (SHRUNK BY 30% - SLEEK & COMPACT) */}
      <div className="relative overflow-hidden p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 rounded-2xl text-[#050505] shadow-md shadow-blue-500/5 bg-gradient-to-r from-white via-blue-50/70 to-indigo-50/50 border border-[#1877F2]/25 backdrop-blur-2xl">
        {/* Soft Ambient Mesh Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1877F2]/10 via-purple-500/10 to-pink-500/5 pointer-events-none" />

        <div className="flex items-center gap-2 text-[11px] text-[#65676B] font-semibold relative z-10">
          <span>Host: <strong className="text-[#050505] font-extrabold">{session.host.name}</strong></span>
          <span className="text-[#1877F2]/40 font-bold">•</span>
          <span>Code: <strong className="text-[#1877F2] font-extrabold font-mono bg-[#1877F2]/10 px-1.5 py-0.5 text-[10px] rounded-md border border-[#1877F2]/20">{session.roomCode || "VIBE-8842"}</strong></span>
        </div>

        {/* Live Audience Counters */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="flex -space-x-1.5 overflow-hidden p-0.5">
            {session.participants.map((user) => (
              <img
                key={user.id}
                src={user.avatar}
                alt={user.name}
                className="w-6 h-6 rounded-full border-2 border-white object-cover shadow-sm hover:scale-110 transition-transform"
                title={user.name}
              />
            ))}
          </div>
          <span className="text-[10px] font-extrabold bg-white/90 px-2.5 py-1 rounded-full border border-[#1877F2]/25 text-[#1877F2] shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{session.participants.length} Listening</span>
          </span>
        </div>
      </div>

      {/* ONLINE MUSIC STAGE MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ONLINE PLAYER STAGE (LIGHT THEME AMBIENT CARD) */}
        <div className="lg:col-span-7 relative overflow-hidden p-6 sm:p-8 border border-[#1877F2]/25 flex flex-col justify-between space-y-6 shadow-xl shadow-blue-500/5 rounded-3xl bg-gradient-to-br from-white via-blue-50/70 to-indigo-50/50 text-[#050505] backdrop-blur-2xl">
          {/* Soft Ambient Mesh Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1877F2]/10 via-purple-500/10 to-pink-500/5 pointer-events-none" />

          {/* Floating Emoji Reactions Layer */}
          <FloatingReactions reactions={session.currentReactions} />

          {/* Dynamic Ambient Aura Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-[#1877F2]/20 via-purple-400/20 to-pink-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* YOUTUBE MUSIC PLAYER STAGE */}
          <div className="z-40 my-2 animate-in fade-in duration-200">
            <YouTubeAudioPlayer
              initialVideoId={currentTrack?.id || "GqlGdhjEXNg"}
              isPlaying={playback.isPlaying}
              currentPosition={playback.currentPosition}
            />
          </div>

          {/* SLEEK COMPACT LIGHT THEME CONTROL PANEL */}
          <div className="space-y-2 z-10 bg-white/90 border border-[#1877F2]/20 rounded-2xl p-2.5 sm:p-3 shadow-md backdrop-blur-xl text-[#050505]">
            {/* Progress Scrubber */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={currentTrack?.duration || 200}
                step={0.1}
                value={playback.currentPosition}
                onChange={handleSeekChange}
                className="w-full h-1.5 bg-[#E4E6EB] rounded-lg appearance-none cursor-pointer accent-[#1877F2] focus:outline-none"
              />
              <div className="flex items-center justify-between text-[10px] font-mono text-[#65676B] font-bold px-0.5">
                <span>
                  {Math.floor(playback.currentPosition / 60)}:
                  {Math.floor(playback.currentPosition % 60)
                    .toString()
                    .padStart(2, "0")}
                </span>
                <span>
                  {Math.floor((currentTrack?.duration || 0) / 60)}:
                  {((currentTrack?.duration || 0) % 60)
                    .toString()
                    .padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Uniform Sized Playback Controls Row (Queue, Previous, Play/Pause, Next - Shrunk by 30%) */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 pt-0.5">
              {/* 1. Queue Button (Opens Pop-Up Queue Modal on Click) */}
              <button
                onClick={() => setIsQueueModalOpen(true)}
                className="w-7 h-7 rounded-full bg-[#1877F2] text-white hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center shadow-md shadow-blue-500/20 relative group"
                title={`View & Add Songs to Queue (${session.queue.length})`}
              >
                <ListMusic className="w-3.5 h-3.5 text-white" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-purple-600 text-white font-extrabold text-[8px] flex items-center justify-center border-2 border-white">
                  {session.queue.length}
                </span>
              </button>

              {/* 2. Previous Track Button */}
              <button
                onClick={prevTrack}
                className="w-7 h-7 rounded-full bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6EB] active:scale-95 transition-all shadow-sm border border-[#E4E6EB] flex items-center justify-center"
                title="Previous Track"
              >
                <SkipBack className="w-3.5 h-3.5 fill-[#050505] text-[#050505]" />
              </button>

              {/* 3. Play/Pause Main Button */}
              <button
                onClick={togglePlayPause}
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1877F2] via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30 hover:scale-105 active:scale-95 transition-transform"
                title={playback.isPlaying ? "Pause" : "Play"}
              >
                {playback.isPlaying ? (
                  <Pause className="w-3.5 h-3.5 text-white fill-white" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-white fill-white translate-x-0.5" />
                )}
              </button>

              {/* 4. Next Track Button */}
              <button
                onClick={nextTrack}
                className="w-7 h-7 rounded-full bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6EB] active:scale-95 transition-all shadow-sm border border-[#E4E6EB] flex items-center justify-center"
                title="Next Track"
              >
                <SkipForward className="w-3.5 h-3.5 fill-[#050505] text-[#050505]" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DEDICATED ROOM LIVE CHAT (LIGHT THEME AMBIENT CARD) */}
        <div className="lg:col-span-5 flex flex-col h-[600px]">
          <div className="relative overflow-hidden border border-[#1877F2]/25 rounded-3xl p-5 flex flex-col h-full space-y-4 bg-gradient-to-br from-white via-blue-50/70 to-indigo-50/50 text-[#050505] shadow-xl shadow-blue-500/5 backdrop-blur-2xl">
            {/* Soft Ambient Mesh Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1877F2]/10 via-purple-500/10 to-pink-500/5 pointer-events-none" />

            <div className="flex items-center justify-between border-b border-[#1877F2]/15 pb-3 relative z-10">
              <h3 className="font-extrabold text-sm text-[#050505] flex items-center gap-2">
                <Music className="w-4 h-4 text-[#1877F2]" />
                <span>Room Live Chat</span>
              </h3>
              <span className="text-[11px] font-extrabold text-[#1877F2] bg-white/90 px-2.5 py-1 rounded-full border border-[#1877F2]/20 shadow-sm">
                {session.liveChat?.length || 0} messages
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar relative z-10">
              {(session.liveChat || []).map((msg) => (
                <div key={msg.id} className="p-3.5 rounded-2xl bg-white/80 border border-[#1877F2]/15 shadow-sm space-y-1 hover:border-[#1877F2]/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#1877F2]">{msg.author.name}</span>
                    <span className="text-[10px] font-semibold text-[#65676B]">{msg.time}</span>
                  </div>
                  <p className="text-xs font-medium text-[#050505]">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-[#1877F2]/15 relative z-10">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Chat with room..."
                className="flex-1 bg-white/90 border border-[#1877F2]/20 rounded-xl px-4 py-2.5 text-xs text-[#050505] placeholder-[#65676B] focus:outline-none focus:border-[#1877F2] focus:bg-white transition-colors font-medium shadow-sm"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1877F2] hover:bg-blue-600 rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-blue-500/20 active:scale-95"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* POP-UP QUEUE MODAL WITH LIVE YOUTUBE MUSIC SEARCH (STUNNING LIGHT THEME AMBIENT CARD) */}
      {isQueueModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/80 to-indigo-50/60 border border-[#1877F2]/30 w-full max-w-lg rounded-3xl p-6 text-[#050505] shadow-2xl shadow-blue-500/10 space-y-5 max-h-[85vh] flex flex-col backdrop-blur-2xl">
            {/* Soft Ambient Mesh Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1877F2]/10 via-purple-500/10 to-pink-500/5 pointer-events-none" />
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1877F2]/10 border border-[#1877F2]/30 flex items-center justify-center">
                  <ListMusic className="w-5 h-5 text-[#1877F2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#050505]">Room Music Queue ({session.queue.length})</h3>
                  <p className="text-xs text-[#65676B]">Search YouTube Music to add songs to live queue</p>
                </div>
              </div>
              <button
                onClick={() => setIsQueueModalOpen(false)}
                className="p-2 rounded-xl text-[#65676B] hover:text-[#050505] hover:bg-[#F0F2F5] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Toast */}
            {addedToast && (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{addedToast}</span>
              </div>
            )}

            {/* LIVE YOUTUBE MUSIC SEARCH & ADD SONG TO QUEUE SECTION */}
            <div ref={searchSectionRef} className="space-y-2.5">
              <label className="text-xs font-extrabold text-[#1877F2] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Song to Queue (YouTube Music Search)</span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#65676B] absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={queueSearch}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => {
                    setQueueSearch(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  placeholder="Search song, artist or album on YouTube Music..."
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl pl-10 pr-9 py-2.5 text-xs text-[#050505] placeholder-[#65676B] focus:outline-none focus:border-[#1877F2] focus:bg-white transition-colors font-medium"
                />
                {isSearching ? (
                  <Loader2 className="w-4 h-4 text-[#1877F2] animate-spin absolute right-3 top-3" />
                ) : queueSearch.length > 0 ? (
                  <button
                    onClick={() => setQueueSearch("")}
                    className="absolute right-3 top-3 text-[#65676B] hover:text-[#050505]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>

              {/* Addable YouTube Music Songs List (Only expands when search bar is clicked/focused) */}
              {isSearchFocused && (
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1 no-scrollbar pt-1 animate-in fade-in slide-in-from-top-1 duration-150 border-t border-[#E4E6EB]/60">
                  {searchResults.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => {
                        handleAddTrack(track);
                        setIsSearchFocused(false);
                      }}
                      className="p-2.5 rounded-2xl bg-[#F0F2F5]/80 border border-[#E4E6EB] flex items-center justify-between gap-3 hover:border-[#1877F2] hover:bg-white cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={track.coverArt}
                          alt={track.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#E4E6EB] group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                            {track.title}
                          </p>
                          <p className="text-[11px] text-[#65676B] truncate mt-0.5">{track.artist}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddTrack(track);
                          setIsSearchFocused(false);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-extrabold flex items-center gap-1 shadow-md shadow-blue-500/20 active:scale-95 transition-all shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CURRENT ROOM QUEUE LIST SECTION */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 pt-3 border-t border-[#E4E6EB]">
              <label className="text-xs font-extrabold text-[#65676B] uppercase tracking-wider block">
                Current Room Queue ({session.queue.length})
              </label>

              {session.queue.length === 0 ? (
                <div className="text-center py-6 text-[#65676B] text-xs font-medium">
                  Queue is empty. Search YouTube Music above and tap "+ Add" to queue songs!
                </div>
              ) : (
                session.queue.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#F0F2F5]/80 border border-[#E4E6EB] flex items-center justify-between gap-3 hover:border-rose-500/40 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={item.track.coverArt}
                        alt={item.track.title}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#E4E6EB]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#050505] truncate">{item.track.title}</p>
                        <p className="text-[10px] text-[#65676B] truncate">
                          {item.track.artist} • Added by <strong className="text-purple-600 font-semibold">{item.addedBy.name.split(" ")[0]}</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-500/20 transition-all shrink-0"
                      title="Remove Song from Queue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
