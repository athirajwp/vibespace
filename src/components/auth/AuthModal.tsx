"use client";

import React, { useState } from "react";
import { X, Mail, Lock, User, ArrowRight, Music, ShieldCheck, Sparkles } from "lucide-react";
import { UserProfile } from "@/types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: Partial<UserProfile>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      name: name || "Music Explorer",
      username: username || "vibes_user",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 relative border border-white/10 shadow-2xl overflow-hidden">
        {/* Ambient Glow Backdrops */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-pill text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-600 p-[2px] mx-auto mb-4 shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold text-white">
            {mode === "login"
              ? "Welcome back to VibeSpace"
              : mode === "signup"
              ? "Create your VibeSpace account"
              : "Reset Password"}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {mode === "signup"
              ? "Connect & listen to synchronized music together"
              : "Enter your credentials to enter your digital space"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {mode === "signup" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alex_vibes"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@vibespace.app"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-300">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl gradient-btn-primary flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-cyan-500/25 mt-6"
          >
            <span>{mode === "signup" ? "Continue to Onboarding" : mode === "login" ? "Sign In" : "Send Reset Link"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Social Auth Architecture */}
        <div className="mt-6 pt-6 border-t border-surface-border">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                onSuccess({ name: "Google Vibe User", username: "google_user" });
                onClose();
              }}
              className="py-2.5 px-4 rounded-xl glass-card text-xs font-semibold flex items-center justify-center gap-2 text-gray-300 hover:text-white"
            >
              <span>Continue with Google</span>
            </button>
            <button
              onClick={() => {
                onSuccess({ name: "Spotify Vibe User", username: "spotify_user" });
                onClose();
              }}
              className="py-2.5 px-4 rounded-xl glass-card text-xs font-semibold flex items-center justify-center gap-2 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30"
            >
              <Music className="w-4 h-4" />
              <span>Spotify OAuth</span>
            </button>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="text-center mt-6">
          {mode === "signup" ? (
            <p className="text-xs text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-cyan-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-xs text-gray-400">
              Don't have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-cyan-400 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
