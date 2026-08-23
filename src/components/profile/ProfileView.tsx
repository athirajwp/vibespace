"use client";

import React, { useState } from "react";
import { Headphones, Edit, X, Camera, Check, Plus, Save, Sparkles } from "lucide-react";
import { UserProfile, Track } from "@/types";
import { CURRENT_USER, MOCK_TRACKS } from "@/lib/mock-data";
import { MusicCard } from "../feed/MusicCard";

interface ProfileViewProps {
  user?: UserProfile;
  onPlayTrack: (track: Track) => void;
  onStartListenTogether: (track: Track) => void;
}

const AVAILABLE_GENRES = [
  "Synthwave",
  "Lo-Fi",
  "Tamil Indie",
  "EDM",
  "Acoustic Pop",
  "Rock",
  "Hip-Hop",
  "R&B",
  "Jazz",
  "Classical",
  "Pop",
  "Indie",
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  user = CURRENT_USER,
  onPlayTrack,
  onStartListenTogether,
}) => {
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "music" | "tagged" | "saved">("posts");
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable profile state initialized with passed user
  const [profileData, setProfileData] = useState<UserProfile>({ ...user });

  // Draft state for modal editing
  const [editForm, setEditForm] = useState({
    name: user.name,
    username: user.username,
    bio: user.bio,
    avatar: user.avatar,
    coverImage: user.coverImage || "",
    favoriteGenres: [...user.favoriteGenres],
  });

  const [newGenreInput, setNewGenreInput] = useState("");

  const handleOpenEditModal = () => {
    setEditForm({
      name: profileData.name,
      username: profileData.username,
      bio: profileData.bio,
      avatar: profileData.avatar,
      coverImage: profileData.coverImage || "",
      favoriteGenres: [...profileData.favoriteGenres],
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;

    setProfileData((prev) => ({
      ...prev,
      name: editForm.name.trim(),
      username: editForm.username.trim().replace(/^@/, ""),
      bio: editForm.bio.trim(),
      avatar: editForm.avatar.trim() || prev.avatar,
      coverImage: editForm.coverImage.trim() || prev.coverImage,
      favoriteGenres: editForm.favoriteGenres,
    }));

    setIsEditModalOpen(false);
    setToastMessage("Profile updated successfully! 🎉");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleGenre = (genre: string) => {
    if (editForm.favoriteGenres.includes(genre)) {
      setEditForm((prev) => ({
        ...prev,
        favoriteGenres: prev.favoriteGenres.filter((g) => g !== genre),
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        favoriteGenres: [...prev.favoriteGenres, genre],
      }));
    }
  };

  const handleAddCustomGenre = () => {
    const trimmed = newGenreInput.trim();
    if (!trimmed) return;
    if (!editForm.favoriteGenres.includes(trimmed)) {
      setEditForm((prev) => ({
        ...prev,
        favoriteGenres: [...prev.favoriteGenres, trimmed],
      }));
    }
    setNewGenreInput("");
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditForm((prev) => ({ ...prev, avatar: imageUrl }));
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditForm((prev) => ({ ...prev, coverImage: imageUrl }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-xl font-extrabold text-xs flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Header & Banner */}
      <div className="vibe-card rounded-3xl overflow-hidden border border-[#E4E6EB] relative shadow-sm">
        {/* Cover Image */}
        <div className="h-44 sm:h-56 relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          {profileData.coverImage && (
            <img src={profileData.coverImage} alt="Cover" className="w-full h-full object-cover opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
        </div>

        {/* Profile Details Header */}
        <div className="px-6 sm:px-8 pb-6 -mt-16 sm:-mt-20 relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <img
                src={profileData.avatar}
                alt={profileData.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
              />
              <div>
                <h1 className="font-bold text-2xl text-[#050505] flex items-center justify-center sm:justify-start gap-2">
                  <span>{profileData.name}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1877F2]/15 text-[#1877F2] font-semibold border border-[#1877F2]/30">
                    @{profileData.username}
                  </span>
                </h1>
                <p className="text-xs text-[#65676B] mt-1 max-w-md">{profileData.bio}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {profileData.id !== CURRENT_USER.id ? (
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`py-2.5 px-6 rounded-xl text-xs font-bold transition-all ${
                    isFollowing
                      ? "btn-secondary text-[#050505]"
                      : "btn-primary text-white shadow-md shadow-blue-500/20"
                  }`}
                >
                  {isFollowing ? "Following ✓" : "Follow"}
                </button>
              ) : (
                <button
                  onClick={handleOpenEditModal}
                  className="py-2.5 px-5 rounded-2xl bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-blue-500/25 active:scale-95 transition-all"
                >
                  <Edit className="w-4 h-4 text-white stroke-[2.5]" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-around sm:justify-start sm:gap-8 py-3 border-y border-[#E4E6EB] text-center text-xs font-semibold">
            <div>
              <p className="text-base font-bold text-[#050505]">{profileData.postsCount}</p>
              <p className="text-[#65676B] text-[10px]">Posts</p>
            </div>
            <div>
              <p className="text-base font-bold text-[#050505]">{profileData.followersCount.toLocaleString()}</p>
              <p className="text-[#65676B] text-[10px]">Followers</p>
            </div>
            <div>
              <p className="text-base font-bold text-[#050505]">{profileData.followingCount.toLocaleString()}</p>
              <p className="text-[#65676B] text-[10px]">Following</p>
            </div>
          </div>

          {/* Music Genres & Interests Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-[#65676B] uppercase tracking-widest mr-1">
              Favorite Genres:
            </span>
            {profileData.favoriteGenres.map((g) => (
              <span
                key={g}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20"
              >
                🎵 {g}
              </span>
            ))}
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center border-t border-[#E4E6EB] px-6 overflow-x-auto">
          {(["posts", "media", "music", "tagged", "saved"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all capitalize ${
                activeTab === tab
                  ? "border-[#1877F2] text-[#1877F2]"
                  : "border-transparent text-[#65676B] hover:text-[#050505]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          <MusicCard
            track={MOCK_TRACKS[0]}
            sharedNote="My all time favorite synthwave track!"
            onPlayPreview={onPlayTrack}
            onStartListeningSession={onStartListenTogether}
            onAddToQueue={() => {}}
          />
        </div>
      )}

      {activeTab === "music" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MOCK_TRACKS.map((track) => (
            <div
              key={track.id}
              onClick={() => onPlayTrack(track)}
              className="p-4 rounded-2xl vibe-card flex items-center gap-3 cursor-pointer hover:border-[#1877F2] transition-all"
            >
              <img src={track.coverArt} alt={track.title} className="w-12 h-12 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#050505] truncate">{track.title}</p>
                <p className="text-[10px] text-[#65676B] truncate">{track.artist}</p>
              </div>
              <Headphones className="w-4 h-4 text-[#1877F2]" />
            </div>
          ))}
        </div>
      )}

      {/* POP-UP EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/80 to-indigo-50/60 border border-[#1877F2]/30 w-full max-w-lg rounded-3xl text-[#050505] shadow-2xl shadow-blue-500/10 max-h-[90vh] flex flex-col backdrop-blur-2xl">
            {/* Ambient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1877F2]/10 via-purple-500/10 to-pink-500/5 pointer-events-none" />

            {/* Modal Header */}
            <div className="p-5 border-b border-[#E4E6EB] flex items-center justify-between relative z-10 bg-white/80">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/30 flex items-center justify-center">
                  <Edit className="w-4.5 h-4.5 text-[#1877F2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#050505]">Edit Profile</h3>
                  <p className="text-[11px] text-[#65676B] font-semibold">Update your profile info & music taste</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Scrollable Body */}
            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-5 relative z-10 no-scrollbar">
              {/* Cover Photo & Avatar Picker */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold text-[#65676B] uppercase tracking-wider block">
                  Profile Media
                </label>
                <div className="relative rounded-2xl overflow-hidden h-32 bg-gradient-to-r from-blue-600 to-purple-600 border border-[#1877F2]/30 group">
                  {editForm.coverImage && (
                    <img src={editForm.coverImage} alt="Cover Preview" className="w-full h-full object-cover opacity-80" />
                  )}
                  <label className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white cursor-pointer hover:bg-black/80 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-md">
                    <Camera className="w-4 h-4" />
                    <span>Change Cover</span>
                    <input type="file" accept="image/*" onChange={handleCoverFileChange} className="hidden" />
                  </label>

                  {/* Avatar Picker Overlay */}
                  <div className="absolute -bottom-2 left-4 flex items-center gap-3">
                    <div className="relative group/avatar">
                      <img
                        src={editForm.avatar}
                        alt="Avatar Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg bg-white"
                      />
                      <label className="absolute inset-0 rounded-full bg-black/50 text-white cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-5 h-5" />
                        <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
                      </label>
                    </div>
                    <span className="text-xs font-bold text-white drop-shadow-md bg-black/40 px-2.5 py-1 rounded-lg">
                      Click image to upload
                    </span>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#050505] flex items-center justify-between">
                  <span>Display Name</span>
                  <span className="text-[10px] text-[#65676B] font-semibold">{editForm.name.length}/50</span>
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter your name..."
                  className="w-full bg-white border border-[#1877F2]/30 rounded-xl px-4 py-2.5 text-xs text-[#050505] font-bold focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition-all shadow-xs"
                  required
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#050505]">Username</label>
                <div className="flex items-center gap-2 bg-white border border-[#1877F2]/30 rounded-xl px-3 py-2 text-xs font-bold shadow-xs">
                  <span className="text-[#1877F2]">@</span>
                  <input
                    type="text"
                    maxLength={30}
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    placeholder="username"
                    className="w-full bg-transparent text-[#050505] font-bold focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#050505] flex items-center justify-between">
                  <span>Bio / Status</span>
                  <span className="text-[10px] text-[#65676B] font-semibold">{editForm.bio.length}/160</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={160}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Write a short bio about your music taste & vibes..."
                  className="w-full bg-white border border-[#1877F2]/30 rounded-xl p-3 text-xs text-[#050505] font-medium focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition-all shadow-xs resize-none"
                />
              </div>

              {/* Image URLs (Optional Direct Links) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-[#65676B]">Avatar Image URL</label>
                  <input
                    type="url"
                    value={editForm.avatar}
                    onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-white border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505] font-medium focus:outline-none focus:border-[#1877F2]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-[#65676B]">Cover Image URL</label>
                  <input
                    type="url"
                    value={editForm.coverImage}
                    onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-white border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505] font-medium focus:outline-none focus:border-[#1877F2]"
                  />
                </div>
              </div>

              {/* Favorite Music Genres Selection */}
              <div className="space-y-2.5 pt-2 border-t border-[#E4E6EB]">
                <label className="text-xs font-extrabold text-[#1877F2] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#1877F2]" />
                  <span>Favorite Music Genres</span>
                </label>

                {/* Selected Genres List */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {editForm.favoriteGenres.map((genre) => (
                    <span
                      key={genre}
                      className="text-xs font-bold px-3 py-1 rounded-full bg-[#1877F2] text-white flex items-center gap-1.5 shadow-sm"
                    >
                      <span>🎵 {genre}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleGenre(genre)}
                        className="hover:bg-white/30 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Quick Toggle Popular Genres */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-extrabold text-[#65676B] uppercase tracking-wider block">
                    Quick Add Genres:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {AVAILABLE_GENRES.map((genre) => {
                      const isSelected = editForm.favoriteGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleToggleGenre(genre)}
                          className={`text-xs font-extrabold px-3 py-1 rounded-full border transition-all ${
                            isSelected
                              ? "bg-[#1877F2]/15 text-[#1877F2] border-[#1877F2]"
                              : "bg-white text-[#65676B] border-[#E4E6EB] hover:border-[#1877F2]/40 hover:text-[#050505]"
                          }`}
                        >
                          {isSelected ? `✓ ${genre}` : `+ ${genre}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Genre Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newGenreInput}
                    onChange={(e) => setNewGenreInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomGenre();
                      }
                    }}
                    placeholder="Type a custom genre (e.g. Tamil Folk)..."
                    className="flex-1 bg-white border border-[#1877F2]/30 rounded-xl px-3.5 py-2 text-xs text-[#050505] placeholder-[#65676B] focus:outline-none focus:border-[#1877F2]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomGenre}
                    className="px-4 py-2 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] text-xs font-bold border border-[#E4E6EB] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4E6EB]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
