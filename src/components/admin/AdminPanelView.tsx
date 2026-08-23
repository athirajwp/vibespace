"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  Search,
  AlertTriangle,
  CheckCircle2,
  Users,
  Flag,
  Sparkles,
  Ban,
} from "lucide-react";
import { UserProfile, Post } from "@/types";
import { MOCK_USERS, MOCK_POSTS } from "@/lib/mock-data";

interface AdminPanelViewProps {
  currentUser: UserProfile;
  posts: Post[];
  onDeletePost?: (postId: string) => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  currentUser,
  posts,
  onDeletePost,
}) => {
  const [users, setUsers] = useState<(UserProfile & { isBlocked?: boolean; role?: string })[]>([]);
  const [blockedUsernames, setBlockedUsernames] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load all registered accounts + mock users
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedBlocked = localStorage.getItem("vibespace_blocked_usernames");
        const blockedSet = new Set<string>(storedBlocked ? JSON.parse(storedBlocked) : []);
        setBlockedUsernames(blockedSet);

        const storedAccounts = localStorage.getItem("vibespace_registered_accounts");
        let combined: (UserProfile & { isBlocked?: boolean; role?: string })[] = [...MOCK_USERS];

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

        // Apply blocked flag from storage
        const hydrated = combined.map((u) => ({
          ...u,
          isBlocked: blockedSet.has(u.username.toLowerCase()),
          role: u.username.toLowerCase() === "alex_vibes" || u.username.toLowerCase() === "admin" ? "admin" : "user",
        }));

        setUsers(hydrated);
      } catch (e) {}
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Toggle Block Spammer status
  const handleToggleBlockUser = (usernameToBlock: string, targetName: string) => {
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

      // Sync state
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

  // Toggle Role (Admin vs User)
  const handleToggleRole = (userId: string, targetUsername: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newRole = u.role === "admin" ? "user" : "admin";
          showToast(`Updated @${targetUsername} role to ${newRole.toUpperCase()}`);
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  // Filtered users matching search
  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim().replace(/^@/, "");
    return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  const totalBlockedCount = users.filter((u) => u.isBlocked).length;

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] bg-[#050505] text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-[#1877F2]/40 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Admin Panel Header */}
      <div className="vibe-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-md">
              <ShieldAlert className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-black text-xl sm:text-2xl flex items-center gap-2">
                <span>Administrator Dashboard</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-extrabold border border-indigo-400/30 uppercase tracking-wider">
                  Admin
                </span>
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Manage user accounts, block spammers, and moderate community content.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Total Members</span>
            </div>
            <p className="text-xl font-black mt-1">{users.length}</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <Ban className="w-4 h-4 text-red-400" />
              <span>Blocked Spammers</span>
            </div>
            <p className="text-xl font-black text-red-400 mt-1">{totalBlockedCount}</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Active Accounts</span>
            </div>
            <p className="text-xl font-black text-emerald-400 mt-1">{users.length - totalBlockedCount}</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <Flag className="w-4 h-4 text-amber-400" />
              <span>Total Posts</span>
            </div>
            <p className="text-xl font-black text-amber-400 mt-1">{posts.length}</p>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="vibe-card p-6 rounded-3xl bg-white border border-[#E4E6EB] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-[#050505] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1877F2]" />
              <span>User & Spammer Management</span>
            </h3>
            <p className="text-xs text-[#65676B]">
              Search accounts to block spammers, assign admin status, or delete accounts.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#65676B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or @username..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] text-xs font-bold text-[#050505] placeholder-[#65676B] focus:outline-none focus:border-[#1877F2]"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#E4E6EB]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F2F5] text-[#65676B] font-extrabold uppercase tracking-wider text-[10px] border-b border-[#E4E6EB]">
              <tr>
                <th className="p-3.5">User Profile</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E6EB]">
              {filteredUsers.map((userItem) => {
                const isBlocked = userItem.isBlocked;
                const isAdmin = userItem.role === "admin";
                const isSelf = userItem.id === currentUser.id;

                return (
                  <tr key={userItem.id} className={`hover:bg-[#F0F2F5]/60 transition-colors ${isBlocked ? "bg-red-50/40" : ""}`}>
                    {/* User Info */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={userItem.avatar}
                          alt={userItem.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#1877F2]/30 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-[#050505] flex items-center gap-1.5">
                            <span>{userItem.name}</span>
                            {isSelf && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-[#65676B]">@{userItem.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-3.5">
                      <button
                        disabled={isSelf}
                        onClick={() => handleToggleRole(userItem.id, userItem.username)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-all ${
                          isAdmin
                            ? "bg-purple-100 text-purple-700 border-purple-300"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        {isAdmin ? "ADMIN" : "USER"}
                      </button>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5">
                      {isBlocked ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-300 inline-flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          <span>BLOCKED (SPAM)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-300 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="p-3.5 text-[#65676B] font-medium">{userItem.joinedDate || "August 2026"}</td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Block Spammer Button */}
                        <button
                          disabled={isSelf}
                          onClick={() => handleToggleBlockUser(userItem.username, userItem.name)}
                          className={`py-1.5 px-3 rounded-xl font-extrabold text-[11px] flex items-center gap-1.5 active:scale-95 transition-all ${
                            isBlocked
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300"
                              : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                          } ${isSelf ? "opacity-40 cursor-not-allowed" : ""}`}
                          title={isBlocked ? "Unblock Account" : "Block Spammer"}
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

                        {/* Delete Account Button */}
                        <button
                          disabled={isSelf}
                          onClick={() => handleDeleteUser(userItem.id, userItem.username)}
                          className={`p-1.5 rounded-xl text-red-600 hover:bg-red-100 border border-red-200 transition-colors ${
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
    </div>
  );
};
