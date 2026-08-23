import { UserProfile, FriendRequest, NotificationItem } from "@/types";

const REQUESTS_KEY = "vibespace_friend_requests";
const FRIENDS_KEY = "vibespace_added_friends";

export type FriendshipStatus = "none" | "requested" | "friends" | "pending_received";

// Get all stored friend requests
export function getAllRequests(): FriendRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(REQUESTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// Get all accepted friend IDs for a user
export function getAcceptedFriendIds(userId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const data = localStorage.getItem(`${FRIENDS_KEY}_${userId}`);
    if (data) {
      return new Set(JSON.parse(data));
    }
    // Fallback to global legacy storage
    const globalData = localStorage.getItem(FRIENDS_KEY);
    return globalData ? new Set(JSON.parse(globalData)) : new Set();
  } catch (e) {
    return new Set();
  }
}

// Check current friendship status between two users
export function getFriendshipStatus(
  currentUserId: string,
  targetUserId: string
): FriendshipStatus {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) return "none";

  // 1. Check if accepted friends
  const friendIds = getAcceptedFriendIds(currentUserId);
  if (friendIds.has(targetUserId)) {
    return "friends";
  }

  // 2. Check requests
  const requests = getAllRequests();
  const pendingSent = requests.find(
    (r) => r.fromUser.id === currentUserId && r.toUserId === targetUserId && r.status === "pending"
  );
  if (pendingSent) return "requested";

  const pendingReceived = requests.find(
    (r) => r.fromUser.id === targetUserId && r.toUserId === currentUserId && r.status === "pending"
  );
  if (pendingReceived) return "pending_received";

  return "none";
}

// Send a friend request
export function sendFriendRequest(currentUser: UserProfile, targetUser: UserProfile): void {
  if (typeof window === "undefined") return;

  const requests = getAllRequests();
  const existing = requests.find(
    (r) => r.fromUser.id === currentUser.id && r.toUserId === targetUser.id
  );

  if (existing) {
    existing.status = "pending";
    existing.createdAt = "Just now";
  } else {
    const newReq: FriendRequest = {
      id: `req-${Date.now()}`,
      fromUser: currentUser,
      toUserId: targetUser.id,
      status: "pending",
      createdAt: "Just now",
    };
    requests.push(newReq);
  }

  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));

    // Save notification for recipient
    addNotificationForUser(targetUser.id, {
      id: `notif-${Date.now()}`,
      type: "friend-request",
      actor: currentUser,
      text: "sent you a friend request",
      time: "Just now",
      read: false,
      actionPayload: { requestId: `req-${Date.now()}` },
    });
  } catch (e) {}
}

// Accept a friend request
export function acceptFriendRequest(currentUser: UserProfile, fromUser: UserProfile): void {
  if (typeof window === "undefined") return;

  const requests = getAllRequests();
  const req = requests.find(
    (r) => r.fromUser.id === fromUser.id && r.toUserId === currentUser.id && r.status === "pending"
  );

  if (req) {
    req.status = "accepted";
  }

  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));

    // Add to current user's friends list
    const currentFriends = getAcceptedFriendIds(currentUser.id);
    currentFriends.add(fromUser.id);
    localStorage.setItem(`${FRIENDS_KEY}_${currentUser.id}`, JSON.stringify(Array.from(currentFriends)));

    // Add to sender's friends list
    const senderFriends = getAcceptedFriendIds(fromUser.id);
    senderFriends.add(currentUser.id);
    localStorage.setItem(`${FRIENDS_KEY}_${fromUser.id}`, JSON.stringify(Array.from(senderFriends)));

    // Global fallback
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(Array.from(currentFriends)));

    // Notify sender that request was accepted
    addNotificationForUser(fromUser.id, {
      id: `notif-${Date.now()}`,
      type: "friend-accepted",
      actor: currentUser,
      text: "accepted your friend request! You are now friends 🎉",
      time: "Just now",
      read: false,
    });
  } catch (e) {}
}

// Decline a friend request
export function declineFriendRequest(currentUserId: string, fromUserId: string): void {
  if (typeof window === "undefined") return;
  const requests = getAllRequests();
  const updated = requests.filter(
    (r) => !(r.fromUser.id === fromUserId && r.toUserId === currentUserId && r.status === "pending")
  );
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
  } catch (e) {}
}

// Remove/Unfriend
export function removeFriend(currentUserId: string, targetUserId: string): void {
  if (typeof window === "undefined") return;
  try {
    const currentFriends = getAcceptedFriendIds(currentUserId);
    currentFriends.delete(targetUserId);
    localStorage.setItem(`${FRIENDS_KEY}_${currentUserId}`, JSON.stringify(Array.from(currentFriends)));

    const targetFriends = getAcceptedFriendIds(targetUserId);
    targetFriends.delete(currentUserId);
    localStorage.setItem(`${FRIENDS_KEY}_${targetUserId}`, JSON.stringify(Array.from(targetFriends)));

    // Clear pending requests between them
    const requests = getAllRequests().filter(
      (r) =>
        !(
          (r.fromUser.id === currentUserId && r.toUserId === targetUserId) ||
          (r.fromUser.id === targetUserId && r.toUserId === currentUserId)
        )
    );
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  } catch (e) {}
}

// Helper to push notification to a specific user's store
function addNotificationForUser(userId: string, notification: NotificationItem): void {
  if (typeof window === "undefined") return;
  try {
    const key = `vibespace_notifications_${userId}`;
    const stored = localStorage.getItem(key);
    const list: NotificationItem[] = stored ? JSON.parse(stored) : [];
    list.unshift(notification);
    localStorage.setItem(key, JSON.stringify(list));

    // Also push to global notifications so active page picks it up immediately
    const globalStored = localStorage.getItem("vibespace_notifications");
    const globalList: NotificationItem[] = globalStored ? JSON.parse(globalStored) : [];
    globalList.unshift(notification);
    localStorage.setItem("vibespace_notifications", JSON.stringify(globalList));
  } catch (e) {}
}
