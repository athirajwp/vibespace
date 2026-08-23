"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Loader2, X, Play, Plus, Music } from "lucide-react";
import { useRealtimeSession } from "@/lib/realtime-store";
import { Track } from "@/types";

const YouTubeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface YouTubeAudioPlayerProps {
  initialVideoId?: string;
  isPlaying?: boolean;
  currentPosition?: number;
  onSelectVideoId?: (videoId: string) => void;
}

export const YouTubeAudioPlayer: React.FC<YouTubeAudioPlayerProps> = ({
  initialVideoId = "GqlGdhjEXNg",
  isPlaying = true,
  currentPosition,
  onSelectVideoId,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { session, addToQueue, playTrack } = useRealtimeSession();
  const currentTrack = session.playbackState.currentTrack;

  const videoId = currentTrack?.id || initialVideoId || "GqlGdhjEXNg";

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const activeStream = {
    id: videoId,
    title: currentTrack?.title || (videoId === "GqlGdhjEXNg" ? "Kutti Story (From \"Master\")" : "YouTube Music Stream"),
    artist: currentTrack?.artist || "YouTube Artist",
    cover: currentTrack?.coverArt || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live YouTube Music Search Engine
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/yt-search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.tracks || []);
        }
      } catch (e) {
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Synchronize Play / Pause with System Controls
  useEffect(() => {
    if (!iframeRef.current) return;
    const command = isPlaying ? "playVideo" : "pauseVideo";
    const sendMsg = () => {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: command, args: [] }),
          "*"
        );
      } catch (e) {}
    };

    sendMsg();
    const timer = setTimeout(sendMsg, 500);
    return () => clearTimeout(timer);
  }, [isPlaying, videoId]);

  // Synchronize Progress Scrubber Seeking with YouTube Engine
  const prevPositionRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!iframeRef.current || currentPosition === undefined) return;
    const delta = Math.abs(currentPosition - (prevPositionRef.current ?? currentPosition));
    if (prevPositionRef.current === undefined || delta > 2.0) {
      try {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "seekTo", args: [currentPosition, true] }),
          "*"
        );
      } catch (e) {}
    }
    prevPositionRef.current = currentPosition;
  }, [currentPosition]);

  const handleSelectTrack = (trackItem: any) => {
    const track: Track = {
      id: trackItem.id,
      title: trackItem.title,
      artist: trackItem.artist || "YouTube Artist",
      album: trackItem.album || "YouTube Music",
      coverArt: trackItem.cover || `https://img.youtube.com/vi/${trackItem.id}/hqdefault.jpg`,
      duration: 240,
      audioUrl: `https://www.youtube-nocookie.com/embed/${trackItem.id}`,
    };

    if (onSelectVideoId) {
      onSelectVideoId(trackItem.id);
    }
    playTrack(track);
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  const handleAddTrackToQueue = (e: React.MouseEvent, trackItem: any) => {
    e.stopPropagation();
    const track: Track = {
      id: trackItem.id,
      title: trackItem.title,
      artist: trackItem.artist || "YouTube Artist",
      album: trackItem.album || "YouTube Music",
      coverArt: trackItem.cover || `https://img.youtube.com/vi/${trackItem.id}/hqdefault.jpg`,
      duration: 240,
      audioUrl: `https://www.youtube-nocookie.com/embed/${trackItem.id}`,
    };

    addToQueue(track);
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  return (
    <div className="space-y-2.5 select-none relative z-50">
      {/* YOUTUBE MUSIC LIVE SEARCH BAR */}
      <div ref={searchContainerRef} className="relative z-50">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#65676B] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            placeholder="Search YouTube Music (e.g. Kutty Story, Arabic Kuthu)..."
            className="w-full bg-white/95 border border-[#1877F2]/25 rounded-xl pl-8 pr-8 py-2 text-xs text-[#050505] placeholder-[#65676B] focus:outline-none focus:border-[#1877F2] focus:bg-white transition-colors font-medium shadow-sm"
          />
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 text-[#1877F2] animate-spin absolute right-3 top-2.5" />
          ) : searchQuery.length > 0 ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-[#65676B] hover:text-[#050505]"
            >
              <X className="w-3 h-3" />
            </button>
          ) : null}
        </div>

        {/* Live Search Results Dropdown (Expands when typing/focused) */}
        {isSearchFocused && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 border border-[#1877F2]/25 rounded-2xl p-2 text-[#050505] shadow-2xl backdrop-blur-2xl max-h-60 overflow-y-auto space-y-1.5 z-[100] animate-in fade-in slide-in-from-top-1">
            <div className="px-2 py-1 text-[10px] font-extrabold text-[#1877F2] uppercase tracking-wider flex items-center justify-between border-b border-[#E4E6EB]">
              <span>YouTube Music Results</span>
              <span>Tap to Play</span>
            </div>
            {searchResults.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectTrack(t)}
                className="p-2 rounded-xl bg-[#F0F2F5]/80 hover:bg-white border border-[#E4E6EB] hover:border-[#1877F2]/40 flex items-center justify-between gap-2.5 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <img
                    src={t.cover || `https://img.youtube.com/vi/${t.id}/hqdefault.jpg`}
                    alt={t.title}
                    className="w-8 h-8 rounded-lg object-cover shrink-0 border border-[#E4E6EB] group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                      {t.title}
                    </p>
                    <p className="text-[10px] text-[#65676B] truncate">{t.artist || "YouTube Artist"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleSelectTrack(t)}
                    className="p-1.5 rounded-lg bg-[#1877F2] hover:bg-blue-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                    title="Play Now"
                  >
                    <Play className="w-3 h-3 fill-white" />
                  </button>
                  <button
                    onClick={(e) => handleAddTrackToQueue(e, t)}
                    className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                    title="Add to Queue"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPACT YOUTUBE VIDEO THUMBNAIL CARD */}
      <div className="relative w-full aspect-video max-h-36 sm:max-h-40 rounded-xl overflow-hidden border border-red-500/30 shadow-lg shadow-red-500/10 bg-slate-950 group my-1">
        <img
          src={activeStream.cover}
          alt={activeStream.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* YouTube Music Red Badge Overlay */}
        <div className="absolute top-2 right-2 z-20 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md backdrop-blur-md">
          <YouTubeIcon className="w-3 h-3" />
          <span>YouTube Music</span>
        </div>
      </div>
    </div>
  );
};
