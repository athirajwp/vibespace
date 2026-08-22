"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Music, Search, Loader2, X } from "lucide-react";
import { QueueItem, Track, UserProfile } from "@/types";

interface QueueManagerProps {
  queue: QueueItem[];
  currentTrack: Track | null;
  currentUser: UserProfile;
  onRemoveTrackFromQueue: (queueItemId: string) => void;
  onAddTrackToQueue: (track: Track) => void;
}

const DEFAULT_TRACKS: Track[] = [
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
];

export const QueueManager: React.FC<QueueManagerProps> = ({
  queue,
  currentTrack,
  currentUser,
  onRemoveTrackFromQueue,
  onAddTrackToQueue,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>(DEFAULT_TRACKS);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(DEFAULT_TRACKS);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/yt-search?q=${encodeURIComponent(searchQuery)}`);
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
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="vibe-card rounded-3xl p-5 flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base theme-text-primary flex items-center gap-2">
            <Music className="w-4 h-4 text-[#1877F2]" />
            <span>Collaborative Queue</span>
          </h3>
          <p className="text-[11px] theme-text-muted">Manage queued tracks live</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-1.5 px-3 rounded-xl btn-primary text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span className="text-white">Add Song</span>
        </button>
      </div>

      {/* Queue Items List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {queue.length === 0 ? (
          <div className="text-center py-8 theme-text-muted text-xs">
            Queue is empty. Click "+ Add Song" to queue up music!
          </div>
        ) : (
          queue.map((item, idx) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl theme-bg-secondary flex items-center justify-between gap-3 theme-border border hover:border-rose-500/40 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={item.track.coverArt}
                  alt={item.track.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold theme-text-primary truncate">{item.track.title}</p>
                  <p className="text-[10px] theme-text-muted truncate">
                    {item.track.artist} • Added by {item.addedBy.name.split(" ")[0]}
                  </p>
                </div>
              </div>

              {/* Remove Song Icon-Only Button */}
              <button
                onClick={() => onRemoveTrackFromQueue(item.id)}
                className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition-all shrink-0"
                title="Remove Song from Queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Track Modal Overlay with YouTube Music Search */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
          <div className="vibe-card w-full max-w-md rounded-3xl p-6 border border-[#1877F2]/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base theme-text-primary flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#1877F2]" />
                <span>Search YouTube Music to Add</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="theme-text-muted hover:theme-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 theme-text-muted absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search YouTube Music songs..."
                className="w-full theme-bg-secondary border theme-border rounded-xl pl-9 pr-8 py-2 text-xs theme-text-primary placeholder:theme-text-muted focus:outline-none focus:border-[#1877F2]"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-[#1877F2] animate-spin absolute right-3 top-2.5" />
              )}
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {searchResults.map((track) => (
                <div
                  key={track.id}
                  onClick={() => {
                    onAddTrackToQueue(track);
                    setShowAddModal(false);
                  }}
                  className="p-2.5 rounded-2xl theme-bg-secondary flex items-center justify-between cursor-pointer hover:border-[#1877F2] border theme-border transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={track.coverArt}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold theme-text-primary truncate group-hover:text-[#1877F2]">{track.title}</p>
                      <p className="text-[10px] theme-text-muted truncate">{track.artist}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddTrackToQueue(track);
                      setShowAddModal(false);
                    }}
                    className="py-1 px-3 rounded-xl btn-primary text-white text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
