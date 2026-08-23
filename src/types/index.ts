export type UserRole = "user" | "creator" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  interests: string[];
  favoriteGenres: string[];
  favoriteArtists: string[];
  publicPlaylistsCount: number;
  privacy: "public" | "private" | "friends-only";
  joinedDate: string;
  onlineStatus?: "online" | "listening" | "offline";
  currentTrack?: Track;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverArt: string;
  duration: number; // in seconds
  audioUrl: string; // playable stream URL
  genre?: string;
  releaseYear?: number;
}

export interface CustomPlaylist {
  id: string;
  name: string;
  description?: string;
  coverArt?: string;
  tracks: Track[];
  createdAt: number;
  isDefault?: boolean;
}

export interface Post {
  id: string;
  author: UserProfile;
  createdAt: string;
  content: string;
  media?: {
    type: "image" | "video";
    url: string;
    aspectRatio?: number;
  }[];
  musicCard?: {
    track: Track;
    sharedNote?: string;
  };
  poll?: {
    question: string;
    options: { id: string; text: string; votes: number }[];
    totalVotes: number;
    userVotedOptionId?: string;
  };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  author: UserProfile;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface Moment {
  id: string;
  author: UserProfile;
  type: "photo" | "video" | "music";
  mediaUrl?: string;
  track?: Track;
  caption?: string;
  createdAt: string;
  expiresAt: string;
  isViewed?: boolean;
  reactionsCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: "text" | "image" | "video" | "audio" | "listen-invite" | "disappearing";
  mediaUrl?: string;
  listenSessionId?: string;
  listenTrack?: Track;
  isViewOnce?: boolean;
  isViewed?: boolean;
  reactions?: { emoji: string; count: number; userReacted?: boolean }[];
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  name?: string;
  avatar?: string;
  unreadCount: number;
  lastMessage?: Message;
  members: UserProfile[];
  activeListenSessionId?: string;
}

export interface CoupleSpaceData {
  id: string;
  partner1: UserProfile;
  partner2: UserProfile;
  relationshipStartDate: string; // e.g. "2023-02-14"
  anniversaryTitle: string;
  anniversaryDate: string; // Next anniversary date
  streakDays: number;
  moodPartner1: { emoji: string; status: string; updatedAt: string };
  moodPartner2: { emoji: string; status: string; updatedAt: string };
  dailyQuestion: {
    question: string;
    answer1?: string;
    answer2?: string;
  };
  sharedMemories: {
    id: string;
    title: string;
    imageUrl: string;
    date: string;
    note: string;
  }[];
  couplePlaylists: Playlist[];
  sharedNotes: { id: string; author: string; content: string; date: string }[];
}

export interface Space {
  id: string;
  name: string;
  type: "couple" | "best-friends" | "friend-group" | "gaming" | "college" | "music" | "fan";
  coverImage: string;
  icon: string;
  isPrivate: boolean;
  description: string;
  membersCount: number;
  members: UserProfile[];
  activeListeningSessionId?: string;
  activeVoiceRoomId?: string;
  coupleData?: CoupleSpaceData;
}

export interface QueueItem {
  id: string;
  track: Track;
  addedBy: UserProfile;
  votes: number;
  votedBy: string[]; // user IDs
}

export interface PlaybackState {
  sessionId: string;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentPosition: number; // seconds
  playbackRate: number;
  updatedAt: number; // server timestamp in ms
  hostId: string;
}

export interface ListeningSession {
  id: string;
  title: string;
  host: UserProfile;
  coHosts: UserProfile[];
  participants: UserProfile[];
  isPublic: boolean;
  roomCode: string;
  spaceId?: string;
  playbackState: PlaybackState;
  queue: QueueItem[];
  controlMode: "host-only" | "everyone" | "voting";
  liveChat: { id: string; author: UserProfile; text: string; time: string; system?: boolean }[];
  currentReactions: { id: string; emoji: string; userId: string; userName: string; timestamp: number }[];
  syncStatus: "synced" | "syncing" | "error";
  driftMs: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverArt: string;
  isPublic: boolean;
  owner: UserProfile;
  collaborators: UserProfile[];
  tracks: Track[];
  likesCount: number;
  type?: "couple" | "friend" | "community" | "party";
}

export interface LiveVoiceRoom {
  id: string;
  title: string;
  host: UserProfile;
  coHosts: UserProfile[];
  speakers: UserProfile[];
  listeners: UserProfile[];
  isMusicConnected: boolean;
  connectedSession?: ListeningSession;
  spaceId?: string;
  communityId?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: "text" | "voice" | "music";
  unread?: boolean;
}

export interface Community {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  banner: string;
  description: string;
  membersCount: number;
  isJoined?: boolean;
  channels: Channel[];
  moderators: UserProfile[];
  rules: string[];
}

export interface NotificationItem {
  id: string;
  type: "like" | "comment" | "follow" | "message" | "space-invite" | "listen-invite" | "playlist-collab";
  actor: UserProfile;
  text: string;
  time: string;
  read: boolean;
  targetId?: string;
  actionPayload?: any;
}
