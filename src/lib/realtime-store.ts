import { useState, useEffect } from "react";
import {
  ListeningSession,
  PlaybackState,
  Track,
  QueueItem,
  UserProfile,
  NotificationItem,
} from "@/types";
import { INITIAL_LISTENING_SESSION, CURRENT_USER, MOCK_NOTIFICATIONS } from "./mock-data";

type StoreListener = () => void;

class RealtimeSessionStore {
  private session: ListeningSession = { ...INITIAL_LISTENING_SESSION };
  private notifications: NotificationItem[] = [...MOCK_NOTIFICATIONS];
  private listeners: Set<StoreListener> = new Set();
  private audioEl: HTMLAudioElement | null = null;
  private syncTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initAudioEngine();
      this.hydrateFromStorage();
      this.startSyncLoop();
    }
  }

  private hydrateFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const savedUser = localStorage.getItem("vibespace_user_profile");
      if (savedUser) {
        const parsedUser: UserProfile = JSON.parse(savedUser);
        this.updateCurrentUser(parsedUser);
      }
      const savedTrack = localStorage.getItem("vibespace_last_track");
      if (savedTrack) {
        const parsedTrack: Track = JSON.parse(savedTrack);
        this.session.playbackState.currentTrack = parsedTrack;
      }
      const savedQueue = localStorage.getItem("vibespace_last_queue");
      if (savedQueue) {
        this.session.queue = JSON.parse(savedQueue);
      }
      const savedPos = localStorage.getItem("vibespace_last_position");
      if (savedPos) {
        this.session.playbackState.currentPosition = parseFloat(savedPos);
      }
      // On fresh page reload, keep player paused until user clicks Play
      this.session.playbackState.isPlaying = false;
    } catch (e) {}
  }

  private saveStateToStorage() {
    if (typeof window === "undefined") return;
    try {
      if (this.session.playbackState.currentTrack) {
        localStorage.setItem("vibespace_last_track", JSON.stringify(this.session.playbackState.currentTrack));
      }
      localStorage.setItem("vibespace_last_queue", JSON.stringify(this.session.queue));
      localStorage.setItem("vibespace_last_position", String(this.session.playbackState.currentPosition || 0));
    } catch (e) {}
  }

  private initAudioEngine() {
    if (!this.audioEl && typeof Audio !== "undefined") {
      this.audioEl = new Audio();
      this.audioEl.preload = "auto";
      
      this.audioEl.addEventListener("ended", () => {
        this.handleTrackEnded();
      });

      this.audioEl.addEventListener("loadedmetadata", () => {
        if (this.audioEl && this.audioEl.duration && !isNaN(this.audioEl.duration) && isFinite(this.audioEl.duration)) {
          if (this.session.playbackState.currentTrack) {
            this.session.playbackState.currentTrack.duration = Math.round(this.audioEl.duration);
            this.saveStateToStorage();
            this.notify();
          }
        }
      });

      this.audioEl.addEventListener("timeupdate", () => {
        if (this.session.playbackState.isPlaying && this.session.host.id === CURRENT_USER.id) {
          this.session.playbackState.currentPosition = this.audioEl?.currentTime || 0;
          this.session.playbackState.updatedAt = Date.now();
        }
      });
    }
  }

  public updateCurrentTrackDuration(durationInSeconds: number) {
    if (this.session.playbackState.currentTrack && durationInSeconds > 0) {
      this.session.playbackState.currentTrack.duration = Math.round(durationInSeconds);
      this.saveStateToStorage();
      this.notify();
    }
  }

  private startSyncLoop() {
    this.syncTimer = setInterval(() => {
      if (this.session.playbackState.isPlaying) {
        const maxDuration = this.session.playbackState.currentTrack?.duration || 215;
        if (this.session.playbackState.currentPosition >= maxDuration) {
          this.session.playbackState.currentPosition = 0;
        } else {
          if (this.audioEl && this.audioEl.src && !this.audioEl.paused && !this.audioEl.ended) {
            this.session.playbackState.currentPosition = this.audioEl.currentTime;
          } else {
            this.session.playbackState.currentPosition += 1;
          }
        }
        this.session.playbackState.updatedAt = Date.now();
      }
      this.calculateSyncDrift();
      this.notify();
    }, 1000);
  }

  public subscribe(listener: StoreListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getSession(): ListeningSession {
    return this.session;
  }

  public getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  public markNotificationRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notify();
  }

  // --- Real-time Synchronized Playback Logic ---

  public calculateSyncDrift() {
    const state = this.session.playbackState;
    if (!state.isPlaying || !state.currentTrack) {
      this.session.syncStatus = "synced";
      this.session.driftMs = 0;
      return;
    }

    // Host audio element is authoritative source of truth for host
    if (state.hostId === CURRENT_USER.id) {
      if (this.audioEl && this.audioEl.playbackRate !== 1.0) {
        this.audioEl.playbackRate = 1.0;
      }
      this.session.syncStatus = "synced";
      this.session.driftMs = 0;
      return;
    }

    const now = Date.now();
    const elapsedTime = (now - state.updatedAt) / 1000;
    const expectedPosition = state.currentPosition + elapsedTime * state.playbackRate;

    if (this.audioEl && this.audioEl.src && !this.audioEl.paused && !this.audioEl.error) {
      const currentPos = this.audioEl.currentTime;
      const driftSec = Math.abs(currentPos - expectedPosition);
      this.session.driftMs = Math.round(driftSec * 1000);

      if (driftSec > 3.0) {
        // Large drift: Hard seek to corrected timestamp
        this.audioEl.currentTime = expectedPosition;
        this.session.syncStatus = "syncing";
        setTimeout(() => {
          this.session.syncStatus = "synced";
        }, 800);
      } else if (driftSec > 1.0) {
        // Minor drift: Micro playback rate adjustment for sync
        this.audioEl.playbackRate = currentPos < expectedPosition ? 1.05 : 0.95;
        this.session.syncStatus = "syncing";
      } else {
        // Synced perfectly
        this.audioEl.playbackRate = 1.0;
        this.session.syncStatus = "synced";
      }
    }
  }

  public playTrack(track: Track, hostUserId: string = CURRENT_USER.id) {
    const now = Date.now();
    this.session.playbackState = {
      sessionId: this.session.id,
      currentTrack: track,
      isPlaying: true,
      currentPosition: 0,
      playbackRate: 1.0,
      updatedAt: now,
      hostId: hostUserId,
    };

    if (this.audioEl) {
      const isYouTubeTrack =
        track.audioUrl?.includes("youtube") ||
        track.audioUrl?.includes("youtu.be") ||
        track.id?.length === 11 ||
        !track.audioUrl?.endsWith(".mp3");

      if (!isYouTubeTrack && track.audioUrl) {
        this.audioEl.src = track.audioUrl;
        this.audioEl.currentTime = 0;
        this.audioEl.play().catch(() => {});
      } else {
        // Pause and clear audioEl src so HTML5 audio engine doesn't attempt to parse YouTube embed URLs
        this.audioEl.pause();
        this.audioEl.removeAttribute("src");
        this.audioEl.load();
      }
    }

    this.addSystemChatMessage(`${CURRENT_USER.name} started playing "${track.title}" 🎵`);
    this.saveStateToStorage();
    this.notify();
  }

  public togglePlayPause() {
    const state = this.session.playbackState;
    if (!state.currentTrack) return;

    // If song reached the end when pressing Play, restart from zero (0:00)
    if (state.currentPosition >= (state.currentTrack.duration || 215) - 1) {
      state.currentPosition = 0;
      if (this.audioEl) {
        this.audioEl.currentTime = 0;
      }
    }

    const newIsPlaying = !state.isPlaying;
    const now = Date.now();

    state.isPlaying = newIsPlaying;
    state.updatedAt = now;
    if (this.audioEl) {
      state.currentPosition = this.audioEl.currentTime;
      if (newIsPlaying) {
        this.audioEl.play().catch(() => {});
      } else {
        this.audioEl.pause();
      }
    }

    const action = newIsPlaying ? "resumed playback" : "paused playback";
    this.addSystemChatMessage(`${CURRENT_USER.name} ${action} ⏯️`);
    this.saveStateToStorage();
    this.notify();
  }

  public seek(positionInSeconds: number) {
    const state = this.session.playbackState;
    state.currentPosition = positionInSeconds;
    state.updatedAt = Date.now();

    if (this.audioEl) {
      this.audioEl.currentTime = positionInSeconds;
    }

    this.addSystemChatMessage(`${CURRENT_USER.name} seeked to ${Math.floor(positionInSeconds)}s ⏩`);
    this.saveStateToStorage();
    this.notify();
  }

  public nextTrack() {
    if (this.session.queue.length > 0) {
      const nextQueueItem = this.session.queue[0];
      this.session.queue = this.session.queue.slice(1);
      this.playTrack(nextQueueItem.track);
    } else {
      this.seek(0);
    }
  }

  public prevTrack() {
    this.seek(0);
  }

  private handleTrackEnded() {
    this.nextTrack();
  }

  public addToQueue(track: Track, user: UserProfile = CURRENT_USER) {
    const exists = this.session.queue.some(
      (item) => item.track.id === track.id || item.track.title.trim().toLowerCase() === track.title.trim().toLowerCase()
    );
    if (exists) {
      return;
    }
    const newItem: QueueItem = {
      id: `q-${Date.now()}`,
      track,
      addedBy: user,
      votes: 1,
      votedBy: [user.id],
    };
    this.session.queue.push(newItem);
    this.sortQueue();
    this.addSystemChatMessage(`${user.name} added "${track.title}" to the queue 🎶`);
    this.saveStateToStorage();
    this.notify();
  }

  public upvoteQueueItem(queueItemId: string, userId: string = CURRENT_USER.id) {
    this.session.queue = this.session.queue.map((item) => {
      if (item.id === queueItemId) {
        const hasVoted = item.votedBy.includes(userId);
        const newVotedBy = hasVoted
          ? item.votedBy.filter((id) => id !== userId)
          : [...item.votedBy, userId];
        const newVotes = hasVoted ? item.votes - 1 : item.votes + 1;
        return { ...item, votes: newVotes, votedBy: newVotedBy };
      }
      return item;
    });

    if (this.session.controlMode === "voting") {
      this.sortQueue();
    }
    this.notify();
  }

  public removeFromQueue(queueItemId: string) {
    const itemToRemove = this.session.queue.find((i) => i.id === queueItemId);
    this.session.queue = this.session.queue.filter((i) => i.id !== queueItemId);
    if (itemToRemove) {
      this.addSystemChatMessage(`${CURRENT_USER.name} removed "${itemToRemove.track.title}" from queue 🗑️`);
    }
    this.saveStateToStorage();
    this.notify();
  }

  private sortQueue() {
    if (this.session.controlMode === "voting") {
      this.session.queue.sort((a, b) => b.votes - a.votes);
    }
  }

  public sendReaction(emoji: string, user: UserProfile = CURRENT_USER) {
    const newReaction = {
      id: `r-${Date.now()}-${Math.random()}`,
      emoji,
      userId: user.id,
      userName: user.name,
      timestamp: Date.now(),
    };
    this.session.currentReactions = [...this.session.currentReactions, newReaction];
    this.notify();

    // Auto cleanup floating reaction after 3.5s
    setTimeout(() => {
      this.session.currentReactions = this.session.currentReactions.filter(
        (r) => r.id !== newReaction.id
      );
      this.notify();
    }, 3500);
  }

  public sendChatMessage(text: string, user: UserProfile = CURRENT_USER) {
    if (!text.trim()) return;
    const msg = {
      id: `lc-${Date.now()}`,
      author: user,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    this.session.liveChat.push(msg);
    this.notify();
  }

  private addSystemChatMessage(text: string) {
    this.session.liveChat.push({
      id: `sys-${Date.now()}`,
      author: CURRENT_USER,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      system: true,
    });
  }

  public joinSession(user: UserProfile) {
    if (!this.session.participants.some((p) => p.id === user.id)) {
      this.session.participants.push(user);
      this.addSystemChatMessage(`${user.name} joined the listening session 🎧`);
      this.notify();
    }
  }

  public leaveSession(userId: string) {
    const user = this.session.participants.find((p) => p.id === userId);
    this.session.participants = this.session.participants.filter((p) => p.id !== userId);
    if (user) {
      this.addSystemChatMessage(`${user.name} left the listening room 🚪`);
    }
    this.saveStateToStorage();
    this.notify();
  }

  public updateCurrentUser(updatedUser: Partial<UserProfile>) {
    if (this.session.host) {
      this.session.host = { ...this.session.host, ...updatedUser };
    }

    if (this.session.participants) {
      this.session.participants = this.session.participants.map((p) => {
        if (!updatedUser.id || p.id === updatedUser.id || p.id === CURRENT_USER.id) {
          return { ...p, ...updatedUser };
        }
        return p;
      });
    }

    if (this.session.liveChat) {
      this.session.liveChat = this.session.liveChat.map((msg) => {
        if (msg.author && (!updatedUser.id || msg.author.id === updatedUser.id || msg.author.id === CURRENT_USER.id)) {
          return { ...msg, author: { ...msg.author, ...updatedUser } };
        }
        return msg;
      });
    }

    if (this.session.queue) {
      this.session.queue = this.session.queue.map((item) => {
        if (item.addedBy && (!updatedUser.id || item.addedBy.id === updatedUser.id || item.addedBy.id === CURRENT_USER.id)) {
          return { ...item, addedBy: { ...item.addedBy, ...updatedUser } };
        }
        return item;
      });
    }

    this.notify();
  }
}

