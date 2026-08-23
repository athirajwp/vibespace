"use client";

import React, { useState, useEffect } from "react";
import { Lock, User, ArrowRight, Sparkles, UserPlus, LogIn, AlertCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { UserProfile } from "@/types";
import { CURRENT_USER } from "@/lib/mock-data";

interface LoginPageViewProps {
  onSuccess: (user: UserProfile) => void;
}

export const LoginPageView: React.FC<LoginPageViewProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Registered accounts stored in localStorage
  const [registeredAccounts, setRegisteredAccounts] = useState<
    (UserProfile & { password?: string })[]
  >([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vibespace_registered_accounts");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRegisteredAccounts(parsed);
          } else {
            const defaultAcc = { ...CURRENT_USER, password: "password" };
            setRegisteredAccounts([defaultAcc]);
            localStorage.setItem("vibespace_registered_accounts", JSON.stringify([defaultAcc]));
          }
        } else {
          const defaultAcc = { ...CURRENT_USER, password: "password" };
          setRegisteredAccounts([defaultAcc]);
          localStorage.setItem("vibespace_registered_accounts", JSON.stringify([defaultAcc]));
        }
      } catch (e) {}
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, "");
    if (!cleanUsername) {
      setErrorMessage("Please enter a valid username.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter a password.");
      return;
    }

    // Check if username already exists
    const exists = registeredAccounts.some(
      (acc) => acc.username.toLowerCase() === cleanUsername
    );

    if (exists) {
      setErrorMessage(`Username "@${cleanUsername}" is already taken. Please choose another username or log in.`);
      return;
    }

    const avatarSeeds = [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=250&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop",
    ];
    const randomAvatar = avatarSeeds[Math.floor(Math.random() * avatarSeeds.length)];

    const formattedName = displayName.trim() || cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);

    const newUser: UserProfile & { password?: string } = {
      id: `usr-${Date.now()}`,
      name: formattedName,
      username: cleanUsername,
      password: password,
      avatar: randomAvatar,
      bio: "",
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      interests: [],
      favoriteGenres: [],
      favoriteArtists: [],
      publicPlaylistsCount: 0,
      privacy: "public",
      joinedDate: "August 2026",
      onlineStatus: "online",
    };

    const updatedAccounts = [...registeredAccounts, newUser];
    setRegisteredAccounts(updatedAccounts);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vibespace_registered_accounts", JSON.stringify(updatedAccounts));
        localStorage.removeItem("vibespace_saved_post_ids");
        localStorage.removeItem("vibespace_custom_playlists");
      } catch (e) {}
    }

    onSuccess(newUser);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, "");
    if (!cleanUsername) {
      setErrorMessage("Please enter your username.");
      return;
    }

    const matchedUser = registeredAccounts.find(
      (acc) => acc.username.toLowerCase() === cleanUsername
    );

    if (!matchedUser) {
      setErrorMessage(`No account found with username "@${cleanUsername}". Please check spelling or create a new account.`);
      return;
    }

    if (matchedUser.password && matchedUser.password !== password) {
      setErrorMessage("Incorrect password. Please try again.");
      return;
    }

    onSuccess(matchedUser);
  };

  return (
    <div className="min-h-screen w-full bg-[#F0F2F5] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-6 text-center z-10 flex flex-col items-center">
        <Logo size="lg" />
        <p className="text-xs text-[#65676B] font-bold mt-2">
          Connect, share, and listen to music together.
        </p>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl border border-[#E4E6EB] p-6 sm:p-8 shadow-2xl z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1877F2] to-purple-600 p-0.5 mx-auto mb-3 shadow-lg shadow-blue-500/25 flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-extrabold text-2xl text-[#050505]">
            {mode === "login" ? "Log In to VibeSpace" : "Create New Account"}
          </h2>
          <p className="text-xs text-[#65676B] font-semibold mt-1">
            {mode === "login"
              ? "Enter your username and password to log in"
              : "Choose your unique username and password to get started"}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F0F2F5] rounded-2xl border border-[#E4E6EB] mb-5 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              mode === "login"
                ? "bg-[#1877F2] text-white shadow-md shadow-blue-500/20"
                : "text-[#65676B] hover:text-[#050505] hover:bg-white/60"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Log In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              mode === "signup"
                ? "bg-[#1877F2] text-white shadow-md shadow-blue-500/20"
                : "text-[#65676B] hover:text-[#050505] hover:bg-white/60"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>New User</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Authentication Form */}
        <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#050505]">Username</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#1877F2]">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose username (e.g. alex_vibes)"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] text-xs font-bold text-[#050505] placeholder-[#65676B] focus:outline-none focus:bg-white focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#050505]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#65676B]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] text-xs font-bold text-[#050505] placeholder-[#65676B] focus:outline-none focus:bg-white focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Full Name (Signup Only) */}
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#050505]">
                Full Name <span className="text-[10px] font-normal text-[#65676B]">(Optional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#65676B]" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display name (e.g. Alex Rivera)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] text-xs font-bold text-[#050505] placeholder-[#65676B] focus:outline-none focus:bg-white focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition-all shadow-xs"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 active:scale-95 transition-all mt-4"
          >
            <span>{mode === "login" ? "Log In to Account" : "Create New Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Registered Accounts Carousel for Quick Switch */}
        {registeredAccounts.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#E4E6EB] space-y-2">
            <span className="text-[10px] font-extrabold text-[#65676B] uppercase tracking-wider block">
              Quick Log In As:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {registeredAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => onSuccess(acc)}
                  className="p-1.5 pr-3 rounded-full bg-[#F0F2F5] border border-[#E4E6EB] hover:border-[#1877F2] hover:bg-white flex items-center gap-2 text-xs font-bold text-[#050505] shrink-0 hover:scale-105 active:scale-95 transition-all shadow-xs"
                  title={`Log in as ${acc.name} (@${acc.username})`}
                >
                  <img src={acc.avatar} alt={acc.name} className="w-6 h-6 rounded-full object-cover border border-[#1877F2]" />
                  <span className="truncate max-w-[110px]">{acc.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
