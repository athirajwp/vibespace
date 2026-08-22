"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Play, ExternalLink, Music, Volume2 } from "lucide-react";

interface SpotifyEmbedProps {
  initialTrackId?: string;
  isPlaying?: boolean;
  onSelectTrackId?: (trackId: string) => void;
}

// Sample Spotify Tracks with Direct MP3 Audio Stream Fallbacks for guaranteed playback
export const SPOTIFY_AUDIO_STREAMS: Record<string, { title: string; artist: string; audioUrl: string; cover: string }> = {
  "0VjIjW4GlUZAMYd2vXMi3b": {
    title: "Blinding Lights",
    artist: "The Weeknd",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600",
  },
  "4cOdK2wGLETKBW3PvgPWqT": {
    title: "Never Gonna Give You Up",
    artist: "Rick Astley",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600",
  },
};

export const SpotifyEmbed: React.FC<SpotifyEmbedProps> = ({
  initialTrackId = "0VjIjW4GlUZAMYd2vXMi3b",
  isPlaying = true,
  onSelectTrackId,
}) => {
  const [trackInput, setTrackInput] = useState("");
  const [activeTrackId, setActiveTrackId] = useState(initialTrackId);
  const audioRef = useRef<HTMLAudioElement>(null);

  const activeStream = SPOTIFY_AUDIO_STREAMS[activeTrackId] || {
    title: "Spotify Music Track",
    artist: "Spotify Artist",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600",
  };

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, activeTrackId]);

  const extractTrackId = (input: string) => {
    if (!input) return activeTrackId;
    if (input.includes("spotify.com/track/")) {
      return input.split("spotify.com/track/")[1]?.split("?")[0] || activeTrackId;
    }
    if (input.startsWith("spotify:track:")) {
      return input.replace("spotify:track:", "");
    }
    return input.trim();
  };

  const handleLoadTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractTrackId(trackInput);
    setActiveTrackId(id);
    if (onSelectTrackId) onSelectTrackId(id);
  };

  const handleOpenSpotifyApp = () => {
    window.open(`https://open.spotify.com/track/${activeTrackId}`, "_blank");
  };

  return (
    <div className="space-y-3 select-none">
      {/* Search & URL Input Bar */}
      <form onSubmit={handleLoadTrack} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
          <input
            type="text"
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value)}
            placeholder="Paste Spotify track URL or ID..."
            className="w-full py-2.5 pl-9 pr-3 rounded-2xl bg-slate-900 border border-emerald-500/30 text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-all"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          Load
        </button>
      </form>

      {/* Spotify Direct Launch Action Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-emerald-500/30 text-white">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-extrabold text-white">Spotify Player Mode</span>
        </div>
        <button
          onClick={handleOpenSpotifyApp}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open on Spotify</span>
        </button>
      </div>

      {/* Spotify iFrame Player Widget */}
      <div className="rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl bg-slate-950 my-2">
        <iframe
          src={`https://open.spotify.com/embed/track/${activeTrackId}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="w-full rounded-2xl"
        />
      </div>

      {/* Hidden Audio Stream Engine for System Controls Sync */}
      <audio ref={audioRef} src={activeStream.audioUrl} loop className="hidden" />

      {/* Helpful Hint */}
      <p className="text-[11px] font-semibold text-slate-400 text-center">
        💡 <strong className="text-emerald-400">Tip:</strong> Click the play button inside the Spotify player card above or press system play controls below to listen to audio!
      </p>
    </div>
  );
};
