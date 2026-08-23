"use client";

import React, { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Video,
  Music,
  Sparkles,
  BarChart2,
  Send,
  X,
  Upload,
  Play,
  Check,
} from "lucide-react";
import { UserProfile, Post, Track } from "@/types";
import { MOCK_TRACKS } from "@/lib/mock-data";

interface CreatePostCardProps {
  user: UserProfile;
  onOpenCreateModal: () => void;
  onAddPost?: (post: Post) => void;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({
  user,
  onOpenCreateModal,
  onAddPost,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [mode, setMode] = useState<"text" | "photo" | "video" | "music" | "poll">("text");

  // Attached Media & Attachments State
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [attachedVideo, setAttachedVideo] = useState<string | null>(null);
  const [attachedTrack, setAttachedTrack] = useState<Track | null>(null);

  // Native File Input Refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Poll State
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOption1, setPollOption1] = useState("");
  const [pollOption2, setPollOption2] = useState("");

  const handlePhotoClick = () => {
    setIsExpanded(true);
    setMode("photo");
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  };

  const handleVideoClick = () => {
    setIsExpanded(true);
    setMode("video");
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachedPhoto(url);
      setAttachedVideo(null);
      setAttachedTrack(null);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachedVideo(url);
      setAttachedPhoto(null);
      setAttachedTrack(null);
    }
  };

  const handleSelectMusic = (track?: Track) => {
    setIsExpanded(true);
    setMode("music");
    setAttachedTrack(track || MOCK_TRACKS[0]);
    setAttachedPhoto(null);
    setAttachedVideo(null);
  };

  const handleSelectPoll = () => {
    setIsExpanded(true);
    setMode("poll");
    if (!pollQuestion) setPollQuestion("What's the best genre for late-night music sessions?");
    if (!pollOption1) setPollOption1("Lo-Fi & Ambient 🎧");
    if (!pollOption2) setPollOption2("Indie & Acoustic 🎸");
  };

  const handleReset = () => {
    setIsExpanded(false);
    setPostContent("");
    setMode("text");
    setAttachedPhoto(null);
    setAttachedVideo(null);
    setAttachedTrack(null);
    setPollQuestion("");
    setPollOption1("");
    setPollOption2("");
  };

  const handleSubmitPost = () => {
    const hasContent = postContent.trim().length > 0;
    const hasMedia = attachedPhoto || attachedVideo || attachedTrack;
    const hasPoll = mode === "poll" && pollQuestion && pollOption1 && pollOption2;

    if (!hasContent && !hasMedia && !hasPoll) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: user,
      createdAt: "Just now",
      content: postContent.trim() || (pollQuestion ? pollQuestion : "Vibing on VibeSpace ✨"),
      media: attachedPhoto
        ? [{ type: "image", url: attachedPhoto }]
        : attachedVideo
        ? [{ type: "video", url: attachedVideo }]
        : undefined,
      musicCard: attachedTrack
        ? {
            track: attachedTrack,
            sharedNote: postContent.trim() || "Check out this song! 🎵",
          }
        : undefined,
      poll: hasPoll
        ? {
            question: pollQuestion,
            options: [
              { id: "opt-1", text: pollOption1, votes: 1 },
              { id: "opt-2", text: pollOption2, votes: 0 },
            ],
            totalVotes: 1,
            userVotedOptionId: "opt-1",
          }
        : undefined,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isSaved: false,
    };

    if (onAddPost) {
      onAddPost(newPost);
    }

