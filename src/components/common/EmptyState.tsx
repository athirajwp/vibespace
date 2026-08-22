"use client";

import React from "react";
import { Headphones, MessageSquare, Users, Bell, Sparkles } from "lucide-react";

interface EmptyStateProps {
  type: "messages" | "spaces" | "listen" | "notifications";
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
}) => {
  const configs = {
    messages: {
      icon: MessageSquare,
      defaultTitle: "No conversations yet",
      defaultDesc: "Your messages and private chat invitations will appear here.",
    },
    spaces: {
      icon: Users,
      defaultTitle: "Create your first Space",
      defaultDesc: "Share memories, chat, and listen to music together in a digital room.",
    },
    listen: {
      icon: Headphones,
      defaultTitle: "Find someone & listen together",
      defaultDesc: "Start a real-time synchronized listening room or join a public party.",
    },
    notifications: {
      icon: Bell,
      defaultTitle: "You're all caught up",
      defaultDesc: "No new notifications right now. Check back later!",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="vibe-card p-8 text-center space-y-4 max-w-md mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <h3 className="font-bold text-lg text-white">{title || config.defaultTitle}</h3>
        <p className="text-xs text-gray-400 mt-1">{description || config.defaultDesc}</p>
      </div>

      {actionText && onAction && (
        <button onClick={onAction} className="py-2.5 px-5 rounded-xl btn-primary text-xs font-bold shadow-md">
          {actionText}
        </button>
      )}
    </div>
  );
};
