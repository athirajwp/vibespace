"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Headphones,
  Users,
  UserPlus,
  UserMinus,
  Copy,
  Share2,
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
import { MOCK_USERS } from "@/lib/mock-data";

interface ListenTogetherRoomProps {
  onClose?: () => void;
}

export const DEFAULT_PLAYLISTS: CustomPlaylist[] = [
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
    updateCurrentTrackDuration,
    joinSession,
    leaveSession,
  } = useRealtimeSession();

  const [activeTab, setActiveTab] = useState<"queue" | "chat">("queue");
  const [chatInput, setChatInput] = useState("");
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());
  const [modalTab, setModalTab] = useState<"playlist" | "queue">("playlist");
  const [queueSearch, setQueueSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [listenMode, setListenModeState] = useState<"solo" | "group">("group");
  const [sidePanelTab, setSidePanelTab] = useState<"upnext" | "chat">("upnext");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [pendingInvite, setPendingInvite] = useState<{
    id: string;
    name: string;
    username: string;
    avatar: string;
    status: "sending" | "received";
  } | null>(null);
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diffX = touchStartX - e.changedTouches[0].clientX;
    if (diffX > 40) {
      setSidePanelTab("chat");
    } else if (diffX < -40) {
      setSidePanelTab("upnext");
    }
    setTouchStartX(null);
  };

  const scrollToChatBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      try {
        const savedMode = localStorage.getItem("vibespace_listen_mode");
        if (savedMode === "solo" || savedMode === "group") {
          setListenModeState(savedMode);
        }
      } catch (e) {}
    }
  }, []);

  const setListenMode = (mode: "solo" | "group") => {
    setListenModeState(mode);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vibespace_listen_mode", mode);
      } catch (e) {}
    }
  };

  useEffect(() => {
    scrollToChatBottom();
  }, [session.liveChat?.length]);

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

  const playback = session.playbackState;
  const currentTrack = playback.currentTrack;

  // Real YouTube Music Up Next & Recommendations System
  const [ytRecommendations, setYtRecommendations] = useState<Track[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState<boolean>(true);

  const fetchYouTubeRecommendations = async () => {
    setIsLoadingRecs(true);
    try {
      const vidId = currentTrack?.id || "GqlGdhjEXNg";
      const query = currentTrack?.artist && currentTrack?.artist !== "YouTube Artist"
        ? `${currentTrack.artist} hit songs`
        : currentTrack?.title
        ? `${currentTrack.title} song`
        : "popular music songs";

      const res = await fetch(`/api/yt-search?videoId=${encodeURIComponent(vidId)}&q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.tracks && Array.isArray(data.tracks)) {
          const recs: Track[] = data.tracks.map((t: any) => ({
            id: t.id,
            title: t.title,
            artist: t.artist || "YouTube Artist",
            album: t.album || "YouTube Music",
            coverArt: t.cover || `https://i.ytimg.com/vi/${t.id}/hqdefault.jpg`,
            duration: t.duration || 215,
            durationText: t.durationText || "3:30",
            audioUrl: `https://www.youtube-nocookie.com/embed/${t.id}`,
          }));
          setYtRecommendations(recs);
        }
      }
    } catch (e) {
      console.error("Failed to fetch YouTube Music recommendations:", e);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  useEffect(() => {
    fetchYouTubeRecommendations();
  }, [currentTrack?.id]);

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

  // Auto-fetch real track duration from YouTube search API if currentTrack duration is 240 or missing
  useEffect(() => {
    if (currentTrack && (currentTrack.duration === 240 || !currentTrack.duration)) {
      const q = currentTrack.title || currentTrack.id;
      fetch(`/api/yt-search?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.tracks) && data.tracks.length > 0) {
            const match = data.tracks.find((t: any) => t.id === currentTrack.id) || data.tracks[0];
            if (match && match.duration && match.duration !== 240) {
              updateCurrentTrackDuration(match.duration);
            }
          }
        })
        .catch(() => {});
    }
  }, [currentTrack?.id]);

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
              duration: t.duration || 215,
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
    setTimeout(scrollToChatBottom, 50);
  };

  const handleAddTrack = (track: Track) => {
    const isCurrentlyPlaying = currentTrack?.id === track.id || currentTrack?.title.trim().toLowerCase() === track.title.trim().toLowerCase();
    const isAlreadyInPlaylist = activePlaylist.tracks.some(
      (t) => t.id === track.id || t.title.trim().toLowerCase() === track.title.trim().toLowerCase()
    );

    if (isCurrentlyPlaying) {
      setAddedToast(`"${track.title}" is currently playing! 🎵`);
      setTimeout(() => setAddedToast(null), 3000);
      return;
    }

    if (isAlreadyInPlaylist) {
      setAddedToast(`"${track.title}" is already in "${activePlaylist.name}"! ⚠️`);
      setTimeout(() => setAddedToast(null), 3000);
      return;
    }

    handleAddTrackToPlaylist(track, activePlaylist.id);
    setAddedToast(`Added "${track.title}" to "${activePlaylist.name}"! 🎉`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleCopyRoomCode = () => {
    const code = session.roomCode || "VIBE-8842";
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(true);
    setAddedToast(`Copied room code "${code}" to clipboard! 📋`);
    setTimeout(() => setCopiedCode(false), 2000);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleInviteFriend = (friend: any) => {
    setInvitedUserIds((prev) => new Set([...Array.from(prev), friend.id]));
    setPendingInvite({
      id: friend.id,
      name: friend.name,
      username: friend.username,
      avatar: friend.avatar,
      status: "sending",
    });
    setAddedToast(`Sending room invitation to ${friend.name}... 📩`);

    setTimeout(() => {
      setPendingInvite((prev) => (prev ? { ...prev, status: "received" } : null));
    }, 700);
  };

  const handleAcceptInvite = (friend: any) => {
    joinSession(friend);
    setPendingInvite(null);
    setAddedToast(`${friend.name} accepted your invitation & joined the room! 🎵🎉`);
    setTimeout(() => setAddedToast(null), 4000);
  };

  const handleDeclineInvite = (friend: any) => {
    setPendingInvite(null);
    setAddedToast(`${friend.name} declined the room invitation.`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleRemoveFriend = (friend: any) => {
    leaveSession(friend.id);
    setInvitedUserIds((prev) => {
      const next = new Set(Array.from(prev));
      next.delete(friend.id);
      return next;
    });
    setAddedToast(`Removed ${friend.name} from group room 🚪`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handlePlayNextPlaylistTrack = () => {
    if (activePlaylist.tracks.length > 0) {
      const currentIndex = activePlaylist.tracks.findIndex((t) => t.id === currentTrack?.id);
      const nextIndex = (currentIndex + 1) % activePlaylist.tracks.length;
      playTrack(activePlaylist.tracks[nextIndex]);
    } else {
      nextTrack();
    }
  };

  const handlePlayPrevPlaylistTrack = () => {
    if (activePlaylist.tracks.length > 0) {
      const currentIndex = activePlaylist.tracks.findIndex((t) => t.id === currentTrack?.id);
      const prevIndex = currentIndex <= 0 ? activePlaylist.tracks.length - 1 : currentIndex - 1;
      playTrack(activePlaylist.tracks[prevIndex]);
    } else {
      prevTrack();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-32 select-none">
      {/* TOP LEVEL MODE SWITCHER BAR: SOLO VIBE vs GROUP ROOM */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-gradient-to-r from-white via-blue-50/70 to-indigo-50/50 rounded-2xl border border-[#1877F2]/25 shadow-md backdrop-blur-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-sm">
          <button
            onClick={() => setListenMode("solo")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm ${
              listenMode === "solo"
                ? "bg-[#1877F2] text-white shadow-md shadow-blue-500/25 active:scale-95 border border-[#1877F2]"
                : "bg-white/80 text-[#65676B] hover:text-[#050505] hover:bg-white border border-[#1877F2]/15"
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Solo Vibe</span>
          </button>

          <button
            onClick={() => setListenMode("group")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm ${
              listenMode === "group"
                ? "bg-[#1877F2] text-white shadow-md shadow-blue-500/25 active:scale-95 border border-[#1877F2]"
                : "bg-white/80 text-[#65676B] hover:text-[#050505] hover:bg-white border border-[#1877F2]/15"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Group Room</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 text-xs font-bold">
          {listenMode === "solo" ? (
            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Solo Music Mode Active 🎧
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[#1877F2] bg-[#1877F2]/10 px-3 py-1 rounded-full border border-[#1877F2]/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#1877F2] animate-pulse" />
              Group Synced Room ({session.participants.length} online) 👥
            </span>
          )}
        </div>
      </div>

      {/* MUSIC ROOM TOP HEADER (GROUP MODE ONLY) */}
      {listenMode === "group" && (
        <div className="relative overflow-hidden p-3 sm:px-4 flex flex-col md:flex-row items-center justify-between gap-3 rounded-2xl text-[#050505] shadow-md shadow-blue-500/5 bg-gradient-to-r from-white via-blue-50/70 to-indigo-50/50 border border-[#1877F2]/25 backdrop-blur-2xl">
          {/* Soft Ambient Mesh Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1877F2]/10 via-purple-500/10 to-pink-500/5 pointer-events-none" />

          {/* Left Side: Host & Room Code Info */}
          <div className="flex items-center gap-2 text-xs text-[#65676B] font-semibold relative z-10 whitespace-nowrap">
            <span>Host: <strong className="text-[#050505] font-extrabold">{session.host.name}</strong></span>
            <span className="text-[#1877F2]/40 font-bold">•</span>
            <span>Code: <strong className="text-[#1877F2] font-extrabold font-mono bg-[#1877F2]/10 px-2 py-0.5 text-xs rounded-md border border-[#1877F2]/20">{session.roomCode || "VIBE-8842"}</strong></span>
          </div>

          {/* Right Side: Action Buttons & Audience Counters */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-2.5 relative z-10">

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex -space-x-2.5 overflow-visible p-0.5 shrink-0 items-center">
                {session.participants.map((user) => (
                  <img
                    key={user.id}
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 sm:w-12 sm:h-12 rounded-full border-2 border-white object-cover shadow-sm hover:scale-110 transition-transform shrink-0 cursor-pointer"
                    onClick={() => setIsInviteModalOpen(true)}
                    title={`${user.name} (Click to manage room members)`}
                  />
                ))}

                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="w-12 h-12 sm:w-12 sm:h-12 rounded-full bg-[#1877F2] hover:bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-lg shadow-blue-500/40 hover:scale-110 active:scale-95 transition-transform shrink-0 relative z-10"
                  title="Add / Remove Friends"
                >
                  <Plus className="w-6 h-6 text-white stroke-[3]" />
                </button>
              </div>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="text-[11px] font-extrabold bg-white/90 hover:bg-blue-50 px-2.5 py-1 rounded-full border border-[#1877F2]/25 text-[#1877F2] shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 transition-all"
                title="Manage Room Members & Invite Friends"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{session.participants.length} Listening</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ONLINE MUSIC STAGE MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ONLINE PLAYER STAGE */}
        <div className="lg:col-span-6 relative overflow-hidden p-6 sm:p-8 border border-[#1877F2]/25 flex flex-col justify-between space-y-6 shadow-xl shadow-blue-500/5 rounded-3xl bg-gradient-to-br from-white via-blue-50/70 to-indigo-50/50 text-[#050505] backdrop-blur-2xl transition-all">
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

            {/* Single Horizontal Controls Row with Playback Controls & Playlist Pill Button */}
            <div className="flex items-center justify-between gap-3 pt-1 px-1">
              {/* Left Side: Playback Controls (Previous, Play/Pause, Next) */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Previous Track Button */}
                <button
                  onClick={handlePlayPrevPlaylistTrack}
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
                  onClick={handlePlayNextPlaylistTrack}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6EB] active:scale-95 transition-all shadow-sm border border-[#E4E6EB] flex items-center justify-center"
                  title="Next Track"
                >
                  <SkipForward className="w-4.5 h-4.5 fill-[#050505] text-[#050505]" />
                </button>
              </div>

              {/* Right Side: Playlist Pill Button (Exact Match to User Mockup) */}
              <button
                onClick={() => setIsQueueModalOpen(true)}
                className="px-3.5 py-2 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] font-extrabold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all whitespace-nowrap shrink-0"
                title={`Open Room Playlist (${activePlaylist.tracks.length} songs)`}
              >
                <ListMusic className="w-4 h-4 text-[#1877F2] stroke-[2.2]" />
                <span className="whitespace-nowrap">Playlist ({activePlaylist.tracks.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE SIDE PANEL (UP NEXT & LIVE CHAT SIDE-BY-SIDE SLIDER) */}
        <div className="lg:col-span-6 flex flex-col h-[560px]">
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative overflow-hidden border border-[#1877F2]/25 rounded-3xl p-5 flex flex-col h-full space-y-4 bg-gradient-to-br from-white via-blue-50/70 to-indigo-50/50 text-[#050505] shadow-xl shadow-blue-500/5 backdrop-blur-2xl"
          >
            {/* Soft Ambient Mesh Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1877F2]/10 via-purple-500/10 to-pink-500/5 pointer-events-none" />

            {/* TOP TAB HEADER (GROUP MODE: UP NEXT & LIVE CHAT SEGMENTED CONTROL | SOLO MODE: UP NEXT HEADER) */}
            <div className="border-b border-[#1877F2]/15 pb-3 relative z-10">
              {listenMode === "group" ? (
                <div className="w-full grid grid-cols-2 gap-1.5 p-1.5 bg-white/90 rounded-2xl border border-[#1877F2]/20 shadow-xs backdrop-blur-xl">
                  <button
                    onClick={() => setSidePanelTab("upnext")}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      sidePanelTab === "upnext"
                        ? "bg-[#1877F2] text-white shadow-md shadow-blue-500/25"
                        : "text-[#65676B] hover:text-[#050505] hover:bg-[#F0F2F5]"
                    }`}
                  >
                    <Music className="w-4 h-4" />
                    <span>Up Next</span>
                  </button>

                  <button
                    onClick={() => setSidePanelTab("chat")}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      sidePanelTab === "chat"
                        ? "bg-[#1877F2] text-white shadow-md shadow-blue-500/25"
                        : "text-[#65676B] hover:text-[#050505] hover:bg-[#F0F2F5]"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Live Chat</span>
                    {session.liveChat?.length ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        sidePanelTab === "chat" ? "bg-white/30 text-white" : "bg-[#1877F2]/15 text-[#1877F2]"
                      }`}>
                        {session.liveChat.length}
                      </span>
                    ) : null}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white/90 rounded-2xl border border-[#1877F2]/20 shadow-xs backdrop-blur-xl text-xs font-extrabold text-[#050505]">
                  <Music className="w-4 h-4 text-[#1877F2]" />
                  <span className="uppercase tracking-wider">Up Next</span>
                </div>
              )}
            </div>

            {/* SLIDING PANELS CONTAINER (UP NEXT & LIVE CHAT SIDE-BY-SIDE WITH SMOOTH TRANSITION) */}
            <div className="flex-1 overflow-hidden relative z-10">
              <div
                className={`${listenMode === "solo" ? "w-full" : "w-[200%]"} h-full flex transition-transform duration-300 ease-out ${
                  sidePanelTab === "upnext" || listenMode === "solo" ? "translate-x-0" : "-translate-x-1/2"
                }`}
              >
                {/* PANEL 1: UP NEXT RECOMMENDED SONGS */}
                <div className={`${listenMode === "solo" ? "w-full pr-0" : "w-1/2 pr-2"} h-full flex flex-col space-y-3`}>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div>
                      <span className="text-[10px] text-[#65676B] block font-medium">Playing from</span>
                      <h4 className="text-xs font-black text-[#050505] truncate max-w-[200px]">
                        {activePlaylist.name || currentTrack?.title || "YouTube"} Mix
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#65676B]">Autoplay</span>
                      <button
                        onClick={() => setAutoplayEnabled(!autoplayEnabled)}
                        className={`w-9 h-4.5 rounded-full p-0.5 transition-colors flex items-center ${
                          autoplayEnabled ? "bg-[#1877F2]" : "bg-[#E4E6EB]"
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform ${
                            autoplayEnabled ? "translate-x-4.5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#65676B] font-semibold px-0.5">
                    <span>Autoplay is {autoplayEnabled ? "on" : "off"}</span>
                    <button
                      onClick={fetchYouTubeRecommendations}
                      disabled={isLoadingRecs}
                      className="text-[#1877F2] hover:underline font-bold flex items-center gap-1"
                    >
                      {isLoadingRecs ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Refresh 🔄</span>}
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar pt-1 border-t border-[#1877F2]/15">
                    {isLoadingRecs ? (
                      <div className="flex items-center justify-center py-8 gap-2 text-xs font-bold text-[#1877F2]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Fetching real recommendations...</span>
                      </div>
                    ) : ytRecommendations.length === 0 ? (
                      <div className="text-center py-6 text-[#65676B] text-xs font-medium bg-[#F0F2F5] rounded-xl border border-[#E4E6EB]">
                        No recommendations found. Click "Refresh 🔄" above!
                      </div>
                    ) : (
                      ytRecommendations.map((song) => {
                        const isAlreadyInPlaylist = activePlaylist.tracks.some(
                          (t) => t.id === song.id || t.title.trim().toLowerCase() === song.title.trim().toLowerCase()
                        );
                        return (
                          <div
                            key={song.id}
                            onClick={() => playTrack(song)}
                            className="p-2 rounded-xl bg-white/80 hover:bg-white border border-[#1877F2]/15 hover:border-[#1877F2]/40 flex items-center justify-between gap-3 cursor-pointer transition-all group shadow-2xs"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <img
                                src={song.coverArt}
                                alt={song.title}
                                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#E4E6EB] group-hover:scale-105 transition-transform"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                                  {song.title}
                                </p>
                                <p className="text-[11px] text-[#65676B] truncate">{song.artist}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-mono font-bold text-[#65676B]">
                                {song.durationText || `${Math.floor((song.duration || 200) / 60)}:${((song.duration || 200) % 60).toString().padStart(2, "0")}`}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddTrack(song);
                                }}
                                disabled={isAlreadyInPlaylist}
                                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                                  isAlreadyInPlaylist
                                    ? "text-emerald-600 bg-emerald-500/10 cursor-default"
                                    : "text-[#050505] hover:bg-[#1877F2]/15 hover:text-[#1877F2]"
                                }`}
                                title={isAlreadyInPlaylist ? "Already in playlist" : `Add to ${activePlaylist.name}`}
                              >
                                {isAlreadyInPlaylist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* PANEL 2: ROOM LIVE CHAT (GROUP MODE ONLY) */}
                {listenMode === "group" && (
                  <div className="w-1/2 h-full flex flex-col space-y-3 pl-2">
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
                      {(session.liveChat || []).length === 0 ? (
                        <div className="text-center py-12 text-xs font-semibold text-[#65676B]">
                          No messages yet. Say hi to the room! 👋
                        </div>
                      ) : (
                        (session.liveChat || []).map((msg) => (
                          <div key={msg.id} className="p-3 rounded-2xl bg-white/90 border border-[#1877F2]/15 shadow-2xs space-y-1 hover:border-[#1877F2]/30 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-[#1877F2]">{msg.author.name}</span>
                              <span className="text-[10px] font-semibold text-[#65676B]">{msg.time}</span>
                            </div>
                            <p className="text-xs font-medium text-[#050505]">{msg.text}</p>
                          </div>
                        ))
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY CHAT INPUT BAR FIXED ABOVE BOTTOM NAV BAR (STAYS IN PLACE ON SCROLL) */}
      {listenMode === "group" && (
        <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 max-w-xl sm:max-w-md mx-auto z-50 p-2 bg-white/95 backdrop-blur-2xl border border-[#1877F2]/30 rounded-2xl shadow-2xl transition-all">
          <form
            onSubmit={handleSendChat}
            className="flex gap-2 items-center"
          >
            <input
              type="text"
              value={chatInput}
              onFocus={() => {
                setSidePanelTab("chat");
                setTimeout(scrollToChatBottom, 50);
              }}
              onClick={() => {
                setSidePanelTab("chat");
                setTimeout(scrollToChatBottom, 50);
              }}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Chat with room..."
              className="flex-1 bg-white border border-[#1877F2]/30 rounded-xl px-4 py-2 text-xs text-[#050505] placeholder-[#65676B] focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition-all font-medium shadow-xs"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-[#1877F2] hover:bg-blue-600 rounded-xl text-xs font-extrabold text-white transition-all shadow-md shadow-blue-500/25 active:scale-95 shrink-0"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* REAL-TIME FRIEND INVITATION POPUP BANNER */}
      {pendingInvite && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] w-full max-w-md px-4 animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="bg-white/95 border-2 border-[#1877F2] p-4.5 rounded-3xl shadow-2xl shadow-blue-500/30 backdrop-blur-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2.5">
              <div className="flex items-center gap-2 text-xs font-black text-[#1877F2]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>INCOMING ROOM INVITATION RESPONDER</span>
              </div>
              <button
                onClick={() => setPendingInvite(null)}
                className="text-[#65676B] hover:text-[#050505] p-1 rounded-full hover:bg-[#F0F2F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={pendingInvite.avatar}
                alt={pendingInvite.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#1877F2] shadow-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-[#050505] truncate">{pendingInvite.name}</h4>
                <p className="text-[11px] text-[#65676B] font-medium leading-tight">
                  {pendingInvite.status === "sending"
                    ? `Sending room invite (${session.roomCode || "VIBE-8842"})...`
                    : `Received invitation to join your Group Listening Room!`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleAcceptInvite(pendingInvite)}
                className="flex-1 py-2.5 px-4 bg-[#1877F2] hover:bg-blue-600 rounded-xl text-xs font-extrabold text-white transition-all shadow-md shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Accept & Join Room 🎵</span>
              </button>
              <button
                onClick={() => handleDeclineInvite(pendingInvite)}
                className="py-2.5 px-4 bg-[#F0F2F5] hover:bg-rose-50 hover:text-rose-600 rounded-xl text-xs font-extrabold text-[#65676B] border border-[#E4E6EB] transition-all active:scale-95"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}



      {/* POP-UP QUEUE MODAL WITH LIVE YOUTUBE MUSIC SEARCH (STUNNING LIGHT THEME AMBIENT CARD) */}
      {isQueueModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/80 to-indigo-50/60 border border-[#1877F2]/30 w-full max-w-lg rounded-3xl p-6 text-[#050505] shadow-2xl shadow-blue-500/10 space-y-5 max-h-[85vh] flex flex-col backdrop-blur-2xl">
            {/* Soft Ambient Mesh Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1877F2]/10 via-purple-500/10 to-pink-500/5 pointer-events-none" />
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/30 flex items-center justify-center">
                  <ListMusic className="w-4 h-4 text-[#1877F2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#050505]">Room Playlists & Music</h3>
                  <p className="text-[10px] text-[#65676B] font-semibold">{activePlaylist.name} ({activePlaylist.tracks.length} songs)</p>
                </div>
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
              <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 relative z-10">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{addedToast}</span>
              </div>
            )}

            {/* LIVE YOUTUBE MUSIC SEARCH SECTION */}
            <div ref={searchSectionRef} className="space-y-2.5 relative z-10">
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

              {/* Addable YouTube Music Songs List */}
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

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddTrackToPlaylist(track, activePlaylist.id);
                          setIsSearchFocused(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-md shadow-blue-500/20 active:scale-95 transition-all shrink-0"
                        title={`Add to ${activePlaylist.name}`}
                      >
                        <Plus className="w-3.5 h-3.5 text-white" />
                        <span>+ Add to Playlist</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DEDICATED PLAYLIST MANAGER CONTENT */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pt-2 no-scrollbar relative z-10">
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

              {/* Tracks List of Active Playlist */}
              <div className="space-y-2 pt-1">
                {activePlaylist.tracks.length === 0 ? (
                  <div className="text-center py-6 text-[#65676B] text-xs font-medium bg-white/60 rounded-2xl border border-dashed border-[#E4E6EB]">
                    Playlist is empty. Search YouTube Music above and tap "+ Add to Playlist" to add songs!
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
                          className="p-1.5 px-3 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1"
                          title="Play Now"
                        >
                          <Play className="w-3.5 h-3.5 fill-white text-white" />
                          <span>Play</span>
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
          </div>
        </div>
      )}

      {/* POP-UP INVITE FRIENDS MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/80 to-indigo-50/60 border border-[#1877F2]/30 w-full max-w-md rounded-3xl p-6 text-[#050505] shadow-2xl shadow-blue-500/10 space-y-5 max-h-[85vh] flex flex-col backdrop-blur-2xl">
            {/* Soft Ambient Mesh Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1877F2]/10 via-purple-500/10 to-pink-500/5 pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/30 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-[#1877F2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#050505]">Invite Friends to Room</h3>
                  <p className="text-[10px] text-[#65676B] font-semibold">Share room code or invite online friends</p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. ROOM CODE QUICK COPY BANNER */}
            <div className="p-3 bg-white/90 rounded-2xl border border-[#1877F2]/25 shadow-sm space-y-2 relative z-10">
              <span className="text-[10px] font-extrabold text-[#65676B] uppercase tracking-wider">Room Share Link & Code</span>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#F0F2F5] rounded-xl border border-[#E4E6EB] flex-1">
                  <span className="text-xs font-mono font-extrabold text-[#1877F2]">{session.roomCode || "VIBE-8842"}</span>
                </div>
                <button
                  onClick={handleCopyRoomCode}
                  className="px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/25 active:scale-95 transition-all shrink-0"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-white" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2. SEARCH FRIENDS INPUT */}
            <div className="relative z-10">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#65676B]" />
              <input
                type="text"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                placeholder="Search friends to add..."
                className="w-full bg-white border border-[#1877F2]/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#050505] placeholder-[#65676B] focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition-all font-medium shadow-sm"
              />
            </div>

            {/* 3. FRIENDS LIST & ROOM MEMBERS */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar relative z-10 max-h-[340px]">
              {/* Current Room Members with REMOVE / KICK Option */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-[#1877F2] uppercase tracking-wider flex items-center justify-between">
                  <span>Current Members ({session.participants.length})</span>
                  <span className="text-[9px] text-[#65676B] lowercase font-medium">click remove to remove friend</span>
                </span>
                <div className="space-y-1.5">
                  {session.participants.map((member) => {
                    const isHost = member.id === session.host.id;
                    const isMe = member.id === "usr-me";
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-white/90 border border-[#1877F2]/20 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#1877F2]/20 shadow-sm"
                            />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-[#050505] flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {isHost && (
                                <span className="text-[9px] font-extrabold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md border border-amber-300">
                                  👑 Host
                                </span>
                              )}
                              {isMe && !isHost && (
                                <span className="text-[9px] font-extrabold bg-blue-100 text-[#1877F2] px-1.5 py-0.5 rounded-md border border-blue-200">
                                  You
                                </span>
                              )}
                            </h4>
                            <p className="text-[10px] font-semibold text-[#65676B]">@{member.username}</p>
                          </div>
                        </div>

                        {!isHost && !isMe && (
                          <button
                            onClick={() => handleRemoveFriend(member)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 text-xs font-extrabold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                            title={`Remove ${member.name} from room`}
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Invite Online Friends List */}
              <div className="space-y-2 pt-2 border-t border-[#E4E6EB]">
                <span className="text-[10px] font-extrabold text-[#65676B] uppercase tracking-wider block">Invite Online Friends</span>
                {MOCK_USERS.filter((u) => u.id !== "usr-me" && !session.participants.some((p) => p.id === u.id) && (
                  !friendSearch.trim() ||
                  u.name.toLowerCase().includes(friendSearch.toLowerCase()) ||
                  u.username.toLowerCase().includes(friendSearch.toLowerCase())
                )).map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/80 border border-[#1877F2]/15 hover:border-[#1877F2]/30 shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#1877F2]/20 shadow-sm"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-[#050505]">{friend.name}</h4>
                        <p className="text-[10px] font-semibold text-[#65676B]">@{friend.username}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleInviteFriend(friend)}
                      className="px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all bg-[#1877F2] hover:bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Invite</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
