"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Headphones,
  Radio,
  Search,
  Phone,
  Video,
  Info,
  Smile,
  Mic,
  Image as ImageIcon,
  Heart,
  ChevronDown,
  Edit,
  Plus,
  Pin,
  Check,
  CheckCheck,
  Music,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Conversation, Message, UserProfile, Track } from "@/types";
import { MOCK_TRACKS } from "@/lib/mock-data";

interface ChatViewProps {
  conversations?: Conversation[];
  currentUser: UserProfile;
  onLaunchListenSessionFromChat: (partner: UserProfile, track: Track) => void;
}

interface NoteItem {
  id: string;
  userName: string;
  avatar: string;
  noteText?: string;
  musicTrack?: string;
  artist?: string;
  isCurrentUser?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversations: initialConversations,
  currentUser,
  onLaunchListenSessionFromChat,
}) => {
  // Enhanced Default Contacts based on Instagram DM reference UI
  const defaultContacts: Conversation[] = [
    {
      id: "conv-maya",
      isGroup: false,
      unreadCount: 0,
      members: [
        currentUser,
        {
          id: "usr-maya",
          name: "Maya Vance ✨",
          username: "maya_beats.lofi",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
          bio: "Lo-Fi Producer & Sound Designer 🎧",
          followersCount: 18500,
          followingCount: 420,
          postsCount: 154,
          interests: ["Lo-Fi", "Synth", "Sound Design"],
          favoriteGenres: ["Lo-Fi Beats", "Ambient"],
          favoriteArtists: ["Luna Chill", "Aether & Kael"],
          publicPlaylistsCount: 8,
          privacy: "public",
          joinedDate: "January 2024",
          onlineStatus: "online",
        },
      ],
      lastMessage: {
        id: "m-maya-last",
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: "You: Ready now! Joining room ✨",
        timestamp: "2m",
        type: "text",
      },
    },
    {
      id: "conv-devon",
      isGroup: false,
      unreadCount: 0,
      members: [
        currentUser,
        {
          id: "usr-devon",
          name: "Devon Reed 🎸",
          username: "devon_grooves",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop",
          bio: "Indie Rock Guitarist 🎸",
          followersCount: 14200,
          followingCount: 310,
          postsCount: 92,
          interests: ["Guitars", "Rock"],
          favoriteGenres: ["Indie Rock", "Acoustic"],
          favoriteArtists: ["Polyphia"],
          publicPlaylistsCount: 11,
          privacy: "public",
          joinedDate: "February 2024",
          onlineStatus: "online",
        },
      ],
      lastMessage: {
        id: "m-dev-1",
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: "You sent a music session invite.",
        timestamp: "12m",
        type: "text",
      },
    },
    {
      id: "conv-aria",
      isGroup: false,
      unreadCount: 0,
      members: [
        currentUser,
        {
          id: "usr-aria",
          name: "Aria Chen 🌙",
          username: "aria_acoustic",
          avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=250&auto=format&fit=crop",
          bio: "Vocalist & Songwriter 🎤",
          followersCount: 32000,
          followingCount: 290,
          postsCount: 180,
          interests: ["Vocals", "Piano"],
          favoriteGenres: ["Acoustic Pop", "R&B"],
          favoriteArtists: ["Anirudh"],
          publicPlaylistsCount: 9,
          privacy: "public",
          joinedDate: "March 2024",
          onlineStatus: "offline",
        },
      ],
      lastMessage: {
        id: "m-[#aria-1",
        senderId: "usr-aria",
        senderName: "Aria Chen 🌙",
        senderAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=250&auto=format&fit=crop",
        content: "Aria sent a audio clip.",
        timestamp: "45m",
        type: "text",
      },
    },
    {
      id: "conv-pixel",
      isGroup: false,
      unreadCount: 1,
      members: [
        currentUser,
        {
          id: "usr-pixel",
          name: "Pixel & Synth 🎛️",
          username: "pixel_synth_official",
          avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=250&auto=format&fit=crop",
          bio: "Modular Synthesizer Lab & Beats 🎛️",
          followersCount: 45000,
          followingCount: 120,
          postsCount: 310,
          interests: ["Synths", "EDM", "Cyberpunk"],
          favoriteGenres: ["Synthwave", "Cyberpunk"],
          favoriteArtists: ["Kavinsky", "Daft Punk"],
          publicPlaylistsCount: 15,
          privacy: "public",
          joinedDate: "January 2024",
          onlineStatus: "online",
        },
      ],
      lastMessage: {
        id: "m-pix-1",
        senderId: "usr-pixel",
        senderName: "Pixel & Synth 🎛️",
        senderAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=250&auto=format&fit=crop",
        content: "Pixel & Synth sent a project stem.",
        timestamp: "2h",
        type: "text",
      },
    },
    {
      id: "conv-liam",
      isGroup: false,
      unreadCount: 0,
      members: [
        currentUser,
        {
          id: "usr-liam",
          name: "Liam K. 🎧",
          username: "liam_synthwave",
          avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=250&auto=format&fit=crop",
          bio: "Chillhop & Night Grooves 🌙",
          followersCount: 9400,
          followingCount: 210,
          postsCount: 64,
          interests: ["Chillhop", "DJing"],
          favoriteGenres: ["Lo-Fi", "Chillhop"],
          favoriteArtists: ["Pradeep Kumar"],
          publicPlaylistsCount: 6,
          privacy: "public",
          joinedDate: "December 2023",
          onlineStatus: "offline",
        },
      ],
      lastMessage: {
        id: "m-liam-1",
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: "You: Catch you at the voice stage! 🎙️",
        timestamp: "5h",
        type: "text",
      },
    },
  ];

  const conversationList = initialConversations && initialConversations.length > 0
    ? initialConversations
    : defaultContacts;

  const [selectedConv, setSelectedConv] = useState<Conversation>(conversationList[0]);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [activeTab, setActiveTab] = useState<"messages" | "requests">("messages");
  const [searchQuery, setSearchQuery] = useState("");

  const [inputText, setInputText] = useState("");
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Custom Generated Messages for all contacts
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({
    "conv-maya": [
      {
        id: "m-1",
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: "Hey Maya! Did you get a chance to listen to that new ambient track snippet? 🎧",
        timestamp: "10:10 PM",
        type: "text",
      },
      {
        id: "m-2",
        senderId: "usr-maya",
        senderName: "Maya Vance ✨",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
        content: "Yes! The synth harmonies on that second drop are unreal ✨",
        timestamp: "10:12 PM",
        type: "text",
      },
      {
        id: "m-3",
        senderId: "usr-maya",
        senderName: "Maya Vance ✨",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
        content: "Are you working on the full mix tonight?",
        timestamp: "10:13 PM",
        type: "text",
      },
      {
        id: "m-4",
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: "Yup! Just wrapping up the vocal stems right now. Feels like butterflies every time that beat drops 🦋",
        timestamp: "10:15 PM",
        type: "text",
      },
      {
        id: "m-5",
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: "Sending you a preview link in a second",
        timestamp: "10:15 PM",
        type: "text",
        reactions: [{ emoji: "❤️", count: 1, userReacted: true }],
      },
      {
        id: "m-6",
        senderId: "usr-maya",
        senderName: "Maya Vance ✨",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
        content: "Super excited! Let's start a Listen Together session when you're ready 🎵",
        timestamp: "10:16 PM",
        type: "text",
      },
      {
        id: "m-7",
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: "Sounds awesome! Grabbing some coffee first ☕",
        timestamp: "10:18 PM",
        type: "text",
      },
      {
        id: "m-8",
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: "Be right back in 5 mins!",
        timestamp: "10:18 PM",
        type: "text",
      },
      {
        id: "m-9",
        senderId: "usr-maya",
        senderName: "Maya Vance ✨",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
        content: "Take your time! I'll be in the studio room 🌙",
        timestamp: "10:20 PM",
        type: "text",
      },
      {
        id: "m-10",
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: "Ready now! Joining room ✨",
        timestamp: "10:23 PM",
        type: "text",
      },
    ],
    "conv-devon": [
      {
        id: "m-dev-1",
        senderId: "usr-devon",
        senderName: "Devon Reed 🎸",
        senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop",
        content: "Hey! Ready for tonight's acoustic session? 🎸",
        timestamp: "9:45 PM",
        type: "text",
      },
      {
        id: "m-dev-2",
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: "You sent a music session invite.",
        timestamp: "9:50 PM",
        type: "text",
      },
    ],
    "conv-aria": [
      {
        id: "m-aria-1",
        senderId: "usr-aria",
        senderName: "Aria Chen 🌙",
        senderAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=250&auto=format&fit=crop",
        content: "Aria sent a audio clip.",
        timestamp: "8:15 PM",
        type: "text",
      },
    ],
    "conv-pixel": [
      {
        id: "m-[#pixel-1",
        senderId: "usr-pixel",
        senderName: "Pixel & Synth 🎛️",
        senderAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=250&auto=format&fit=crop",
        content: "Pixel & Synth sent a project stem.",
        timestamp: "7:30 PM",
        type: "text",
      },
    ],
    "conv-liam": [
      {
        id: "m-liam-1",
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: "Catch you at the voice stage! 🎙️",
        timestamp: "5:00 PM",
        type: "text",
      },
    ],
  });

  // Notes Bar Status Items (Instagram Stories/Notes bar above chats)
  const notesList: NoteItem[] = [
    {
      id: "note-me",
      userName: "Your note",
      avatar: currentUser.avatar,
      noteText: "+ What's new...",
      isCurrentUser: true,
    },
    {
      id: "note-maya",
      userName: "Maya Vance ✨",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
      musicTrack: "Midnight Waves",
      artist: "Luna Chill",
    },
    {
      id: "note-devon",
      userName: "Devon Reed 🎸",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop",
      noteText: "Jamming live 9 PM!",
    },
    {
      id: "note-aria",
      userName: "Aria Chen 🌙",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=250&auto=format&fit=crop",
      musicTrack: "Stardust Acoustic",
      artist: "Aria Chen",
    },
    {
      id: "note-liam",
      userName: "Liam K. 🎧",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=250&auto=format&fit=crop",
      noteText: "Chillhop Session ☕",
    },
  ];

  const currentMessages = messagesMap[selectedConv.id] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesMap, selectedConv.id]);

  const partner = selectedConv.members.find((m) => m.id !== currentUser.id) || selectedConv.members[0];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), newMsg],
    }));

    setInputText("");

    // Simulated Auto-Reply after 1s
    setTimeout(() => {
      const replies: Record<string, string> = {
        "conv-maya": "Awesome! Let's vibe to the track together ✨",
        "conv-devon": "Got your message! Jamming live in a bit 🎸",
        "conv-aria": "Sounds lovely! Thanks for sharing 🌙",
        "conv-pixel": "Stems received! Synthesizer loaded 🎛️",
        "conv-liam": "Catch you at the live stage 🎧",
      };

      const partnerUser = selectedConv.members.find((m) => m.id !== currentUser.id) || selectedConv.members[0];
      const replyMsg: Message = {
        id: `msg-reply-${Date.now()}`,
        senderId: partnerUser.id,
        senderName: partnerUser.name,
        senderAvatar: partnerUser.avatar,
        content: replies[selectedConv.id] || "Got it! Thanks for messaging 👍",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "text",
      };

      setMessagesMap((prev) => ({
        ...prev,
        [selectedConv.id]: [...(prev[selectedConv.id] || []), replyMsg],
      }));
    }, 1000);
  };

  const handleSendHeart = () => {
    const heartMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: "❤️",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), heartMsg],
    }));
  };

  const handleSendListenInvite = (track: Track) => {
    const inviteMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: `🎵 Invited you to listen to "${track.title}" together!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "listen-invite",
      listenTrack: track,
      listenSessionId: "session-couple-1",
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), inviteMsg],
    }));
    setShowMusicPicker(false);
    onLaunchListenSessionFromChat(partner, track);
  };

  const filteredConversations = conversationList.filter((conv) => {
    const partnerUser = conv.members.find((m) => m.id !== currentUser.id) || conv.members[0];
    const nameToSearch = conv.isGroup ? conv.name : partnerUser.name;
    return nameToSearch?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-[calc(100dvh-9rem)] lg:h-[calc(100vh-4.5rem)] max-w-7xl mx-auto vibe-card rounded-3xl overflow-hidden border border-[#E4E6EB] grid grid-cols-1 md:grid-cols-12 shadow-sm bg-white select-none">
      {/* LEFT PANEL: Conversations & Notes List */}
      <div className={`${showMobileChat ? "hidden md:flex" : "flex"} md:col-span-4 border-r border-[#E4E6EB] flex-col h-full bg-[#F0F2F5]/80`}>


        {/* Search Input Bar */}
        <div className="px-4 py-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#65676B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full py-2 pl-9 pr-4 rounded-xl bg-[#E4E6EB]/70 border border-transparent focus:border-[#1877F2]/40 text-xs font-medium placeholder-[#65676B] focus:outline-none transition-all"
            />
          </div>
        </div>



        {/* Section Tabs (Messages / Requests) */}
        <div className="px-4 py-2 flex items-center justify-between text-xs font-bold border-b border-[#E4E6EB]/60">
          <button
            onClick={() => setActiveTab("messages")}
            className={`py-1 ${
              activeTab === "messages" ? "text-[#050505]" : "text-[#65676B] hover:text-[#050505]"
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`py-1 text-[#65676B] hover:text-[#050505] font-semibold flex items-center gap-1`}
          >
            <span>Requests</span>
            <span className="w-2 h-2 rounded-full bg-[#1877F2]" />
          </button>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.map((conv) => {
            const otherUser = conv.members.find((m) => m.id !== currentUser.id) || conv.members[0];
            const isSelected = selectedConv.id === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedConv(conv);
                  setShowMobileChat(true);
                }}
                className={`p-3 rounded-2xl cursor-pointer flex items-center gap-3 transition-all ${
                  isSelected
                    ? "bg-white border border-[#E4E6EB] shadow-xs"
                    : "hover:bg-[#E4E6EB]/60 border border-transparent"
                }`}
              >
                {/* Contact Avatar */}
                <div className="relative">
                  <img
                    src={conv.isGroup ? conv.avatar : otherUser.avatar}
                    alt={conv.name || otherUser.name}
                    className="w-13 h-13 rounded-full object-cover border border-[#E4E6EB]"
                  />
                  {otherUser.onlineStatus === "online" && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>

                {/* Conversation Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#050505] truncate flex items-center gap-1">
                      <span>{conv.isGroup ? conv.name : otherUser.name}</span>
                      {conv.id === "conv-pretty" && (
                        <span className="text-[10px] font-normal text-[#65676B]">📌</span>
                      )}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#65676B] truncate mt-0.5">
                    <span className="truncate">{conv.lastMessage?.content}</span>
                    <span>•</span>
                    <span className="shrink-0">{conv.lastMessage?.timestamp}</span>
                  </div>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: Active Direct Message View */}
      <div className={`${showMobileChat ? "flex" : "hidden md:flex"} md:col-span-8 flex-col h-full bg-white relative`}>
        {/* Chat Header */}
        <div className="h-16 px-4 sm:px-6 border-b border-[#E4E6EB] flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Back Button */}
            <button
              onClick={() => setShowMobileChat(false)}
              className="md:hidden p-1.5 -ml-1 mr-1 rounded-full text-[#050505] hover:bg-[#F0F2F5] transition-colors"
              title="Back to contacts"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <img
                src={partner.avatar}
                alt={partner.name}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-[#1877F2]/40"
              />
              {partner.onlineStatus === "online" && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#050505] flex items-center gap-1.5">
                <span>{partner.name}</span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#65676B] font-medium">
                @{partner.username}
              </p>
            </div>
          </div>

          {/* Action Icons Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMusicPicker(!showMusicPicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 text-xs font-bold transition-all"
              title="Listen Together"
            >
              <Headphones className="w-4 h-4" />
              <span className="hidden sm:inline">Listen Together</span>
            </button>

            <button className="p-2 rounded-full hover:bg-[#F0F2F5] text-[#050505] transition-colors" title="Call">
              <Phone className="w-5 h-5 stroke-[1.75]" />
            </button>
            <button className="p-2 rounded-full hover:bg-[#F0F2F5] text-[#050505] transition-colors" title="Video Call">
              <Video className="w-5 h-5 stroke-[1.75]" />
            </button>
            <button className="p-2 rounded-full hover:bg-[#F0F2F5] text-[#050505] transition-colors" title="Details">
              <Info className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>
        </div>

        {/* Music Selector Panel (If active) */}
        {showMusicPicker && (
          <div className="absolute top-16 right-6 w-80 vibe-card rounded-2xl p-4 border border-[#1877F2]/40 z-30 shadow-xl space-y-3 bg-white animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#050505] flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-[#1877F2]" />
                <span>Select Song to Listen Together</span>
              </h4>
              <button
                onClick={() => setShowMusicPicker(false)}
                className="text-[#65676B] hover:text-[#050505] font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {MOCK_TRACKS.map((track) => (
                <div
                  key={track.id}
                  onClick={() => handleSendListenInvite(track)}
                  className="p-2 rounded-xl vibe-card flex items-center gap-3 cursor-pointer hover:border-[#1877F2] transition-all"
                >
                  <img
                    src={track.coverArt}
                    alt={track.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#050505] truncate">{track.title}</p>
                    <p className="text-[10px] text-[#65676B] truncate">{track.artist}</p>
                  </div>
                  <Plus className="w-4 h-4 text-[#1877F2]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Feed View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {currentMessages.map((msg, index) => {
            const isMe = msg.senderId === currentUser.id;
            const isLastFromUser =
              index === currentMessages.length - 1 ||
              currentMessages[index + 1].senderId !== msg.senderId;

            return (
              <div key={msg.id} className="space-y-1">
                <div
                  className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${
                    isMe ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  {/* Left Avatar for partner messages */}
                  {!isMe && (
                    <div className="w-7 h-7 shrink-0">
                      {isLastFromUser ? (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7" />
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className="relative group">
                    <div
                      className={`px-4 py-2.5 rounded-3xl text-xs sm:text-sm leading-relaxed transition-all relative ${
                        isMe
                          ? "bg-[#1877F2] text-white font-medium shadow-xs rounded-br-md"
                          : "bg-[#E4E6EB] text-[#050505] font-medium rounded-bl-md"
                      }`}
                    >
                      {msg.type === "listen-invite" && msg.listenTrack ? (
                        <div className="space-y-2.5">
                          <p className="font-bold flex items-center gap-1.5">
                            <Headphones className="w-4 h-4 text-white" />
                            <span>Listen Together Request</span>
                          </p>
                          <div className="p-2.5 rounded-xl bg-black/20 flex items-center gap-2.5">
                            <img
                              src={msg.listenTrack.coverArt}
                              alt={msg.listenTrack.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-white truncate">{msg.listenTrack.title}</p>
                              <p className="text-[10px] text-blue-100 truncate">{msg.listenTrack.artist}</p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              onLaunchListenSessionFromChat(partner, msg.listenTrack!)
                            }
                            className="w-full py-2 rounded-xl bg-white text-[#1877F2] font-bold text-xs hover:bg-gray-100 transition-colors shadow-xs"
                          >
                            Join Music Room 🎧
                          </button>
                        </div>
                      ) : (
                        <span>{msg.content}</span>
                      )}
                    </div>

                    {/* Reaction Pill Overlay */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div
                        className={`absolute -bottom-2 ${
                          isMe ? "right-2" : "left-2"
                        } bg-white border border-[#E4E6EB] rounded-full px-1.5 py-0.5 shadow-xs flex items-center text-[10px]`}
                      >
                        {msg.reactions.map((r, i) => (
                          <span key={i}>{r.emoji}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Timestamp / Seen info on last message */}
                {index === currentMessages.length - 1 && isMe && (
                  <div className="flex justify-end pr-1 text-[10px] text-[#65676B] font-semibold">
                    <span>Seen 5m ago</span>
                  </div>
                )}
              </div>
            );
          })}
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Footer */}
        <div className="p-3 sm:p-4 border-t border-[#E4E6EB] bg-white shrink-0 sticky bottom-0 z-20">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-white rounded-full border border-[#E4E6EB] px-3 py-1.5 shadow-xs focus-within:border-[#1877F2]/50 transition-all"
          >
            {/* Smile Emoji Icon */}
            <button
              type="button"
              className="p-1.5 text-[#050505] hover:text-[#1877F2] transition-colors rounded-full"
              title="Emoji"
            >
              <Smile className="w-5 h-5 stroke-[1.75]" />
            </button>

            {/* Main Text Field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-transparent py-1 px-2 text-xs sm:text-sm font-medium text-[#050505] placeholder-[#65676B] focus:outline-none"
            />

            {/* Dynamic Action Buttons on Right */}
            {inputText.trim() ? (
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-full bg-[#1877F2] text-white text-xs font-bold hover:bg-[#166FE5] transition-all shadow-xs"
              >
                Send
              </button>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  className="p-1.5 text-[#050505] hover:text-[#1877F2] transition-colors rounded-full"
                  title="Voice Message"
                >
                  <Mic className="w-5 h-5 stroke-[1.75]" />
                </button>
                <button
                  type="button"
                  className="p-1.5 text-[#050505] hover:text-[#1877F2] transition-colors rounded-full"
                  title="Photo"
                >
                  <ImageIcon className="w-5 h-5 stroke-[1.75]" />
                </button>
                <button
                  type="button"
                  onClick={handleSendHeart}
                  className="p-1.5 text-[#050505] hover:text-red-500 transition-colors rounded-full"
                  title="Heart"
                >
                  <Heart className="w-5 h-5 stroke-[1.75] hover:fill-red-500" />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
