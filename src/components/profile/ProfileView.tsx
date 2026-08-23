"use client";

import React, { useState, useEffect } from "react";
import { Headphones, Edit, X, Camera, Check, Plus, Save, Sparkles, Play, ListMusic, Bookmark, Music, LogOut, Settings } from "lucide-react";
import { UserProfile, Track, Post, CustomPlaylist } from "@/types";
import { CURRENT_USER, MOCK_TRACKS, MOCK_POSTS } from "@/lib/mock-data";
import { DEFAULT_PLAYLISTS } from "../listen/ListenTogetherRoom";
import { SocialFeed } from "../feed/SocialFeed";
import { MusicCard } from "../feed/MusicCard";
import { getFriendshipStatus, sendFriendRequest, acceptFriendRequest, removeFriend } from "@/lib/friends";

interface ProfileViewProps {
  user?: UserProfile;
  posts?: Post[];
  onPlayTrack: (track: Track) => void;
  onStartListenTogether: (track: Track) => void;
  onUpdateUser?: (updated: UserProfile) => void;
  onOpenCreatePost?: () => void;
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
  onToggleBookmark?: (postId: string) => void;
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
  posts = MOCK_POSTS,
  onPlayTrack,
  onStartListenTogether,
  onUpdateUser,
  onOpenCreatePost,
  onOpenAuth,
  onOpenSettings,
  onToggleBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<"posts" | "music" | "saved">("posts");
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<CustomPlaylist[]>(DEFAULT_PLAYLISTS);

  // Editable profile state initialized with passed user
  const [profileData, setProfileData] = useState<UserProfile>({ ...user });

