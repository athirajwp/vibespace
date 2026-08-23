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
      this.startSyncLoop();
    }
  }

  private initAudioEngine() {
    if (!this.audioEl && typeof Audio !== "undefined") {
      this.audioEl = new Audio();
      this.audioEl.preload = "auto";
      
      this.audioEl.addEventListener("ended", () => {
        this.handleTrackEnded();
      });

      this.audioEl.addEventListener("error", () => {
        // Silently catch audio element loading errors for non-direct MP3 streams
      });

      this.audioEl.addEventListener("timeupdate", () => {
        if (this.session.playbackState.isPlaying && this.session.host.id === CURRENT_USER.id) {
          this.session.playbackState.currentPosition = this.audioEl?.currentTime || 0;
          this.session.playbackState.updatedAt = Date.now();
        }
      });
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
    this.notify();
  }

  public togglePlayPause() {
    const state = this.session.playbackState;
    if (!state.currentTrack) return;

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
    this.notify();
  }

  public nextTrack() {
    if (this.session.queue.length > 0) {
      const nextQueueItem = this.session.queue[0];
      this.session.queue = this.session.queue.slice(1);
      this.playTrack(nextQueueItem.track);
    }
  }

  public prevTrack() {
    this.seek(0);
  }

  private handleTrackEnded() {
    this.nextTrack();
  }

  public addToQueue(track: Track, user: UserProfile = CURRENT_USER) {
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
    this.session.participants = this.session.participants.filter((p) => p.id !== userId);
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
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    realtimeStore.getNotifications()
  );

  useEffect(() => {
    const unsubscribe = realtimeStore.subscribe(() => {
      setNotifications([...realtimeStore.getNotifications()]);
    });
    return unsubscribe;
  }, []);

  return {
    notifications,
    markRead: (id: string) => realtimeStore.markNotificationRead(id),
    unreadCount: notifications.filter((n) => !n.read).length,
  };
}
