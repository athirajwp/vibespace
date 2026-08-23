import { Post, UserProfile, Track, Message } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8085/api";

/**
 * Fetch all feed posts from Spring Boot Backend
 */
export async function fetchPostsFromApi(): Promise<Post[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/posts`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.map((p: any) => ({
      id: p.id,
      author: p.author ? {
        id: p.author.id,
        name: p.author.name,
        username: p.author.username,
        avatar: p.author.avatar,
        bio: p.author.bio,
        followersCount: p.author.followersCount || 0,
        followingCount: p.author.followingCount || 0,
        postsCount: p.author.postsCount || 0,
        privacy: p.author.privacy || "public",
        joinedDate: p.author.joinedDate || "January 2024",
      } : {
        id: "usr-alex",
        name: "Alex Rivera ✨",
        username: "alex_vibes",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
      },
      createdAt: p.createdAt || "Just now",
      content: p.content || "",
      media: p.mediaUrl ? [{ type: p.mediaType || "image", url: p.mediaUrl }] : undefined,
      musicCard: p.sharedTrack ? {
        track: {
          id: p.sharedTrack.id,
          title: p.sharedTrack.title,
          artist: p.sharedTrack.artist,
          album: p.sharedTrack.album,
          coverArt: p.sharedTrack.coverArt,
          duration: p.sharedTrack.duration,
          audioUrl: p.sharedTrack.audioUrl,
          genre: p.sharedTrack.genre,
        },
        sharedNote: p.sharedNote,
      } : undefined,
      likesCount: p.likesCount || 0,
      commentsCount: p.commentsCount || 0,
      sharesCount: p.sharesCount || 0,
      isLiked: p.isLiked || false,
      isSaved: p.isSaved || false,
    }));
  } catch (err) {
    console.warn("Spring Boot Backend API offline, fallback to client state:", err);
    return null;
  }
}

/**
 * Create a new post via Spring Boot REST API
 */
export async function createPostApi(post: Post): Promise<Post | null> {
  try {
    const payload = {
      id: post.id,
      author: { id: post.author.id },
      content: post.content,
      createdAt: post.createdAt,
      mediaUrl: post.media && post.media.length > 0 ? post.media[0].url : null,
      mediaType: post.media && post.media.length > 0 ? post.media[0].type : null,
      sharedTrack: post.musicCard ? { id: post.musicCard.track.id } : null,
      sharedNote: post.musicCard ? post.musicCard.sharedNote : null,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      sharesCount: post.sharesCount,
    };

    const res = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    return post;
  } catch (err) {
    console.warn("Spring Boot Backend API post failed:", err);
    return null;
  }
}

/**
 * Toggle post like via Spring Boot REST API
 */
export async function toggleLikeApi(postId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/like`, { method: "POST" });
    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Delete post via Spring Boot REST API
 */
export async function deletePostApi(postId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}`, { method: "DELETE" });
    return res.ok;
  } catch (err) {
    return false;
  }
}
