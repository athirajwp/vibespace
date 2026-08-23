import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, Bell, Headphones, LogOut, UserPlus, UserCheck, X, Check } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { UserProfile } from "@/types";
import { useRealtimeSession } from "@/lib/realtime-store";
import {
  getFriendshipStatus,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  FriendshipStatus,
} from "@/lib/friends";
import { MOCK_USERS } from "@/lib/mock-data";

interface TopNavProps {
  user: UserProfile;
  unreadMessagesCount?: number;
  unreadNotificationsCount: number;
  isListeningActive?: boolean;
  onOpenCreatePost: () => void;
  onOpenMessages?: () => void;
  onOpenNotifications: () => void;
  onOpenListenRoom?: () => void;
  onOpenProfile: () => void;
  onOpenAuth?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  user,
  unreadMessagesCount = 0,
  unreadNotificationsCount = 0,
  isListeningActive = false,
  onOpenCreatePost,
  onOpenMessages,
  onOpenNotifications,
  onOpenListenRoom,
  onOpenProfile,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [friendStatusMap, setFriendStatusMap] = useState<Record<string, FriendshipStatus>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { session } = useRealtimeSession();
  const playback = session.playbackState;
  const currentTrack = playback.currentTrack;

  // Sync friendship statuses
  const refreshFriendStatuses = (usersList: UserProfile[]) => {
    const statusMap: Record<string, FriendshipStatus> = {};
    usersList.forEach((u) => {
      statusMap[u.id] = getFriendshipStatus(user.id, u.id);
    });
    setFriendStatusMap(statusMap);
  };