    handleReset();
  };

  return (
    <div className="vibe-card p-3.5 sm:p-4 space-y-3 shadow-sm rounded-3xl border border-[#E4E6EB] bg-white transition-all select-none">
      {/* Hidden Native File Inputs */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoFileChange}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoFileChange}
        className="hidden"
      />

      {/* Top Main Input Bar */}
      <div className="flex items-start gap-3">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-[#1877F2]/30 shrink-0"
        />

        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex-1 py-2.5 px-4 rounded-full bg-[#F0F2F5] text-left text-xs font-medium text-[#65676B] hover:bg-[#E4E6EB] transition-colors border border-transparent hover:border-[#1877F2]/30"
          >
            <span>What's on your mind, {user.name.split(" ")[0]}?</span>
          </button>
        ) : (
          <div className="flex-1 space-y-3 animate-in fade-in duration-200">
            {/* Main Textarea */}
            <div className="relative">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder={`What's on your mind, ${user.name.split(" ")[0]}? Share thoughts, music vibes, or moments...`}
                rows={3}
                autoFocus
                className="w-full p-3 rounded-2xl bg-[#F0F2F5] text-xs sm:text-sm font-medium text-[#050505] placeholder-[#65676B] focus:outline-none border border-[#1877F2]/40 focus:border-[#1877F2] resize-none transition-all"
              />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 p-1 rounded-full text-[#65676B] hover:text-[#050505] hover:bg-[#E4E6EB]"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ATTACHED MEDIA PREVIEW PANELS */}
            {/* 1. Photo Attachment & Upload Area */}
            {mode === "photo" && (
              <div className="space-y-2">
                {attachedPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#E4E6EB] max-h-56 bg-black/5">
                    <img src={attachedPhoto} alt="Uploaded Photo" className="w-full h-full object-cover max-h-56" />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        onClick={handlePhotoClick}
                        className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold hover:bg-black flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                      <button
                        onClick={() => setAttachedPhoto(null)}
                        className="p-1 rounded-full bg-black/60 text-white hover:bg-black"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={handlePhotoClick}
                    className="p-6 rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/5 flex flex-col items-center justify-center cursor-pointer transition-all gap-2 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-700">Click to Upload Photo</p>
                      <p className="text-[10px] text-[#65676B]">Supports JPG, PNG, WEBP, GIF</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Video Attachment & Upload Area */}
            {mode === "video" && (
              <div className="space-y-2">
                {attachedVideo ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#E4E6EB] max-h-56 bg-black">
                    <video src={attachedVideo} controls className="w-full max-h-56 object-contain" />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        onClick={handleVideoClick}
                        className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold hover:bg-black flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                      <button
                        onClick={() => setAttachedVideo(null)}
                        className="p-1 rounded-full bg-black/60 text-white hover:bg-black"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={handleVideoClick}
                    className="p-6 rounded-2xl border-2 border-dashed border-pink-500/40 hover:border-pink-500 bg-pink-500/5 flex flex-col items-center justify-center cursor-pointer transition-all gap-2 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-600">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-pink-700">Click to Upload Video</p>
                      <p className="text-[10px] text-[#65676B]">Supports MP4, MOV, WEBM</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Music Track Picker & Preview */}
            {mode === "music" && (
              <div className="p-3 rounded-2xl bg-[#1877F2]/5 border border-[#1877F2]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1877F2] flex items-center gap-1.5">
                    <Music className="w-4 h-4" />
                    <span>Select Track</span>
                  </span>
                  {attachedTrack && (
                    <button onClick={() => setAttachedTrack(null)} className="text-xs text-[#65676B]">
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {MOCK_TRACKS.map((t) => {
                    const isSelected = attachedTrack?.id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setAttachedTrack(t)}
                        className={`p-2 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-white border-[#1877F2] shadow-xs"
                            : "bg-white/60 border-[#E4E6EB] hover:border-[#1877F2]/40"
                        }`}
                      >
                        <img src={t.coverArt} alt={t.title} className="w-9 h-9 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#050505] truncate">{t.title}</p>
                          <p className="text-[10px] text-[#65676B] truncate">{t.artist}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#1877F2]" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Poll Creator Panel */}
            {mode === "poll" && (
              <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4" />
                    <span>Create Poll</span>
                  </span>
                  <button onClick={() => setMode("text")} className="text-xs text-[#65676B]">
                    Remove
                  </button>
                </div>

                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Poll Question..."
                  className="w-full p-2.5 rounded-xl bg-white text-xs font-bold border border-[#E4E6EB] focus:outline-none focus:border-amber-500"
                />

                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={pollOption1}
                    onChange={(e) => setPollOption1(e.target.value)}
                    placeholder="Option 1"
                    className="w-full p-2 rounded-xl bg-white text-xs font-medium border border-[#E4E6EB] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={pollOption2}
                    onChange={(e) => setPollOption2(e.target.value)}
                    placeholder="Option 2"
                    className="w-full p-2 rounded-xl bg-white text-xs font-medium border border-[#E4E6EB] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Bottom Bar inside expanded editor */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-semibold text-[#65676B]">
                {postContent.length} / 280
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#65676B] hover:bg-[#F0F2F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPost}
                  disabled={!postContent.trim() && !attachedPhoto && !attachedVideo && !attachedTrack && !pollQuestion}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                    postContent.trim() || attachedPhoto || attachedVideo || attachedTrack || pollQuestion
                      ? "bg-[#1877F2] hover:bg-[#166FE5] text-white shadow-blue-500/25 cursor-pointer active:scale-95"
                      : "bg-[#E4E6EB] text-[#8A8D91] cursor-not-allowed"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Chips Grid */}
      <div className="pt-2 border-t border-[#E4E6EB]/80 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-[#65676B]">
        {/* Photo Button */}
        <button
          onClick={handlePhotoClick}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-xl transition-all ${
            mode === "photo"
              ? "bg-emerald-500/15 text-emerald-600 font-bold"
              : "hover:bg-[#F0F2F5] hover:text-[#050505]"
          }`}
          title="Upload Photo"
        >
          <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="truncate">Photo</span>
        </button>

        {/* Video Button */}
        <button
          onClick={handleVideoClick}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-xl transition-all ${
            mode === "video"
              ? "bg-pink-500/15 text-pink-600 font-bold"
              : "hover:bg-[#F0F2F5] hover:text-[#050505]"
          }`}
          title="Upload Video"
        >
          <Video className="w-4 h-4 text-pink-500 shrink-0" />
          <span className="truncate">Video</span>
        </button>

        {/* Poll Button */}
        <button
          onClick={handleSelectPoll}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-xl transition-all ${
            mode === "poll"
              ? "bg-amber-500/15 text-amber-600 font-bold"
              : "hover:bg-[#F0F2F5] hover:text-[#050505]"
          }`}
          title="Create Poll"
        >
          <BarChart2 className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="truncate">Poll</span>
        </button>
      </div>
    </div>
  );
};
