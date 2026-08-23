"use client";

import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/navigation/TopNav";
import { LeftSidebar } from "@/components/navigation/LeftSidebar";
import { RightSidebar } from "@/components/navigation/RightSidebar";
import { MobileNav } from "@/components/navigation/MobileNav";
import { CreatePostCard } from "@/components/feed/CreatePostCard";
import { SocialFeed } from "@/components/feed/SocialFeed";
import { ChatView } from "@/components/messages/ChatView";
import { ListenTogetherRoom } from "@/components/listen/ListenTogetherRoom";
import { MiniMusicPlayer } from "@/components/listen/MiniMusicPlayer";
import { GlobalAudioEngine } from "@/components/listen/GlobalAudioEngine";
import { LiveVoiceRoomModal } from "@/components/voice/LiveVoiceRoomModal";
import { ProfileView } from "@/components/profile/ProfileView";
import { SettingsView } from "@/components/settings/SettingsView";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { LoginPageView } from "@/components/auth/LoginPageView";
import { NavTab } from "@/components/navigation/Sidebar";
import {
  CURRENT_USER,
  MOCK_POSTS,
  MOCK_CONVERSATIONS,
} from "@/lib/mock-data";
import { useRealtimeSession, useNotifications } from "@/lib/realtime-store";
import { Track, UserProfile, Post } from "@/types";
import { Radio } from "lucide-react";
import { fetchPostsFromApi, createPostApi } from "@/lib/api";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [user, setUser] = useState<UserProfile>(CURRENT_USER);
  const [feedPosts, setFeedPosts] = useState<Post[]>(MOCK_POSTS);
  const [isLoggedOut, setIsLoggedOut] = useState(true);
  const [isVoiceRoomOpen, setIsVoiceRoomOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { session, playTrack, updateCurrentUser } = useRealtimeSession();
  const { unreadCount } = useNotifications();

  // Restore last active page tab & user profile on website reload
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("vibespace_active_tab") as NavTab | null;
      const validTabs: NavTab[] = ["home", "messages", "listen", "live", "profile", "settings"];
      if (savedTab && validTabs.includes(savedTab)) {
        setActiveTab(savedTab);
      }

      const savedUser = localStorage.getItem("vibespace_user_profile");
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          updateCurrentUser(parsedUser);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("vibespace_user_profile");
        localStorage.removeItem("vibespace_saved_post_ids");
        localStorage.removeItem("vibespace_custom_playlists");
        localStorage.removeItem("vibespace_added_friends");
      } catch (e) {}
    }
    setIsLoggedOut(true);
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updated };
      if (typeof window !== "undefined") {
        localStorage.setItem("vibespace_user_profile", JSON.stringify(newUser));
      }
      updateCurrentUser(newUser);
      return newUser;
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vibespace_active_tab", activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    async function loadApiPosts() {
      const apiPosts = await fetchPostsFromApi();
      const loadedPosts = apiPosts && apiPosts.length > 0 ? apiPosts : MOCK_POSTS;
      
      // Hydrate saved status from localStorage
      if (typeof window !== "undefined") {
        try {
          const savedIds: string[] = JSON.parse(
            localStorage.getItem("vibespace_saved_post_ids") || "[]"
          );
          if (savedIds.length > 0) {
            const hydrated = loadedPosts.map((p) => ({
              ...p,
              isSaved: savedIds.includes(p.id) ? true : p.isSaved,
            }));
            setFeedPosts(hydrated);
            return;
          }
        } catch (e) {}
      }
      setFeedPosts(loadedPosts);
    }
    loadApiPosts();
  }, []);

  const handleToggleBookmark = (postId: string) => {
    setFeedPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isSaved = !p.isSaved;
          if (typeof window !== "undefined") {
            try {
              const savedIds: string[] = JSON.parse(
                localStorage.getItem("vibespace_saved_post_ids") || "[]"
              );
              const nextIds = isSaved
                ? Array.from(new Set([...savedIds, postId]))
                : savedIds.filter((id) => id !== postId);
              localStorage.setItem("vibespace_saved_post_ids", JSON.stringify(nextIds));
            } catch (e) {}
          }
          return { ...p, isSaved };
        }
        return p;
      })
    );
  };

  const handleAddPost = async (newPost: Post) => {
    setFeedPosts((prev) => [newPost, ...prev]);
    await createPostApi(newPost);
  };

  const handleLaunchListenSessionFromChat = (partner: UserProfile, track: Track) => {
    playTrack(track);
    setActiveTab("listen");
  };

  if (isLoggedOut) {
    return (
      <LoginPageView
        onSuccess={(loggedInUser) => {
          setIsLoggedOut(false);
          handleUpdateUser(loggedInUser);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#050505] flex flex-col relative selection:bg-[#1877F2] selection:text-white transition-colors duration-200">
      {/* 1. Sticky Top Navigation Bar (64px) */}
      <TopNav
        user={user}
        unreadMessagesCount={2}
        unreadNotificationsCount={unreadCount}
        isListeningActive={session.playbackState.isPlaying}
        onOpenCreatePost={() => setIsCreateModalOpen(true)}
        onOpenMessages={() => setActiveTab("messages")}
        onOpenNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onOpenListenRoom={() => setActiveTab("listen")}
        onOpenProfile={() => setActiveTab("profile")}
        onOpenAuth={handleLogout}
      />

      {/* 2. Global Desktop Layout */}
      <div className="flex-1 flex justify-center w-full max-w-[1440px] mx-auto">
        {/* Left Column: Left Sidebar Navigation */}
        <LeftSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadMessagesCount={2}
          unreadNotificationsCount={unreadCount}
          currentUser={user}
          onOpenCreatePost={() => setIsCreateModalOpen(true)}
          onOpenAuth={handleLogout}
        />

        {/* Center Column: Primary Main Content Focus */}
        <main className={`flex-1 min-w-0 ${activeTab === "messages" || activeTab === "listen" ? "max-w-6xl px-1 sm:px-6 py-1 sm:py-5" : "max-w-2xl px-3 sm:px-6 py-5"}`}>
          {activeTab === "home" && (
            <div className="space-y-5">
              {/* Personal Greeting */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <h1 className="font-bold text-xl text-[#050505]">
                    Welcome back, {user.name.split(" ")[0]} 👋
                  </h1>
                  <p className="text-xs text-[#65676B]">
                    Connect, share, and listen to music together.
                  </p>
                </div>
              </div>

              {/* Create Post Input Card */}
              <CreatePostCard
                user={user}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onAddPost={handleAddPost}
              />

              {/* Main Social Feed */}
              <SocialFeed
                posts={feedPosts}
                currentUser={user}
                onPlayTrackPreview={(t) => playTrack(t)}
                onStartListeningSession={(t) => {
                  playTrack(t);
                  setActiveTab("listen");
                }}
                onAddToQueue={(t) => playTrack(t)}
                onOpenCreatePost={() => setIsCreateModalOpen(true)}
                onToggleBookmark={handleToggleBookmark}
                onPostsChange={setFeedPosts}
              />
            </div>
          )}

          {activeTab === "messages" && (
            <ChatView
              conversations={MOCK_CONVERSATIONS}
              currentUser={user}
              onLaunchListenSessionFromChat={handleLaunchListenSessionFromChat}
            />
          )}

          {activeTab === "listen" && <ListenTogetherRoom />}

          {activeTab === "live" && (
            <div className="space-y-6">
              <div className="vibe-card p-8 text-center space-y-4">
                <Radio className="w-12 h-12 text-[#1877F2] mx-auto animate-pulse" />
                <h2 className="font-bold text-2xl text-[#050505]">Live Voice Rooms</h2>
                <p className="text-xs text-[#65676B] max-w-md mx-auto">
                  Talk with friends while listening to synchronized music together in real-time.
                </p>
                <button
                  onClick={() => setIsVoiceRoomOpen(true)}
                  className="py-3 px-6 rounded-xl btn-primary text-white font-bold text-xs shadow-lg shadow-blue-500/30"
                >
                  Join Live Voice Stage
                </button>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <ProfileView
              user={user}
              posts={feedPosts}
              onPlayTrack={(t) => playTrack(t)}
              onStartListenTogether={(t) => {
                playTrack(t);
                setActiveTab("listen");
              }}
              onUpdateUser={handleUpdateUser}
              onOpenCreatePost={() => setIsCreateModalOpen(true)}
              onOpenAuth={handleLogout}
              onOpenSettings={() => setActiveTab("settings")}
              onToggleBookmark={handleToggleBookmark}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              user={user}
              onUpdateUser={handleUpdateUser}
            />
          )}
        </main>

        {/* Right Column: Social Activity & Recommendations Sidebar */}
        {activeTab !== "messages" && (
          <RightSidebar
            onJoinListeningRoom={() => setActiveTab("listen")}
            onOpenSpace={(spaceId) => setActiveTab("listen")}
            onOpenProfile={(u) => setActiveTab("profile")}
            currentUser={user}
          />
        )}
      </div>

      {/* 3. Global Persistent Audio Engine & Background Mini Player */}
      <GlobalAudioEngine />
      {activeTab !== "listen" && session.playbackState.currentTrack && (
        <MiniMusicPlayer onOpenFullRoom={() => setActiveTab("listen")} />
      )}

      {/* 4. Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadMessagesCount={2}
        currentUser={user}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Notification Center Popup */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onOpenListenRoom={() => setActiveTab("listen")}
        currentUser={user}
      />

      {/* Live Voice Room Modal */}
      <LiveVoiceRoomModal
        isOpen={isVoiceRoomOpen}
        onClose={() => setIsVoiceRoomOpen(false)}
        currentUser={user}
      />
    </div>
  );
}
