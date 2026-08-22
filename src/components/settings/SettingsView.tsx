"use client";

import React, { useState } from "react";
import {
  User,
  Headphones,
  Bell,
  ShieldCheck,
  Palette,
  Volume2,
  Check,
  Smartphone,
  Radio,
  Sparkles,
  Lock,
  Globe,
  Sliders,
  LogOut,
  Save,
  Music,
  ExternalLink,
} from "lucide-react";
import { UserProfile } from "@/types";
import { CURRENT_USER } from "@/lib/mock-data";

interface SettingsViewProps {
  user?: UserProfile;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
}

type SettingsSection =
  | "profile"
  | "audio"
  | "notifications"
  | "privacy"
  | "appearance"
  | "sessions";

export const SettingsView: React.FC<SettingsViewProps> = ({
  user = CURRENT_USER,
  onUpdateUser,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");

  // Profile Form State
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [privacy, setPrivacy] = useState(user.privacy || "public");

  // Audio / Listen Together Settings State
  const [audioQuality, setAudioQuality] = useState<"standard" | "high" | "lossless">("high");
  const [syncTolerance, setSyncTolerance] = useState<number>(100); // ms
  const [crossfade, setCrossfade] = useState<number>(3); // seconds
  const [volumeNormalization, setVolumeNormalization] = useState(true);
  const [spatialAudio, setSpatialAudio] = useState(true);

  // Music Streaming Integrations State
  const [spotifyConnected, setSpotifyConnected] = useState(true);
  const [appleMusicConnected, setAppleMusicConnected] = useState(false);
  const [ytMusicConnected, setYtMusicConnected] = useState(true);

  // Notification Toggles State
  const [notifyInvites, setNotifyInvites] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyReactions, setNotifyReactions] = useState(true);
  const [notifyFriendActivity, setNotifyFriendActivity] = useState(true);
  const [emailRecap, setEmailRecap] = useState(false);

  // Privacy & Safety State
  const [shareListeningActivity, setShareListeningActivity] = useState(true);
  const [allowPublicInvites, setAllowPublicInvites] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [disappearingMessagesDefault, setDisappearingMessagesDefault] = useState("off");

  // Appearance State
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light");
  const [accentColor, setAccentColor] = useState<string>("#1877F2");

  // Feedback Toast State
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const handleSave = () => {
    if (onUpdateUser) {
      onUpdateUser({
        name,
        username,
        bio,
        privacy,
      });
    }
    setSaveToast("Settings saved successfully!");
    setTimeout(() => setSaveToast(null), 3000);
  };

  const sections: { id: SettingsSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "profile", label: "Profile & Account", icon: User },
    { id: "audio", label: "Playback & Sync", icon: Headphones },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: ShieldCheck },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "sessions", label: "Active Sessions", icon: Smartphone },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 select-none">
      {/* Header */}
      <div className="vibe-card p-6 rounded-3xl bg-white border border-[#E4E6EB] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl text-[#050505] flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#1877F2]" />
            <span>Settings & Preferences</span>
          </h1>
          <p className="text-xs text-[#65676B] mt-1">
            Manage your VibeSpace account, real-time audio synchronization, and privacy controls.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Save className="w-4 h-4 text-white" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Toast Notification */}
      {saveToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-semibold text-xs flex items-center justify-between shadow-lg shadow-emerald-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{saveToast}</span>
          </div>
          <button
            onClick={() => setSaveToast(null)}
            className="text-white/80 hover:text-white text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Settings Container: Navigation Tabs + Main Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Navigation Menu */}
        <div className="md:col-span-1 space-y-1">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? "bg-[#1877F2]/10 text-[#1877F2] border-l-4 border-[#1877F2]"
                    : "text-[#65676B] hover:text-[#050505] hover:bg-[#E4E6EB]/60"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-[#1877F2]" : "text-[#65676B]"}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content View */}
        <div className="md:col-span-3">
          {/* SECTION 1: PROFILE & ACCOUNT */}
          {activeSection === "profile" && (
            <div className="vibe-card p-6 rounded-3xl bg-white border border-[#E4E6EB] space-y-6">
              <h2 className="font-bold text-lg text-[#050505] pb-2 border-b border-[#E4E6EB] flex items-center gap-2">
                <User className="w-5 h-5 text-[#1877F2]" />
                <span>Profile & Account Information</span>
              </h2>

              <div className="space-y-4">
                {/* Avatar Preview */}
                <div className="flex items-center gap-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#1877F2]"
                  />
                  <div>
                    <button className="btn-secondary py-1.5 px-3 text-xs font-bold text-[#050505]">
                      Change Avatar
                    </button>
                    <p className="text-[10px] text-[#65676B] mt-1">
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl vibe-input text-xs font-medium"
                    placeholder="Your Full Name"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-[#65676B] font-bold">
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-2.5 pl-7 rounded-xl vibe-input text-xs font-medium"
                      placeholder="username"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">
                    Bio / Status
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-2.5 rounded-xl vibe-input text-xs font-medium resize-none"
                    placeholder="Tell your friends what music vibes with you..."
                  />
                </div>

                {/* Account Privacy Level */}
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">
                    Account Visibility
                  </label>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl vibe-input text-xs font-medium bg-white"
                  >
                    <option value="public">Public (Everyone can see your profile & activity)</option>
                    <option value="friends-only">Friends Only (Only mutual connections)</option>
                    <option value="private">Private (Only approved followers)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: AUDIO & LISTEN TOGETHER SYNC */}
          {activeSection === "audio" && (
            <div className="vibe-card p-6 rounded-3xl bg-white border border-[#E4E6EB] space-y-6">
              <h2 className="font-bold text-lg text-[#050505] pb-2 border-b border-[#E4E6EB] flex items-center gap-2">
                <Headphones className="w-5 h-5 text-[#1877F2]" />
                <span>Audio Playback & Synchronized Engines</span>
              </h2>

              {/* Streaming Quality */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#050505]">
                  Streaming Audio Quality
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "standard", label: "Standard", desc: "128 kbps AAC (Saves data)" },
                    { id: "high", label: "High Quality", desc: "320 kbps MP3/AAC" },
                    { id: "lossless", label: "Lossless FLAC", desc: "24-bit / 96kHz High-Res" },
                  ].map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setAudioQuality(q.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        audioQuality === q.id
                          ? "border-[#1877F2] bg-[#1877F2]/10 text-[#050505]"
                          : "border-[#E4E6EB] hover:border-[#1877F2]/40"
                      }`}
                    >
                      <p className="text-xs font-bold flex items-center justify-between">
                        <span>{q.label}</span>
                        {audioQuality === q.id && <Check className="w-3.5 h-3.5 text-[#1877F2]" />}
                      </p>
                      <p className="text-[10px] text-[#65676B] mt-1">{q.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Sync Tolerance Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-[#050505]">
                    Real-time Drift Tolerance: <span className="text-[#1877F2]">{syncTolerance} ms</span>
                  </label>
                  <span className="text-[10px] text-[#65676B]">Sub-millisecond WebAudio Clock</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="10"
                  value={syncTolerance}
                  onChange={(e) => setSyncTolerance(Number(e.target.value))}
                  className="w-full accent-[#1877F2] cursor-pointer"
                />
                <p className="text-[10px] text-[#65676B]">
                  Lower tolerance forces tighter audio packet resynchronization across party members.
                </p>
              </div>

              {/* Crossfade Duration */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-[#050505]">
                    Crossfade Between Songs: <span className="text-[#1877F2]">{crossfade}s</span>
                  </label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={crossfade}
                  onChange={(e) => setCrossfade(Number(e.target.value))}
                  className="w-full accent-[#1877F2] cursor-pointer"
                />
              </div>

              {/* Audio Enhancements Switches */}
              <div className="space-y-3 pt-2 border-t border-[#E4E6EB]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#050505]">Volume Normalization</p>
                    <p className="text-[10px] text-[#65676B]">Equalize volume level across different music tracks</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={volumeNormalization}
                    onChange={(e) => setVolumeNormalization(e.target.checked)}
                    className="w-4 h-4 accent-[#1877F2] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#050505]">Spatial Audio & 3D Surround</p>
                    <p className="text-[10px] text-[#65676B]">Immersive head-tracked stereo separation in Listen Together rooms</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={spatialAudio}
                    onChange={(e) => setSpatialAudio(e.target.checked)}
                    className="w-4 h-4 accent-[#1877F2] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Music Streaming Services Integrations */}
              <div className="space-y-3 pt-4 border-t border-[#E4E6EB]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#65676B] flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>Connected Music Platforms</span>
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-[#E4E6EB] bg-[#F8FAFC]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xs">
                        S
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#050505]">Spotify Premium</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">Connected (Playback sync active)</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSpotifyConnected(!spotifyConnected)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        spotifyConnected ? "btn-secondary" : "btn-primary text-white"
                      }`}
                    >
                      {spotifyConnected ? "Disconnect" : "Connect"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl border border-[#E4E6EB] bg-[#F8FAFC]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 font-bold text-xs">
                        🍎
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#050505]">Apple Music</p>
                        <p className="text-[10px] text-[#65676B]">Not connected</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAppleMusicConnected(!appleMusicConnected)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        appleMusicConnected ? "btn-secondary" : "btn-primary text-white"
                      }`}
                    >
                      {appleMusicConnected ? "Disconnect" : "Connect"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl border border-[#E4E6EB] bg-[#F8FAFC]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center text-red-600 font-bold text-xs">
                        ▶
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#050505]">YouTube Music</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">Connected</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setYtMusicConnected(!ytMusicConnected)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        ytMusicConnected ? "btn-secondary" : "btn-primary text-white"
                      }`}
                    >
                      {ytMusicConnected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <div className="vibe-card p-6 rounded-3xl bg-white border border-[#E4E6EB] space-y-6">
              <h2 className="font-bold text-lg text-[#050505] pb-2 border-b border-[#E4E6EB] flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#1877F2]" />
                <span>Notification Preferences</span>
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#050505]">Listen Together Invites</p>
                    <p className="text-[10px] text-[#65676B]">Get alerted when friends invite you to a listening session</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyInvites}
                    onChange={(e) => setNotifyInvites(e.target.checked)}
                    className="w-4 h-4 accent-[#1877F2] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#050505]">Direct Messages & Group Chats</p>
                    <p className="text-[10px] text-[#65676B]">Alerts for new messages and voice room mentions</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyMessages}
                    onChange={(e) => setNotifyMessages(e.target.checked)}
                    className="w-4 h-4 accent-[#1877F2] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#050505]">Reactions & Song Shares</p>
                    <p className="text-[10px] text-[#65676B]">Notifications when someone likes your post or saved track</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyReactions}
                    onChange={(e) => setNotifyReactions(e.target.checked)}
                    className="w-4 h-4 accent-[#1877F2] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#050505]">Friend Listening Activity</p>
                    <p className="text-[10px] text-[#65676B]">Know when your favorite contacts start listening to music</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyFriendActivity}
                    onChange={(e) => setNotifyFriendActivity(e.target.checked)}
                    className="w-4 h-4 accent-[#1877F2] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E4E6EB]">
                  <div>
                    <p className="text-xs font-bold text-[#050505]">Weekly Digest Email</p>
                    <p className="text-[10px] text-[#65676B]">Receive a summary of top music recommendations and friends' posts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailRecap}
                    onChange={(e) => setEmailRecap(e.target.checked)}
                    className="w-4 h-4 accent-[#1877F2] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PRIVACY & SECURITY */}
          {activeSection === "privacy" && (
            <div className="vibe-card p-6 rounded-3xl bg-white border border-[#E4E6EB] space-y-6">
              <h2 className="font-bold text-lg text-[#050505] pb-2 border-b border-[#E4E6EB] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1877F2]" />
                <span>Privacy & Security Controls</span>
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#050505]">Broadcast Listening Activity</p>
                    <p className="text-[10px] text-[#65676B]">Show currently playing track on your profile & sidebar indicator</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={shareListeningActivity}
                    onChange={(e) => setShareListeningActivity(e.target.checked)}
                    className="w-4 h-4 accent-[#1877F2] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#050505]">Public Voice Room Invites</p>
                    <p className="text-[10px] text-[#65676B]">Allow community members to invite you to live voice stages</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowPublicInvites}
                    onChange={(e) => setAllowPublicInvites(e.target.checked)}
                    className="w-4 h-4 accent-[#1877F2] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#050505]">Message Read Receipts</p>
                    <p className="text-[10px] text-[#65676B]">Show when you have read direct messages in chat</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={readReceipts}
                    onChange={(e) => setReadReceipts(e.target.checked)}
                    className="w-4 h-4 accent-[#1877F2] rounded cursor-pointer"
                  />
                </div>

                {/* Disappearing Messages Timer */}
                <div className="pt-2 border-t border-[#E4E6EB]">
                  <label className="block text-xs font-bold text-[#050505] mb-1">
                    Default Disappearing Messages Timer
                  </label>
                  <select
                    value={disappearingMessagesDefault}
                    onChange={(e) => setDisappearingMessagesDefault(e.target.value)}
                    className="w-full p-2.5 rounded-xl vibe-input text-xs font-medium bg-white"
                  >
                    <option value="off">Off (Messages stored permanently)</option>
                    <option value="24h">24 Hours</option>
                    <option value="7d">7 Days</option>
                    <option value="90d">90 Days</option>
                  </select>
                </div>

                {/* Password & Security Actions */}
                <div className="pt-4 border-t border-[#E4E6EB] space-y-2">
                  <h3 className="text-xs font-bold text-[#050505]">Security Credentials</h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="btn-secondary py-2 px-4 text-xs font-bold text-[#050505]">
                      Change Password
                    </button>
                    <button className="btn-secondary py-2 px-4 text-xs font-bold text-[#1877F2]">
                      Enable Two-Factor Authentication (2FA)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: APPEARANCE */}
          {activeSection === "appearance" && (
            <div className="vibe-card p-6 rounded-3xl bg-white border border-[#E4E6EB] space-y-6">
              <h2 className="font-bold text-lg text-[#050505] pb-2 border-b border-[#E4E6EB] flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#1877F2]" />
                <span>Appearance & Customization</span>
              </h2>

              <div className="space-y-5">
                {/* Theme Mode Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-2">
                    Interface Theme Mode
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "light", label: "Light Vibe (Default)", desc: "Clean Facebook blue style" },
                      { id: "dark", label: "Midnight Synth", desc: "Dark mode for late night vibes" },
                      { id: "system", label: "System Sync", desc: "Follow OS preference" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setThemeMode(mode.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          themeMode === mode.id
                            ? "border-[#1877F2] bg-[#1877F2]/10 text-[#050505]"
                            : "border-[#E4E6EB] hover:border-[#1877F2]/40"
                        }`}
                      >
                        <p className="text-xs font-bold flex items-center justify-between">
                          <span>{mode.label}</span>
                          {themeMode === mode.id && <Check className="w-3.5 h-3.5 text-[#1877F2]" />}
                        </p>
                        <p className="text-[10px] text-[#65676B] mt-1">{mode.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color Picker */}
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-2">
                    Primary Accent Highlight
                  </label>
                  <div className="flex items-center gap-3">
                    {[
                      { name: "Facebook Blue", color: "#1877F2" },
                      { name: "Neon Cyan", color: "#06B6D4" },
                      { name: "Electric Purple", color: "#8B5CF6" },
                      { name: "Vibe Pink", color: "#EC4899" },
                      { name: "Sunset Amber", color: "#F59E0B" },
                    ].map((c) => (
                      <button
                        key={c.color}
                        onClick={() => setAccentColor(c.color)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform ${
                          accentColor === c.color ? "scale-110 ring-2 ring-offset-2 ring-black" : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.name}
                      >
                        {accentColor === c.color && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: ACTIVE SESSIONS */}
          {activeSection === "sessions" && (
            <div className="vibe-card p-6 rounded-3xl bg-white border border-[#E4E6EB] space-y-6">
              <h2 className="font-bold text-lg text-[#050505] pb-2 border-b border-[#E4E6EB] flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#1877F2]" />
                <span>Active Logged-in Devices</span>
              </h2>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#050505]">Windows Desktop App (Current)</p>
                      <p className="text-[10px] text-emerald-700 font-semibold">Active now • Chrome Browser</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                    Current Device
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl border border-[#E4E6EB] bg-[#F8FAFC] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-[#65676B]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#050505]">iPhone 15 Pro</p>
                      <p className="text-[10px] text-[#65676B]">Last active 2 hours ago • iOS App</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-red-600 hover:underline">
                    Revoke
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E4E6EB]">
                <button className="btn-secondary py-2.5 px-4 text-xs font-bold text-red-600 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>Log Out Of All Other Sessions</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