  // Load real registered accounts & friend status
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedAccounts = localStorage.getItem("vibespace_registered_accounts");
        let list: UserProfile[] = [];
        if (storedAccounts) {
          const parsed = JSON.parse(storedAccounts);
          if (Array.isArray(parsed)) {
            list = parsed;
          }
        }
        setAllUsers(list);
        refreshFriendStatuses(list);
      } catch (e) {}
    }
  }, [searchQuery, isSearchFocused, user.id]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleActionAddFriend = (targetUser: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStatus = friendStatusMap[targetUser.id] || "none";

    if (currentStatus === "none") {
      sendFriendRequest(user, targetUser);
      setToastMsg(`Friend request sent to @${targetUser.username}! 📩`);
    } else if (currentStatus === "pending_received") {
      acceptFriendRequest(user, targetUser);
      setToastMsg(`Accepted @${targetUser.username}'s friend request! 🎉`);
    } else if (currentStatus === "friends") {
      removeFriend(user.id, targetUser.id);
      setToastMsg(`Removed @${targetUser.username} from friends`);
    } else if (currentStatus === "requested") {
      setToastMsg(`Friend request is pending with @${targetUser.username}`);
    }

    refreshFriendStatuses(allUsers);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filter users matching search query (excluding self)
  const filteredUsers = allUsers.filter((u) => {
    if (u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase()) return false;
    if (!searchQuery.trim()) return true; // Show suggestions when focused with empty query
    const q = searchQuery.toLowerCase().trim().replace(/^@/, "");
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.favoriteGenres && u.favoriteGenres.some((g) => g.toLowerCase().includes(q)))
    );
  });

  return (
    <header className="sticky top-0 h-16 bg-white border-b border-[#E4E6EB] px-3 sm:px-6 flex items-center justify-between z-40 select-none shadow-xs transition-colors">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Left: VibeSpace Brand Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <Logo size="md" />
      </div>

      {/* Center: Global Friend & Content Search Bar */}
      <div ref={searchContainerRef} className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8D91]" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            placeholder="Search friends by name or @username..."
            className="w-full pl-10 pr-9 py-2 rounded-full bg-[#F0F2F5] text-xs text-[#050505] placeholder-[#8A8D91] border border-[#E4E6EB] focus:outline-none focus:bg-white focus:border-[#1877F2] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8D91] hover:text-[#050505]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchFocused && (
          <div className="absolute top-12 left-0 right-0 bg-white border border-[#E4E6EB] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3 bg-[#F0F2F5]/80 border-b border-[#E4E6EB] flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-[#65676B] uppercase tracking-wider">
                {searchQuery.trim() ? `Search Results (${filteredUsers.length})` : "Suggested Friends"}
              </span>
              <button
                onClick={() => setIsSearchFocused(false)}
                className="text-[11px] font-bold text-[#1877F2] hover:underline"
              >
                Done
              </button>
            </div>

            <div className="overflow-y-auto p-2 space-y-1 divide-y divide-[#E4E6EB]/50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((friend) => {
                  const status = friendStatusMap[friend.id] || "none";
                  return (
                    <div
                      key={friend.id}
                      onClick={() => {
                        onOpenProfile();
                        setIsSearchFocused(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-[#F0F2F5] flex items-center justify-between cursor-pointer transition-colors pt-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#1877F2]/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#050505] truncate">{friend.name}</p>
                          <p className="text-[10px] text-[#65676B] truncate">@{friend.username}</p>
                        </div>
                      </div>

                      {/* Add Friend Action Button */}
                      <button
                        onClick={(e) => handleActionAddFriend(friend, e)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 ${
                          status === "friends"
                            ? "bg-[#1877F2]/15 text-[#1877F2] border border-[#1877F2]/30 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            : status === "requested"
                            ? "bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB]"
                            : status === "pending_received"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-[#1877F2] text-white hover:bg-blue-600 shadow-xs shadow-blue-500/20"
                        }`}
                      >
                        {status === "friends" ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Friends ✓</span>
                          </>
                        ) : status === "requested" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#65676B]" />
                            <span>Requested</span>
                          </>
                        ) : status === "pending_received" ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Accept</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Add Friend</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-[#65676B]">
                  No people found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Create Post Button: Facebook Blue with White Text */}
        <button
          onClick={onOpenCreatePost}
          className="hidden sm:flex px-3.5 py-1.5 rounded-full btn-primary text-white text-xs font-semibold items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5] text-white" />
          <span className="text-white">Create</span>
        </button>

        {/* Top Music Player Vinyl Disc Button (Moved from bottom right as requested) */}
        {currentTrack && (
          <button
            onClick={onOpenListenRoom}
            className="flex items-center gap-2 p-1 pr-3 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/30 hover:border-[#1877F2] text-[#1877F2] transition-all shadow-xs group shrink-0 active:scale-95"
            title={`Now Playing: ${currentTrack.title} by ${currentTrack.artist}`}
          >
            {/* Spinning Album Art Cover */}
            <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-[#1877F2]/40">
              <img
                src={currentTrack.coverArt}
                alt={currentTrack.title}
                className={`w-full h-full object-cover ${
                  playback.isPlaying ? "vinyl-rotation" : "vinyl-rotation-paused"
                }`}
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>

            <div className="hidden sm:flex flex-col text-left min-w-0 max-w-[110px]">
              <span className="text-[11px] font-bold text-[#050505] truncate leading-tight group-hover:text-[#1877F2] transition-colors">
                {currentTrack.title}
              </span>
              <span className="text-[9px] text-[#65676B] truncate">
                {currentTrack.artist}
              </span>
            </div>

            <Headphones className="w-3.5 h-3.5 text-[#1877F2] animate-pulse shrink-0 ml-0.5" />
          </button>
        )}

        {/* Mobile Search Launcher Button */}
        <button
          onClick={() => setIsMobileSearchOpen(true)}
          className="md:hidden p-2.5 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] transition-colors shadow-xs shrink-0"
          title="Search Friends"
        >
          <Search className="w-4.5 h-4.5 text-[#050505]" />
        </button>

        {/* Notifications Launcher */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] transition-colors shadow-xs shrink-0"
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#1877F2] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>

      {/* FULL MOBILE SEARCH OVERLAY MODAL */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-[350] bg-white flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">
          {/* Mobile Search Header */}
          <div className="p-3.5 border-b border-[#E4E6EB] flex items-center gap-3 bg-white shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8D91]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends by name or @username..."
                className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#F0F2F5] text-xs font-bold text-[#050505] placeholder-[#8A8D91] border border-[#E4E6EB] focus:outline-none focus:border-[#1877F2]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8D91] hover:text-[#050505]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="py-2 px-3 text-xs font-extrabold text-[#1877F2] hover:bg-blue-50 rounded-xl"
            >
              Cancel
            </button>
          </div>

          {/* Mobile Search Results Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F0F2F5]">
            <span className="text-[11px] font-extrabold text-[#65676B] uppercase tracking-wider block px-1">
              {searchQuery.trim() ? `Search Results (${filteredUsers.length})` : "Suggested Friends"}
            </span>

            <div className="space-y-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((friend) => {
                  const status = friendStatusMap[friend.id] || "none";
                  return (
                    <div
                      key={friend.id}
                      onClick={() => {
                        onOpenProfile();
                        setIsMobileSearchOpen(false);
                      }}
                      className="p-3 rounded-2xl bg-white border border-[#E4E6EB] flex items-center justify-between shadow-xs active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-11 h-11 rounded-full object-cover border border-[#1877F2]/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#050505] truncate">{friend.name}</p>
                          <p className="text-[10px] text-[#65676B] truncate">@{friend.username}</p>
                        </div>
                      </div>

                      {/* Add Friend Action Button */}
                      <button
                        onClick={(e) => handleActionAddFriend(friend, e)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 ${
                          status === "friends"
                            ? "bg-[#1877F2]/15 text-[#1877F2] border border-[#1877F2]/30"
                            : status === "requested"
                            ? "bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB]"
                            : status === "pending_received"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-[#1877F2] text-white shadow-md shadow-blue-500/20"
                        }`}
                      >
                        {status === "friends" ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Friends ✓</span>
                          </>
                        ) : status === "requested" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#65676B]" />
                            <span>Requested</span>
                          </>
                        ) : status === "pending_received" ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Accept</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Add Friend</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-[#65676B] bg-white rounded-2xl border border-[#E4E6EB]">
                  No people found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