  useEffect(() => {
    setProfileData(user);
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vibespace_custom_playlists");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUserPlaylists(parsed);
          }
        }
      } catch (e) {}
    }
  }, []);

  // User Posts (posts authored by user or newly posted stories/posts)
  const userPosts = posts.filter(
    (p) => p.author.id === profileData.id || p.author.username === profileData.username
  );

  // Saved Posts (bookmarked by user)
  const savedPosts = posts.filter((p) => p.isSaved);

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

    const updatedUser: UserProfile = {
      ...profileData,
      name: editForm.name.trim(),
      username: editForm.username.trim().replace(/^@/, ""),
      bio: editForm.bio.trim(),
      avatar: editForm.avatar.trim() || profileData.avatar,
      coverImage: editForm.coverImage.trim() || profileData.coverImage,
      favoriteGenres: editForm.favoriteGenres,
    };

    setProfileData(updatedUser);

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("vibespace_user_profile", JSON.stringify(updatedUser));
    }

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
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Url = event.target.result as string;
          setEditForm((prev) => ({ ...prev, avatar: base64Url }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Url = event.target.result as string;
          setEditForm((prev) => ({ ...prev, coverImage: base64Url }));
        }
      };
      reader.readAsDataURL(file);
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

      {/* Beautifully Aligned Centered Profile Card */}
      <div className="vibe-card rounded-3xl border border-[#E4E6EB] p-6 sm:p-8 space-y-5 shadow-sm bg-white text-center">
        {/* Avatar */}
        <div className="relative inline-block mx-auto">
          <img
            src={profileData.avatar}
            alt={profileData.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-[#1877F2]/20 mx-auto transition-transform hover:scale-105"
          />
        </div>

        {/* User Identity Info */}
        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="font-extrabold text-2xl sm:text-3xl text-[#050505] flex items-center justify-center gap-2 flex-wrap">
            <span>{profileData.name}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#1877F2]/10 text-[#1877F2] font-bold border border-[#1877F2]/25">
              @{profileData.username}
            </span>
          </h1>
          {profileData.bio && (
            <p className="text-xs text-[#65676B] font-medium leading-relaxed max-w-sm mx-auto">
              {profileData.bio}
            </p>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap pt-1">
          {profileData.id !== user.id && profileData.username !== user.username ? (
            (() => {
              const status = getFriendshipStatus(user.id, profileData.id);
              return (
                <button
                  onClick={() => {
                    if (status === "none") {
                      sendFriendRequest(user, profileData);
                      setToastMessage(`Friend request sent to @${profileData.username}! 📩`);
                    } else if (status === "pending_received") {
                      acceptFriendRequest(user, profileData);
                      setToastMessage(`Accepted @${profileData.username}'s friend request! 🎉`);
                    } else if (status === "friends") {
                      removeFriend(user.id, profileData.id);
                      setToastMessage(`Removed @${profileData.username} from friends`);
                    } else if (status === "requested") {
                      setToastMessage(`Friend request pending with @${profileData.username}`);
                    }
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className={`h-10 px-6 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all active:scale-95 shadow-sm inline-flex items-center gap-2 ${
                    status === "friends"
                      ? "bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/30"
                      : status === "requested"
                      ? "bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB]"
                      : status === "pending_received"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-[#1877F2] hover:bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  }`}
                >
                  {status === "friends"
                    ? "Friends ✓"
                    : status === "requested"
                    ? "Requested"
                    : status === "pending_received"
                    ? "Accept Request"
                    : "Add Friend"}
                </button>
              );
            })()
          ) : (
            <>
              <button
                onClick={handleOpenEditModal}
                className="h-10 px-5 rounded-2xl bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold text-xs inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Edit className="w-4 h-4 text-white stroke-[2.5]" />
                <span>Edit Profile</span>
              </button>

              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="h-10 px-4 rounded-2xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] border border-[#E4E6EB] font-extrabold text-xs inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-xs active:scale-95 transition-all"
                  title="Open Account Settings"
                >
                  <Settings className="w-4 h-4 text-[#65676B] stroke-[2.5]" />
                  <span>Settings</span>
                </button>
              )}

              {onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="h-10 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-extrabold text-xs inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-xs active:scale-95 transition-all"
                  title="Log Out or Switch Account"
                >
                  <LogOut className="w-4 h-4 text-red-600 stroke-[2.5]" />
                  <span>Log Out</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 py-3 border-y border-[#E4E6EB]">
          <div>
            <p className="text-lg font-black text-[#050505]">{profileData.postsCount}</p>
            <p className="text-[#65676B] text-[11px] font-bold uppercase tracking-wider">Posts</p>
          </div>
          <div>
            <p className="text-lg font-black text-[#050505]">{profileData.followersCount.toLocaleString()}</p>
            <p className="text-[#65676B] text-[11px] font-bold uppercase tracking-wider">Followers</p>
          </div>
          <div>
            <p className="text-lg font-black text-[#050505]">{profileData.followingCount.toLocaleString()}</p>
            <p className="text-[#65676B] text-[11px] font-bold uppercase tracking-wider">Following</p>
          </div>
        </div>

        {/* Music Genres & Interests Tags (Render only if present) */}
        {profileData.favoriteGenres && profileData.favoriteGenres.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-[11px] font-extrabold text-[#65676B] uppercase tracking-wider block w-full sm:w-auto">
              Favorite Genres:
            </span>
            {profileData.favoriteGenres.map((g) => (
              <span
                key={g}
                className="text-xs font-bold px-3 py-1 rounded-full bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/25 shadow-xs"
              >
                🎵 {g}
              </span>
            ))}
          </div>
        )}

        {/* Profile Tabs */}
        <div className="flex items-center border-t border-[#E4E6EB] px-6 overflow-x-auto">
          {(["posts", "music", "saved"] as const).map((tab) => (
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
      {/* 1. POSTS TAB */}
      {activeTab === "posts" && (
        <div className="space-y-5">
          {userPosts.length > 0 ? (
            <SocialFeed
              posts={userPosts}
              currentUser={profileData}
              onPlayTrackPreview={onPlayTrack}
              onStartListeningSession={onStartListenTogether}
              onAddToQueue={onPlayTrack}
              onOpenCreatePost={onOpenCreatePost || (() => {})}
              onToggleBookmark={onToggleBookmark}
            />
          ) : (
            <div className="vibe-card p-8 rounded-3xl bg-white border border-[#E4E6EB] text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#050505]">No posts yet</h3>
                <p className="text-xs text-[#65676B] max-w-sm mx-auto mt-1">
                  Share your music vibes, thoughts, or stories with your friends!
                </p>
              </div>
              {onOpenCreatePost && (
                <button
                  onClick={onOpenCreatePost}
                  className="py-2.5 px-6 rounded-full btn-primary text-white font-extrabold text-xs shadow-md shadow-blue-500/20 inline-flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create Your First Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. MUSIC TAB */}
      {activeTab === "music" && (
        <div className="space-y-6">
          {/* Custom Playlists */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#65676B] flex items-center gap-1.5 px-1">
              <ListMusic className="w-4 h-4 text-[#1877F2]" />
              <span>My Playlists ({userPlaylists.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  className="vibe-card p-4 rounded-2xl bg-white border border-[#E4E6EB] space-y-3 hover:border-[#1877F2]/40 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#1877F2] to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                        🎵
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#050505]">{pl.name}</h4>
                        <p className="text-[10px] text-[#65676B]">{pl.tracks.length} songs • {pl.description || "Custom Playlist"}</p>
                      </div>
                    </div>

                    {pl.tracks.length > 0 && (
                      <button
                        onClick={() => onPlayTrack(pl.tracks[0])}
                        className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-md shadow-blue-500/25 hover:scale-105 active:scale-95 transition-transform"
                        title="Play Playlist"
                      >
                        <Play className="w-4 h-4 text-white fill-white translate-x-0.5" />
                      </button>
                    )}
                  </div>

                  {/* Songs Preview inside Playlist */}
                  {pl.tracks.length > 0 ? (
                    <div className="space-y-1.5 pt-2 border-t border-[#E4E6EB]/60">
                      {pl.tracks.slice(0, 3).map((t) => (
                        <div
                          key={t.id}
                          onClick={() => onPlayTrack(t)}
                          className="flex items-center justify-between p-1.5 rounded-xl hover:bg-[#F0F2F5] cursor-pointer transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={t.coverArt} alt={t.title} className="w-6 h-6 rounded-md object-cover" />
                            <span className="font-semibold text-[#050505] truncate max-w-[160px]">{t.title}</span>
                          </div>
                          <span className="text-[10px] text-[#65676B] font-mono">{t.artist}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#65676B] italic pt-1">No songs added yet. Add songs from Listen Together!</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. SAVED TAB */}
      {activeTab === "saved" && (
        <div className="space-y-5">
          {savedPosts.length > 0 ? (
            <SocialFeed
              posts={savedPosts}
              currentUser={profileData}
              onPlayTrackPreview={onPlayTrack}
              onStartListeningSession={onStartListenTogether}
              onAddToQueue={onPlayTrack}
              onOpenCreatePost={onOpenCreatePost || (() => {})}
              onToggleBookmark={onToggleBookmark}
            />
          ) : (
            <div className="vibe-card p-8 rounded-3xl bg-white border border-[#E4E6EB] text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#050505]">No saved posts yet</h3>
                <p className="text-xs text-[#65676B] max-w-sm mx-auto mt-1">
                  Click the bookmark icon on any post in your feed to save it here for quick access later.
                </p>
              </div>
            </div>
          )}
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
              {/* Avatar Photo Picker */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#65676B] uppercase tracking-wider block">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#F0F2F5] border border-[#E4E6EB]">
                  <div className="relative group/avatar">
                    <img
                      src={editForm.avatar}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#1877F2] shadow-md bg-white"
                    />
                    <label className="absolute inset-0 rounded-full bg-black/50 text-white cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                      <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <label className="py-2 px-4 rounded-xl bg-white hover:bg-[#E4E6EB] text-[#050505] font-extrabold text-xs border border-[#E4E6EB] cursor-pointer inline-flex items-center gap-2 shadow-xs transition-colors">
                      <Camera className="w-4 h-4 text-[#1877F2]" />
                      <span>Upload New Avatar</span>
                      <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
                    </label>
                    <p className="text-[10px] text-[#65676B] mt-1">PNG, JPG or WEBP (Max 5MB)</p>
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
