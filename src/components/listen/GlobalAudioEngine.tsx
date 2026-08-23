"use client";

import React, { useRef, useEffect } from "react";
import { useRealtimeSession } from "@/lib/realtime-store";

export const GlobalAudioEngine: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { session } = useRealtimeSession();

  const playback = session.playbackState;
  const currentTrack = playback.currentTrack;
  const isPlaying = playback.isPlaying;
  const currentPosition = playback.currentPosition;

  const videoId = currentTrack?.id || "GqlGdhjEXNg";
  const isYouTubeTrack =
    Boolean(currentTrack) &&
    (currentTrack?.audioUrl?.includes("youtube") ||
      currentTrack?.audioUrl?.includes("youtu.be") ||
      currentTrack?.id?.length === 11 ||
      !currentTrack?.audioUrl?.endsWith(".mp3"));

  // Synchronize Play / Pause with YouTube Engine
  useEffect(() => {
    if (!iframeRef.current || !isYouTubeTrack) return;
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
  }, [isPlaying, videoId, isYouTubeTrack]);

  // Synchronize Progress Scrubber Seeking (>2s jump) with YouTube Engine
  const prevPositionRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!iframeRef.current || currentPosition === undefined || !isYouTubeTrack) return;
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
  }, [currentPosition, isYouTubeTrack]);

  if (!isYouTubeTrack) return null;

  return (
    <iframe
      ref={iframeRef}
      key={videoId}
      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1`}
      title="Global Persistent YouTube Music Engine"
      width="0"
      height="0"
      allow="autoplay; encrypted-media"
      className="hidden w-0 h-0 absolute pointer-events-none opacity-0"
    />
  );
};
