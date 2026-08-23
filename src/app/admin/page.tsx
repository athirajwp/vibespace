"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  Search,
  CheckCircle2,
  Users,
  Flag,
  Lock,
  ArrowLeft,
  RefreshCw,
  Ban,
  Sparkles,
} from "lucide-react";
import { UserProfile, Post, UserRole } from "@/types";
import { MOCK_USERS, MOCK_POSTS, CURRENT_USER } from "@/lib/mock-data";
import { fetchPostsFromApi } from "@/lib/api";

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<(UserProfile & { isBlocked?: boolean; role?: UserRole })[]>([]);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [blockedUsernames, setBlockedUsernames] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAdminTab, setActiveAdminTab] = useState<"users" | "posts">("users");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Load logged in user
        const savedUser = localStorage.getItem("vibespace_user_profile");
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        } else {
          setCurrentUser(CURRENT_USER);
        }

        // Load blocked spammers set
        const storedBlocked = localStorage.getItem("vibespace_blocked_usernames");
        const blockedSet = new Set<string>(storedBlocked ? JSON.parse(storedBlocked) : []);
        setBlockedUsernames(blockedSet);

        // Load all users (mock + registered)
        const storedAccounts = localStorage.getItem("vibespace_registered_accounts");
        let combined: (UserProfile & { isBlocked?: boolean; role?: UserRole })[] = [...MOCK_USERS];

        if (storedAccounts) {
          const parsed = JSON.parse(storedAccounts);
          if (Array.isArray(parsed)) {
            const usernames = new Set(combined.map((u) => u.username.toLowerCase()));
            parsed.forEach((acc: UserProfile) => {
              if (!usernames.has(acc.username.toLowerCase())) {
                combined.push(acc);
              }
            });
          }
        }

        // Map roles and blocked state
        const hydrated = combined.map((u) => {
          const isOwnerOrAdmin =
            u.username.toLowerCase() === "alex_vibes" ||
            u.username.toLowerCase() === "admin" ||
            u.role === "admin";
          return {
            ...u,
            isBlocked: blockedSet.has(u.username.toLowerCase()),
            role: (isOwnerOrAdmin ? "admin" : "user") as UserRole,
          };
        });

        setUsers(hydrated);

        // Load API posts
        fetchPostsFromApi().then((apiPosts) => {
          if (apiPosts && apiPosts.length > 0) {
            setPosts(apiPosts);
          }
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Check if current user is owner / admin
  const isAdminAuthorized =
    currentUser &&
    (currentUser.username.toLowerCase() === "alex_vibes" ||
      currentUser.username.toLowerCase() === "admin" ||
      currentUser.role === "admin");

  // Toggle Block Spammer
  const handleToggleBlockUser = (usernameToBlock: string) => {
    const cleanUsername = usernameToBlock.toLowerCase();
    setBlockedUsernames((prev) => {
      const next = new Set(Array.from(prev));
      const isCurrentlyBlocked = next.has(cleanUsername);

      if (isCurrentlyBlocked) {
        next.delete(cleanUsername);
        showToast(`Unblocked @${cleanUsername}`);
      } else {
        next.add(cleanUsername);
        showToast(`Blocked spammer @${cleanUsername} 🚫`);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("vibespace_blocked_usernames", JSON.stringify(Array.from(next)));
      }

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.username.toLowerCase() === cleanUsername
            ? { ...u, isBlocked: !isCurrentlyBlocked }
            : u
        )
      );

      return next;
    });
  };

  // Delete User Account
  const handleDeleteUser = (userId: string, targetUsername: string) => {
    if (window.confirm(`Are you sure you want to permanently delete account @${targetUsername}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));

      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("vibespace_registered_accounts");
          if (stored) {
            const parsed = JSON.parse(stored);
            const updated = parsed.filter((u: UserProfile) => u.id !== userId);
            localStorage.setItem("vibespace_registered_accounts", JSON.stringify(updated));
          }
        } catch (e) {}
      }
      showToast(`Permanently deleted account @${targetUsername}`);
    }
  };

  // Delete Spam Post
  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast("Spam post deleted");
  };

  // Toggle Role (ADMIN vs USER)
  const handleToggleRole = (userId: string, targetUsername: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newRole = (u.role === "admin" ? "user" : "admin") as UserRole;
          showToast(`Updated @${targetUsername} role to ${newRole.toUpperCase()}`);
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  // Render loading indicator
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center text-[#050505]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#1877F2]" />
      </div>
    );
  }

  // 403 FORBIDDEN LIGHT THEME PAGE FOR NON-ADMIN USERS
  if (!isAdminAuthorized) {
    return (
      <div className="min-h-screen w-full bg-[#F0F2F5] text-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-md w-full bg-white border border-[#E4E6EB] rounded-3xl p-8 text-center space-y-5 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-extrabold text-2xl text-[#050505]">Access Denied (403)</h1>
            <p className="text-xs text-[#65676B] leading-relaxed font-medium">
              This area is restricted exclusively to the VibeSpace Owner & Authorized Administrators.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
            Logged in as: <span className="font-bold text-[#050505]">@{currentUser?.username || "guest"}</span> (User Role)
          </div>

          <Link
            href="/"
            className="w-full py-3 px-6 rounded-2xl bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to VibeSpace Main Feed</span>
          </Link>
        </div>
      </div>
    );
  }

  // Filter users by search query
  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim().replace(/^@/, "");
    return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  const totalBlockedCount = users.filter((u) => u.isBlocked).length;

  return (
    <div className="min-h-screen w-full bg-[#F0F2F5] text-[#050505] selection:bg-[#1877F2] selection:text-white select-none pb-20">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] bg-[#050505] text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-[#1877F2]/50 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Light Theme Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#E4E6EB] px-6 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1877F2] to-purple-600 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-[#050505]">VibeSpace Admin Portal</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold border border-emerald-300">
                  SYSTEM ONLINE
                </span>
              </div>
              <p className="text-[11px] text-[#65676B] font-semibold">
                Owner Controls & Platform Moderation
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="py-2.5 px-4 rounded-2xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] text-xs font-extrabold flex items-center gap-2 border border-[#E4E6EB] active:scale-95 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Main Feed</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Light Vibrant Overview Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1877F2] via-indigo-600 to-purple-600 text-white p-6 sm:p-8 shadow-xl shadow-blue-500/15">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                <span>Welcome, {currentUser?.name} 👋</span>
                <span className="text-xs px-3 py-1 rounded-full bg-white/20 text-white font-extrabold border border-white/30 backdrop-blur-md uppercase tracking-wider">
                  Owner / Admin
                </span>
              </h2>
              <p className="text-xs text-blue-100 font-medium mt-1 max-w-xl">
                Manage all user accounts, block spammers, delete fake profiles, and moderate community posts.
              </p>
            </div>

            {/* Light Glassmorphism Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/20">
              <div className="p-4 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white/90 text-xs font-bold">
                  <Users className="w-4 h-4 text-white" />
                  <span>Total Members</span>
                </div>
                <p className="text-2xl font-black mt-2 text-white">{users.length}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white/90 text-xs font-bold">
                  <Ban className="w-4 h-4 text-red-200" />
                  <span>Blocked Spammers</span>
                </div>
                <p className="text-2xl font-black text-red-100 mt-2">{totalBlockedCount}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white/90 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Active Members</span>
                </div>
                <p className="text-2xl font-black text-emerald-100 mt-2">
                  {users.length - totalBlockedCount}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white/90 text-xs font-bold">
                  <Flag className="w-4 h-4 text-purple-200" />
                  <span>Feed Posts</span>
                </div>
                <p className="text-2xl font-black text-purple-100 mt-2">{posts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-[#E4E6EB] pb-2">
          <button
            onClick={() => setActiveAdminTab("users")}
            className={`py-2.5 px-5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeAdminTab === "users"
                ? "bg-[#1877F2] text-white shadow-md shadow-blue-500/20"
                : "text-[#65676B] hover:text-[#050505] hover:bg-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manage Users ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("posts")}
            className={`py-2.5 px-5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeAdminTab === "posts"
                ? "bg-[#1877F2] text-white shadow-md shadow-blue-500/20"
                : "text-[#65676B] hover:text-[#050505] hover:bg-white"
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>Feed Moderation ({posts.length})</span>
          </button>
        </div>

        {/* TAB 1: USER MANAGEMENT (LIGHT THEME) */}
        {activeAdminTab === "users" && (
          <div className="bg-white border border-[#E4E6EB] rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-lg text-[#050505] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1877F2]" />
                  <span>User Accounts & Spammer Moderation</span>
                </h3>
                <p className="text-xs text-[#65676B] font-medium mt-0.5">
                  Block spammers, delete fake accounts, or assign admin permissions.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#65676B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user or @username..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#F0F2F5] border border-[#E4E6EB] text-xs font-bold text-[#050505] placeholder-[#65676B] focus:outline-none focus:bg-white focus:border-[#1877F2] shadow-xs"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#E4E6EB]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0F2F5] text-[#65676B] font-extrabold uppercase tracking-wider text-[10px] border-b border-[#E4E6EB]">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E6EB]">
                  {filteredUsers.map((userItem) => {
                    const isBlocked = userItem.isBlocked;
                    const isAdminRole = userItem.role === "admin";
                    const isSelf = userItem.id === currentUser?.id || userItem.username.toLowerCase() === "alex_vibes";

                    return (
                      <tr
                        key={userItem.id}
                        className={`hover:bg-[#F0F2F5]/60 transition-colors ${
                          isBlocked ? "bg-red-50/50" : ""
                        }`}
                      >
                        {/* Avatar & Name */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={userItem.avatar}
                              alt={userItem.name}
                              className="w-10 h-10 rounded-full object-cover border border-[#1877F2]/30 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-[#050505] flex items-center gap-2">
                                <span>{userItem.name}</span>
                                {isSelf && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">
                                    Owner
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-[#65676B]">@{userItem.username}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="p-4">
                          <button
                            disabled={isSelf}
                            onClick={() => handleToggleRole(userItem.id, userItem.username)}
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold border transition-all ${
                              isAdminRole
                                ? "bg-purple-100 text-purple-700 border-purple-300"
                                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                            } ${isSelf ? "cursor-default opacity-80" : ""}`}
                          >
                            {isAdminRole ? "ADMIN" : "USER"}
                          </button>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          {isBlocked ? (
                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-300 inline-flex items-center gap-1.5">
                              <Ban className="w-3 h-3" />
                              <span>BLOCKED (SPAM)</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-300 inline-flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ACTIVE</span>
                            </span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="p-4 text-[#65676B] font-medium">{userItem.joinedDate || "August 2026"}</td>

                        {/* Action Buttons */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Block Spammer Toggle */}
                            <button
                              disabled={isSelf}
                              onClick={() => handleToggleBlockUser(userItem.username)}
                              className={`py-1.5 px-3 rounded.xl font-extrabold text-[11px] flex items-center gap-1.5 active:scale-95 transition-all ${
                                isBlocked
                                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300"
                                  : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                              } ${isSelf ? "opacity-30 cursor-not-allowed" : ""}`}
                            >
                              {isBlocked ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Unblock</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5 text-red-600" />
                                  <span>Block Spammer</span>
                                </>
                              )}
                            </button>

                            {/* Delete User */}
                            <button
                              disabled={isSelf}
                              onClick={() => handleDeleteUser(userItem.id, userItem.username)}
                              className={`p-2 rounded-xl text-red-600 hover:bg-red-100 border border-red-200 transition-colors ${
                                isSelf ? "opacity-30 cursor-not-allowed" : ""
                              }`}
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: FEED MODERATION (LIGHT THEME) */}
        {activeAdminTab === "posts" && (
          <div className="bg-white border border-[#E4E6EB] rounded-3xl p-6 space-y-6 shadow-sm">
            <div>
              <h3 className="font-extrabold text-lg text-[#050505] flex items-center gap-2">
                <Flag className="w-5 h-5 text-[#1877F2]" />
                <span>Feed Content Moderation</span>
              </h3>
              <p className="text-xs text-[#65676B] font-medium mt-0.5">
                Review platform posts and remove spam or abusive content instantly.
              </p>
            </div>

            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-[#F0F2F5] border border-[#E4E6EB] flex items-start justify-between gap-4 hover:border-[#1877F2]/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#1877F2]/30 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#050505] text-xs">{post.author.name}</span>
                        <span className="text-[11px] text-[#65676B]">@{post.author.username}</span>
                        <span className="text-[10px] text-[#65676B]">• {post.createdAt}</span>
                      </div>
                      <p className="text-xs text-[#050505] font-medium">{post.content}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="py-1.5 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-extrabold border border-red-200 flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Post</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