export const realtimeStore = new RealtimeSessionStore();

export function useRealtimeSession() {
  const [session, setSession] = useState<ListeningSession>(realtimeStore.getSession());

  useEffect(() => {
    const unsubscribe = realtimeStore.subscribe(() => {
      setSession({ ...realtimeStore.getSession() });
    });
    return unsubscribe;
  }, []);

  return {
    session,
    playTrack: (t: Track) => realtimeStore.playTrack(t),
    togglePlayPause: () => realtimeStore.togglePlayPause(),
    seek: (pos: number) => realtimeStore.seek(pos),
    nextTrack: () => realtimeStore.nextTrack(),
    prevTrack: () => realtimeStore.prevTrack(),
    addToQueue: (t: Track) => realtimeStore.addToQueue(t),
    removeFromQueue: (id: string) => realtimeStore.removeFromQueue(id),
    upvoteQueueItem: (id: string) => realtimeStore.upvoteQueueItem(id),
    sendReaction: (emoji: string) => realtimeStore.sendReaction(emoji),
    sendChatMessage: (txt: string) => realtimeStore.sendChatMessage(txt),
    joinSession: (user: UserProfile) => realtimeStore.joinSession(user),
    leaveSession: (userId: string) => realtimeStore.leaveSession(userId),
    updateCurrentTrackDuration: (sec: number) => realtimeStore.updateCurrentTrackDuration(sec),
    updateCurrentUser: (u: Partial<UserProfile>) => realtimeStore.updateCurrentUser(u),
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = () => {
    if (typeof window === "undefined") return;
    try {
      const currentUserStr = localStorage.getItem("vibespace_user_profile");
      let userId = "";
      if (currentUserStr) {
        const parsed = JSON.parse(currentUserStr);
        if (parsed && parsed.id) userId = parsed.id;
      }

      let userNotifs: NotificationItem[] = [];
      let globalNotifs: NotificationItem[] = [];

      if (userId) {
        const userKey = `vibespace_notifications_${userId}`;
        const storedUserNotifs = localStorage.getItem(userKey);
        if (storedUserNotifs) {
          const parsed = JSON.parse(storedUserNotifs);
          if (Array.isArray(parsed)) userNotifs = parsed;
        }
      }

      const storedGlobal = localStorage.getItem("vibespace_notifications");
      if (storedGlobal) {
        const parsed = JSON.parse(storedGlobal);
        if (Array.isArray(parsed)) {
          globalNotifs = parsed.filter(
            (n: NotificationItem) => !n.targetId || n.targetId === userId
          );
        }
      }

      // Combine and deduplicate by notification ID
      const combinedMap = new Map<string, NotificationItem>();
      userNotifs.forEach((n) => combinedMap.set(n.id, n));
      globalNotifs.forEach((n) => {
        if (!combinedMap.has(n.id)) combinedMap.set(n.id, n);
      });

      const finalNotifs = Array.from(combinedMap.values());
      if (finalNotifs.length > 0) {
        setNotifications(finalNotifs);
      } else {
        setNotifications(realtimeStore.getNotifications());
      }
    } catch (e) {
      setNotifications(realtimeStore.getNotifications());
    }
  };

  useEffect(() => {
    loadNotifications();
    const unsubscribe = realtimeStore.subscribe(() => {
      loadNotifications();
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("vibespace_notifications")) {
        loadNotifications();
      }
    };
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(loadNotifications, 1000);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const markRead = (id: string) => {
    realtimeStore.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return {
    notifications,
    markRead,
    unreadCount: notifications.filter((n) => !n.read).length,
  };
}
