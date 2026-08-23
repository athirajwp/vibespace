"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Headphones,
  ListMusic,
  ListOrdered,
  Plus,
  Search,
  X,
  Check,
  Music,
  Trash2,
  Loader2,
  FolderPlus,
} from "lucide-react";
import { useRealtimeSession } from "@/lib/realtime-store";
import { FloatingReactions } from "./FloatingReactions";
import { QueueManager } from "./QueueManager";
import { YouTubeAudioPlayer } from "./YouTubeAudioPlayer";
import { Track, CustomPlaylist } from "@/types";

interface ListenTogetherRoomProps {
  onClose?: () => void;
}

const DEFAULT_AVAILABLE_SONGS: Track[] = [];

const DEFAULT_PLAYLISTS: CustomPlaylist[] = [
  {
    id: "pl-my-playlist",
    name: "My Playlist",
    description: "Your custom music playlist",
    tracks: [],
    createdAt: 1700000000000,
    isDefault: false,
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
  const [modalTab, setModalTab] = useState<"playlist" | "queue">("playlist");
  const [queueSearch, setQueueSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const searchSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Custom Playlists State & localStorage Persistence
  const [playlists, setPlaylists] = useState<CustomPlaylist[]>(DEFAULT_PLAYLISTS);
  const [activePlaylistId, setActivePlaylistId] = useState<string>("pl-my-playlist");
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vibespace_custom_playlists");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Remove old default "pl-curated" playlist if present
            const cleaned = parsed.filter((p: CustomPlaylist) => p.id !== "pl-curated");
            if (cleaned.length > 0) {
              setPlaylists(cleaned);
            } else {
              setPlaylists(DEFAULT_PLAYLISTS);
            }
          }
        }
        const storedActiveId = localStorage.getItem("vibespace_active_playlist_id");
        if (storedActiveId && storedActiveId !== "pl-curated") {
          setActivePlaylistId(storedActiveId);
        } else {
          setActivePlaylistId("pl-my-playlist");
        }
      } catch (e) {}
    }
  }, []);

  const savePlaylistsToStorage = (updatedPlaylists: CustomPlaylist[]) => {
    setPlaylists(updatedPlaylists);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vibespace_custom_playlists", JSON.stringify(updatedPlaylists));
      } catch (e) {}
    }
  };

  const handleSelectActivePlaylist = (id: string) => {
    setActivePlaylistId(id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vibespace_active_playlist_id", id);
      } catch (e) {}
    }
  };

  const handleCreateNewPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const newPl: CustomPlaylist = {
      id: `pl-${Date.now()}`,
      name: newPlaylistName.trim(),
      description: "Custom user playlist",
      tracks: [],
      createdAt: Date.now(),
      isDefault: false,
    };

    const updated = [...playlists, newPl];
    savePlaylistsToStorage(updated);
    handleSelectActivePlaylist(newPl.id);
    setNewPlaylistName("");
    setIsCreatingPlaylist(false);
    setAddedToast(`Created Playlist "${newPl.name}"! 🎉`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleDeletePlaylist = (playlistId: string) => {
    const plToDelete = playlists.find((p) => p.id === playlistId);
    if (!plToDelete) return;

    const updated = playlists.filter((p) => p.id !== playlistId);
    const fallbackList = updated.length > 0 ? updated : DEFAULT_PLAYLISTS;
    savePlaylistsToStorage(fallbackList);
    handleSelectActivePlaylist(fallbackList[0].id);
    setAddedToast(`Deleted Playlist "${plToDelete.name}"`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleAddTrackToPlaylist = (track: Track, targetPlaylistId: string = activePlaylistId) => {
    const targetPl = playlists.find((p) => p.id === targetPlaylistId);
    if (!targetPl) return;

    // Check if song is already in the target playlist
    const isAlreadyInPlaylist = targetPl.tracks.some(
      (t) => t.id === track.id || t.title.trim().toLowerCase() === track.title.trim().toLowerCase()
    );

    if (isAlreadyInPlaylist) {
      setAddedToast(`"${track.title}" is already in ${targetPl.name}! ⚠️`);
      setTimeout(() => setAddedToast(null), 3000);
      return;
    }

    const updated = playlists.map((pl) => {
      if (pl.id === targetPlaylistId) {
        return { ...pl, tracks: [...pl.tracks, track] };
      }
      return pl;
    });

    savePlaylistsToStorage(updated);
    setAddedToast(`Added "${track.title}" to ${targetPl.name}! 🎵`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleRemoveTrackFromPlaylist = (trackId: string, targetPlaylistId: string = activePlaylistId) => {
    const updated = playlists.map((pl) => {
      if (pl.id === targetPlaylistId) {
        return { ...pl, tracks: pl.tracks.filter((t) => t.id !== trackId) };
      }
      return pl;
    });

    savePlaylistsToStorage(updated);
  };

  const handleAddEntirePlaylistToQueue = (playlist: CustomPlaylist) => {
    if (!playlist.tracks || playlist.tracks.length === 0) {
      setAddedToast(`Playlist "${playlist.name}" is empty! Add songs to it first.`);
      setTimeout(() => setAddedToast(null), 3000);
      return;
    }

    let addedCount = 0;
    playlist.tracks.forEach((track) => {
      const isCurrentlyPlaying = currentTrack?.id === track.id || currentTrack?.title.trim().toLowerCase() === track.title.trim().toLowerCase();
      const isAlreadyInQueue = session.queue.some(
        (item) => item.track.id === track.id || item.track.title.trim().toLowerCase() === track.title.trim().toLowerCase()
      );
      if (!isCurrentlyPlaying && !isAlreadyInQueue) {
        addToQueue(track);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setAddedToast(`Added ${addedCount} song${addedCount > 1 ? "s" : ""} from "${playlist.name}" to Queue! 🎉`);
    } else {
      setAddedToast(`All songs from "${playlist.name}" are already in queue or playing! ℹ️`);
    }
    setTimeout(() => setAddedToast(null), 3000);
  };

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId) || playlists[0] || DEFAULT_PLAYLISTS[0];

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
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/yt-search?q=${encodeURIComponent(queueSearch)}`);
        const data = await res.json();
        if (Array.isArray(data.tracks) && data.tracks.length > 0) {
          const formattedTracks: Track[] = data.tracks.map((t: any) => {
            const videoId = t.id || t.videoId;
            const coverUrl = t.coverArt || t.cover || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300");
            return {
              id: videoId || `yt-${Date.now()}-${Math.random()}`,
              title: t.title || "YouTube Track",
              artist: t.artist || "YouTube Artist",
              album: t.album || "YouTube Music",
              coverArt: coverUrl,
              duration: t.duration || 240,
              audioUrl: t.audioUrl || `https://www.youtube-nocookie.com/embed/${videoId}`,
            };
          });
          setSearchResults(formattedTracks);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

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
    const isCurrentlyPlaying = currentTrack?.id === track.id || currentTrack?.title.trim().toLowerCase() === track.title.trim().toLowerCase();
    const isAlreadyInQueue = session.queue.some(
      (item) => item.track.id === track.id || item.track.title.trim().toLowerCase() === track.title.trim().toLowerCase()
    );

    if (isCurrentlyPlaying) {
      setAddedToast(`"${track.title}" is currently playing! 🎵`);
      setTimeout(() => setAddedToast(null), 3000);
      return;
    }

    if (isAlreadyInQueue) {
      setAddedToast(`"${track.title}" is already in the queue! ⚠️`);
      setTimeout(() => setAddedToast(null), 3000);
      return;
    }

    addToQueue(track);
    setAddedToast(`Added "${track.title}" to Queue! 🎉`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-32 select-none">
      {/* MUSIC ROOM TOP HEADER (SHRUNK BY 30% - SLEEK & COMPACT) */}
      <div className="relative overflow-hidden p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 rounded-2xl text-[#050505] shadow-md shadow-blue-500/5 bg-gradient-to-r from-white via-blue-50/70 to-indigo-50/50 border border-[#1877F2]/25 backdrop-blur-2xl">
        {/* Soft Ambient Mesh Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1877F2]/10 via-purple-500/10 to-pink-500/5 pointer-events-none" />

        <div className="flex items-center gap-2 text-[11px] text-[#65676B] font-semibold relative z-10">
          <span>Host: <strong className="text-[#050505] font-extrabold">{session.host.name}</strong></span>
          <span className="text-[#1877F2]/40 font-bold">•</span>
          <span>Code: <strong className="text-[#1877F2] font-extrabold font-mono bg-[#1877F2]/10 px-1.5 py-0.5 text-[10px] rounded-md border border-[#1877F2]/20">{session.roomCode || "VIBE-8842"}</strong></span>
        </div>

        {/* Live Audience Counters & Playlist Button */}
        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={() => setIsQueueModalOpen(true)}
            className="px-3 py-1 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            title="Open Room Playlist"
          >
            <ListMusic className="w-3.5 h-3.5 text-[#1877F2]" />
            <span>Playlist ({session.queue.length})</span>
          </button>

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

            {/* Single Horizontal Controls Row with High-Clarity Vector Badge Buttons (Matching Image 2) */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 pt-1 px-1">
              {/* 1. Playlist Button (Left - Circular Blue Button with Badge at Top Right) */}
              <button
                onClick={() => {
                  setModalTab("playlist");
                  setIsQueueModalOpen(true);
                }}
                className="w-10 h-10 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white flex items-center justify-center relative shadow-md shadow-blue-500/25 active:scale-95 transition-all shrink-0 group"
                title={`Open Playlist (${activePlaylist.tracks.length} songs)`}
              >
                <ListMusic className="w-5 h-5 text-white stroke-[2.2]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white font-extrabold text-[9px] flex items-center justify-center border-2 border-white shadow-md">
                  {activePlaylist.tracks.length}
                </span>
              </button>

              {/* 2. Centered Playback Controls (Previous, Play/Pause, Next) */}
              <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                {/* Previous Track Button */}
                <button
                  onClick={prevTrack}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6EB] active:scale-95 transition-all shadow-sm border border-[#E4E6EB] flex items-center justify-center"
                  title="Previous Track"
                >
                  <SkipBack className="w-4.5 h-4.5 fill-[#050505] text-[#050505]" />
                </button>

                {/* Play/Pause Main Button */}
                <button
                  onClick={togglePlayPause}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#1877F2] via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30 hover:scale-105 active:scale-95 transition-transform"
                  title={playback.isPlaying ? "Pause" : "Play"}
                >
                  {playback.isPlaying ? (
                    <Pause className="w-5 h-5 text-white fill-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white fill-white translate-x-0.5" />
                  )}
                </button>

                {/* Next Track Button */}
                <button
                  onClick={nextTrack}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6EB] active:scale-95 transition-all shadow-sm border border-[#E4E6EB] flex items-center justify-center"
                  title="Next Track"
                >
                  <SkipForward className="w-4.5 h-4.5 fill-[#050505] text-[#050505]" />
                </button>
              </div>

              {/* 3. Queue Button (Right - Circular Blue Button with Badge at Top Right) */}
              <button
                onClick={() => {
                  setModalTab("queue");
                  setIsQueueModalOpen(true);
                }}
                className="w-10 h-10 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white flex items-center justify-center relative shadow-md shadow-blue-500/25 active:scale-95 transition-all shrink-0 group"
                title={`Open Queue (${session.queue.length} songs)`}
              >
                <ListOrdered className="w-5 h-5 text-white stroke-[2.2]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white font-extrabold text-[9px] flex items-center justify-center border-2 border-white shadow-md">
                  {session.queue.length}
                </span>
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

            {/* Desktop Only Chat Input Form */}
            <form
              onSubmit={handleSendChat}
              className="hidden lg:flex gap-2.5 p-2.5 border-t border-[#1877F2]/20 bg-white/95 backdrop-blur-xl rounded-2xl shadow-sm shrink-0 mt-auto"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Chat with room..."
                className="flex-1 bg-white border border-[#1877F2]/30 rounded-xl px-4 py-2.5 text-xs text-[#050505] placeholder-[#65676B] focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition-all font-medium shadow-sm"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1877F2] hover:bg-blue-600 rounded-xl text-xs font-extrabold text-white transition-all shadow-md shadow-blue-500/25 active:scale-95 shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Fixed Chat Form (100% Fixed directly above Mobile Nav Bar h-16) */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-50 p-2.5 px-3 bg-white/95 backdrop-blur-2xl border-t border-[#1877F2]/30 shadow-2xl">
        <form onSubmit={handleSendChat} className="flex gap-2.5 max-w-xl mx-auto">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Chat with room..."
            className="flex-1 bg-white border border-[#1877F2]/30 rounded-xl px-4 py-2.5 text-xs text-[#050505] placeholder-[#65676B] focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition-all font-medium shadow-sm"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#1877F2] hover:bg-blue-600 rounded-xl text-xs font-extrabold text-white transition-all shadow-md shadow-blue-500/25 active:scale-95 shrink-0"
          >
            Send
          </button>
        </form>
      </div>

      {/* POP-UP QUEUE MODAL WITH LIVE YOUTUBE MUSIC SEARCH (STUNNING LIGHT THEME AMBIENT CARD) */}
      {isQueueModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/80 to-indigo-50/60 border border-[#1877F2]/30 w-full max-w-lg rounded-3xl p-6 text-[#050505] shadow-2xl shadow-blue-500/10 space-y-5 max-h-[85vh] flex flex-col backdrop-blur-2xl">
            {/* Soft Ambient Mesh Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1877F2]/10 via-purple-500/10 to-pink-500/5 pointer-events-none" />
            {/* Modal Header Tabs */}
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3">
              <div className="flex items-center gap-2 p-1 bg-[#F0F2F5] rounded-2xl border border-[#E4E6EB] flex-1 mr-3">
                <button
                  onClick={() => setModalTab("playlist")}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                    modalTab === "playlist"
                      ? "bg-white text-[#1877F2] shadow-sm border border-[#1877F2]/20"
                      : "text-[#65676B] hover:text-[#050505]"
                  }`}
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  <span>Playlist ({activePlaylist.tracks.length})</span>
                </button>

                <button
                  onClick={() => setModalTab("queue")}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                    modalTab === "queue"
                      ? "bg-white text-[#1877F2] shadow-sm border border-[#1877F2]/20"
                      : "text-[#65676B] hover:text-[#050505]"
                  }`}
                >
                  <span>Queue ({session.queue.length})</span>
                </button>
              </div>

              <button
                onClick={() => setIsQueueModalOpen(false)}
                className="p-2 rounded-xl text-[#65676B] hover:text-[#050505] hover:bg-[#F0F2F5] transition-colors shrink-0"
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

            {/* LIVE YOUTUBE MUSIC SEARCH SECTION */}
            <div ref={searchSectionRef} className="space-y-2.5">
              <label className="text-xs font-extrabold text-[#1877F2] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>YouTube Music Search</span>
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
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 no-scrollbar pt-1 animate-in fade-in slide-in-from-top-1 duration-150 border-t border-[#E4E6EB]/60">
                  {searchResults.map((track) => (
                    <div
                      key={track.id}
                      className="p-2.5 rounded-2xl bg-[#F0F2F5]/80 border border-[#E4E6EB] flex items-center justify-between gap-3 hover:border-[#1877F2] hover:bg-white transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={track.coverArt || (track.id ? `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg` : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300")}
                          alt={track.title}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`;
                          }}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#E4E6EB] group-hover:scale-105 transition-transform bg-[#F0F2F5]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                            {track.title}
                          </p>
                          <p className="text-[11px] text-[#65676B] truncate mt-0.5">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTrackToPlaylist(track, activePlaylist.id);
                            setIsSearchFocused(false);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-md shadow-purple-500/20 active:scale-95 transition-all"
                          title={`Add to ${activePlaylist.name}`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Playlist</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTrack(track);
                            setIsSearchFocused(false);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                          title="Add to Live Room Queue"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Queue</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TAB CONTENT: PLAYLIST VS QUEUE */}
            {modalTab === "playlist" ? (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 pt-2 no-scrollbar">
                {/* Playlist Switcher Bar & Create Playlist Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-[#1877F2] uppercase tracking-wider flex items-center gap-1.5">
                      <ListMusic className="w-3.5 h-3.5" />
                      <span>Your Playlists ({playlists.length})</span>
                    </label>

                    <button
                      onClick={() => setIsCreatingPlaylist(!isCreatingPlaylist)}
                      className="px-2.5 py-1 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>+ New Playlist</span>
                    </button>
                  </div>

                  {/* Inline Create Playlist Form */}
                  {isCreatingPlaylist && (
                    <form
                      onSubmit={handleCreateNewPlaylist}
                      className="p-3 rounded-2xl bg-white border border-[#1877F2]/30 shadow-md space-y-2 animate-in fade-in duration-150"
                    >
                      <p className="text-xs font-bold text-[#050505]">Create Custom Playlist</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newPlaylistName}
                          onChange={(e) => setNewPlaylistName(e.target.value)}
                          placeholder="Playlist name (e.g. My Tamil Favorites)..."
                          autoFocus
                          className="flex-1 px-3 py-1.5 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] text-xs text-[#050505] placeholder-[#65676B] focus:outline-none focus:border-[#1877F2] font-medium"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Playlists Horizontal Scroll Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {playlists.map((pl) => (
                      <button
                        key={pl.id}
                        onClick={() => handleSelectActivePlaylist(pl.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 border transition-all ${
                          activePlaylist.id === pl.id
                            ? "bg-[#1877F2] text-white border-[#1877F2] shadow-sm shadow-blue-500/20"
                            : "bg-white text-[#65676B] border-[#E4E6EB] hover:text-[#050505] hover:border-[#1877F2]/40"
                        }`}
                      >
                        <span>{pl.name}</span>
                        <span
                          className={`w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center border ${
                            activePlaylist.id === pl.id
                              ? "bg-purple-600 text-white border-white/40"
                              : "bg-[#F0F2F5] text-[#65676B] border-[#E4E6EB]"
                          }`}
                        >
                          {pl.tracks.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Playlist Header */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E4E6EB]">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#050505] flex items-center gap-2">
                      <span>{activePlaylist.name}</span>
                      <span className="text-[10px] text-[#65676B] font-semibold">({activePlaylist.tracks.length} tracks)</span>
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {activePlaylist.tracks.length > 0 && (
                      <button
                        onClick={() => handleAddEntirePlaylistToQueue(activePlaylist)}
                        className="text-[11px] bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                        title="Add all songs in this playlist to live room queue"
                      >
                        <Plus className="w-3 h-3 text-white" />
                        <span>Add All to Queue</span>
                      </button>
                    )}

                    {!activePlaylist.isDefault && (
                      <button
                        onClick={() => handleDeletePlaylist(activePlaylist.id)}
                        className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete this Playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tracks List of Active Playlist */}
                <div className="space-y-2 pt-1">
                  {activePlaylist.tracks.length === 0 ? (
                    <div className="text-center py-6 text-[#65676B] text-xs font-medium bg-white/60 rounded-2xl border border-dashed border-[#E4E6EB]">
                      Playlist is empty. Search YouTube Music above and tap "+ Playlist" to add songs!
                    </div>
                  ) : (
                    activePlaylist.tracks.map((song) => (
                      <div
                        key={song.id}
                        onClick={() => {
                          playTrack(song);
                          setIsQueueModalOpen(false);
                        }}
                        className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          currentTrack?.id === song.id
                            ? "bg-[#1877F2]/10 border-[#1877F2]"
                            : "bg-[#F0F2F5]/80 border-[#E4E6EB] hover:border-[#1877F2] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={song.coverArt}
                            alt={song.title}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#E4E6EB]"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#050505] truncate">{song.title}</p>
                            <p className="text-[10px] text-[#65676B] truncate">{song.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playTrack(song);
                              setIsQueueModalOpen(false);
                            }}
                            className="p-1.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                            title="Play Now"
                          >
                            <Play className="w-3.5 h-3.5 fill-white text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddTrack(song);
                            }}
                            className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-all"
                            title="Add to Live Queue"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          {!activePlaylist.isDefault && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTrackFromPlaylist(song.id, activePlaylist.id);
                              }}
                              className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Remove from Playlist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 pt-2">
                {/* User's Created Playlists at Top of Queue Tab */}
                <div className="space-y-2 pb-3 border-b border-[#E4E6EB]">
                  <label className="text-xs font-extrabold text-[#1877F2] uppercase tracking-wider flex items-center gap-1.5">
                    <ListMusic className="w-3.5 h-3.5 text-[#1877F2]" />
                    <span>Add Playlist to Queue</span>
                  </label>

                  {playlists.length === 0 ? (
                    <p className="text-[11px] text-[#65676B] font-medium">No playlists found. Create one in Playlist tab!</p>
                  ) : (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {playlists.map((pl) => (
                        <button
                          key={pl.id}
                          onClick={() => handleAddEntirePlaylistToQueue(pl)}
                          className="px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2] hover:text-white border border-[#1877F2]/30 text-[#1877F2] shadow-sm active:scale-95 transition-all group"
                          title={`Click to add all ${pl.tracks.length} songs from "${pl.name}" to live room queue`}
                        >
                          <Plus className="w-3.5 h-3.5 text-[#1877F2] group-hover:text-white" />
                          <span>{pl.name}</span>
                          <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-extrabold text-[9px] flex items-center justify-center border border-white/40">
                            {pl.tracks.length}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <label className="text-xs font-extrabold text-[#65676B] uppercase tracking-wider block">
                  Current Room Queue ({session.queue.length})
                </label>

                {session.queue.length === 0 ? (
                  <div className="text-center py-6 text-[#65676B] text-xs font-medium">
                    Queue is empty. Click a playlist above or search YouTube Music to queue songs!
                  </div>
                ) : (
                  session.queue.map((item) => (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};
