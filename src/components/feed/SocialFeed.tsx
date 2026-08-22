"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Plus,
  Radio,
  CheckCircle2,
  Link as LinkIcon,
  Trash2,
  Flag,
} from "lucide-react";
import { Post, Track, UserProfile } from "@/types";
import { MusicCard } from "./MusicCard";

interface SocialFeedProps {
  posts: Post[];
  currentUser: UserProfile;
  onPlayTrackPreview: (track: Track) => void;
  onStartListeningSession: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onOpenCreatePost: () => void;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({
  posts: initialPosts,
  currentUser,
  onPlayTrackPreview,
  onStartListeningSession,
  onAddToQueue,
  onOpenCreatePost,
}) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // Click outside to close options dropdown menu
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuPostId(null);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleCopyLink = (postId: string) => {
    setCopiedPostId(postId);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const handleReportPost = (postId: string) => {
    alert("Thank you. This post has been reported for review.");
  };

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1,
          };
        }
        return p;
      })
    );
  };

  const handleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, isSaved: !p.isSaved };
        }
        return p;
      })
    );
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.poll && !p.poll.userVotedOptionId) {
          const updatedOptions = p.poll.options.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          );
          return {
            ...p,
            poll: {
              ...p.poll,
              options: updatedOptions,
              totalVotes: p.poll.totalVotes + 1,
              userVotedOptionId: optionId,
            },
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment = {
            id: `c-${Date.now()}`,
            author: currentUser,
            content: commentInput,
            createdAt: "Just now",
            likesCount: 0,
          };
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...(p.comments || []), newComment],
          };
        }
        return p;
      })
    );
    setCommentInput("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24">
      {/* Posts List */}
      {posts.map((post) => (
        <article
          key={post.id}
          className="vibe-card p-5 sm:p-6 shadow-md relative overflow-hidden transition-all"
        >
          {/* Post Header */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold theme-text-primary text-sm hover:text-purple-500 transition-colors cursor-pointer">
                    {post.author.name}
                  </h3>
                  <span className="text-xs theme-text-muted">@{post.author.username}</span>
                </div>
                <p className="text-[11px] theme-text-muted font-medium">{post.createdAt}</p>
              </div>
            </div>

            {/* Three-Dot Options Dropdown Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuPostId(openMenuPostId === post.id ? null : post.id);
                }}
                className="p-2 rounded-full hover:bg-[#E4E6EB] text-[#65676B] hover:text-[#050505] transition-colors"
                title="Options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {openMenuPostId === post.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-10 w-48 bg-white border border-[#E4E6EB] rounded-2xl shadow-xl z-30 py-1.5 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Save / Bookmark Post */}
                  <button
                    onClick={() => {
                      handleBookmark(post.id);
                      setOpenMenuPostId(null);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-[#050505] hover:bg-[#F0F2F5] flex items-center gap-2.5 transition-colors"
                  >
                    <Bookmark className={`w-4 h-4 ${post.isSaved ? "text-[#1877F2] fill-[#1877F2]" : "text-[#65676B]"}`} />
                    <span>{post.isSaved ? "Unsave Post" : "Save Post"}</span>
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={() => {
                      handleCopyLink(post.id);
                      setOpenMenuPostId(null);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-[#050505] hover:bg-[#F0F2F5] flex items-center gap-2.5 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4 text-[#65676B]" />
                    <span>{copiedPostId === post.id ? "Link Copied!" : "Copy Link"}</span>
                  </button>

                  {/* Delete or Report Post */}
                  {post.author.id === currentUser.id ? (
                    <button
                      onClick={() => {
                        handleDeletePost(post.id);
                        setOpenMenuPostId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors border-t border-[#E4E6EB]/60 mt-1 pt-2"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>Delete Post</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleReportPost(post.id);
                        setOpenMenuPostId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors border-t border-[#E4E6EB]/60 mt-1 pt-2"
                    >
                      <Flag className="w-4 h-4 text-red-600" />
                      <span>Report Post</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Post Content */}
          <p className="text-sm theme-text-primary leading-relaxed mb-3 whitespace-pre-line">
            {post.content}
          </p>

          {/* Media Image or Video */}
          {post.media && post.media.length > 0 && (
            <div className="my-3 rounded-xl overflow-hidden theme-border border max-h-[420px] bg-black/90">
              {post.media[0].type === "video" ? (
                <video
                  src={post.media[0].url}
                  controls
                  className="w-full max-h-[420px] object-contain mx-auto"
                />
              ) : (
                <img
                  src={post.media[0].url}
                  alt="Post Media"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
          )}

          {/* Music Sharing Card */}
          {post.musicCard && (
            <MusicCard
              track={post.musicCard.track}
              sharedNote={post.musicCard.sharedNote}
              onPlayPreview={onPlayTrackPreview}
              onStartListeningSession={onStartListeningSession}
              onAddToQueue={onAddToQueue}
            />
          )}

          {/* Poll */}
          {post.poll && (
            <div className="my-4 p-4 rounded-xl vibe-card border border-purple-500/30 space-y-2.5">
              <h4 className="font-semibold theme-text-primary text-sm flex items-center justify-between">
                <span>{post.poll.question}</span>
                <span className="text-xs text-purple-500 font-normal">
                  ({post.poll.totalVotes} votes)
                </span>
              </h4>

              {post.poll.options.map((opt) => {
                const percentage =
                  post.poll?.totalVotes && post.poll.totalVotes > 0
                    ? Math.round((opt.votes / post.poll.totalVotes) * 100)
                    : 0;
                const isUserChoice = post.poll?.userVotedOptionId === opt.id;

                return (
                  <button
                    key={opt.id}
                    disabled={!!post.poll?.userVotedOptionId}
                    onClick={() => handleVotePoll(post.id, opt.id)}
                    className={`w-full p-3 rounded-xl relative overflow-hidden text-left border transition-all ${
                      isUserChoice
                        ? "border-purple-500 bg-purple-500/15"
                        : "theme-border theme-bg-secondary hover:border-purple-500/40"
                    }`}
                  >
                    {post.poll?.userVotedOptionId && (
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-purple-500/20 transition-all duration-700 pointer-events-none"
                        style={{ width: `${percentage}%` }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between text-xs font-semibold theme-text-primary">
                      <span className="flex items-center gap-2">
                        {isUserChoice && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
                        {opt.text}
                      </span>
                      {post.poll?.userVotedOptionId && (
                        <span className="text-purple-500 font-bold">{percentage}%</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Action Footer */}
          <div className="mt-3.5 pt-3 theme-border border-t flex items-center justify-between theme-text-secondary text-xs font-medium">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 py-1 px-2 rounded-lg transition-colors ${
                  post.isLiked ? "text-pink-500 font-bold" : "hover:theme-text-primary"
                }`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? "fill-pink-500 text-pink-500" : ""}`} />
                <span>{post.likesCount}</span>
              </button>

              <button
                onClick={() =>
                  setActiveCommentPostId(
                    activeCommentPostId === post.id ? null : post.id
                  )
                }
                className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:theme-text-primary transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{post.commentsCount}</span>
              </button>

              <button className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:theme-text-primary transition-colors">
                <Share2 className="w-4 h-4" />
                <span>{post.sharesCount}</span>
              </button>
            </div>

            <button
              onClick={() => handleBookmark(post.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                post.isSaved ? "text-purple-500" : "hover:theme-text-primary"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${post.isSaved ? "fill-purple-500" : ""}`} />
            </button>
          </div>

          {/* Comment Section */}
          {activeCommentPostId === post.id && (
            <div className="mt-4 pt-4 theme-border border-t space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 py-2 px-3 rounded-xl vibe-input text-xs"
                />
                <button
                  onClick={() => handleAddComment(post.id)}
                  className="py-2 px-4 rounded-xl btn-primary text-xs font-semibold"
                >
                  Reply
                </button>
              </div>

              {post.comments && post.comments.length > 0 && (
                <div className="space-y-2 mt-3 max-h-48 overflow-y-auto pr-1">
                  {post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-2.5 rounded-xl theme-bg-secondary theme-border border flex gap-2.5 text-xs"
                    >
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold theme-text-primary">{comment.author.name}</span>
                          <span className="text-[10px] theme-text-muted">{comment.createdAt}</span>
                        </div>
                        <p className="theme-text-secondary mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
};
