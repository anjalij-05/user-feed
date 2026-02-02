// src/firebase/chatService.ts
import { ref, get, set, update, push, onValue } from "firebase/database";
import { db } from "@/firebase/config";
import axios from "axios";

const API_BASE = "https://app.klout.club/api/v1/user-chat";

export interface FirebaseMessage {
  id?: string;
  date: string;
  isRead: string;
  message: string;
  replier_id: string;
  sender_id: string;
  time: number;
  type: string;
}

export interface ChatRoom {
  id?: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: number;
  lastMessageDateTime: string;
  createdAt: number;
}

export interface ChatUser {
  _id: string;
  connectionId?: string;
  first_name?: string;
  last_name?: string;
  profileImage?: string;
  lastMessage?: string;
  lastMessageDateTime?: string;
  unreadCount?: number;
  toUserId: string;
  updatedAt?: string;
  userDetails?: {
    _id: string;
    first_name?: string;
    last_name?: string;
    profileImage?: string;
    [key: string]: any;
  }[];
}

class FirebaseChatService {
  // Always same roomId for both users
  getChatRoomId(fromUserId: string, toUserId: string): string {
    return [fromUserId, toUserId].join("_");
  }

  async createChatRoom(fromUserId: string, toUserId: string): Promise<string> {
    const roomId = this.getChatRoomId(fromUserId, toUserId);
    const roomRef = ref(db, `/${roomId}`);

    const snapshot = await get(roomRef);
    // console.log("snapshot",snapshot);
    if (!snapshot.exists()) {
      console.log(`✅ Creating new chat room: ${roomId}`);
      await set(roomRef, {});
    } else {
      console.log(`✅ Chat room already exists: ${roomId}`);
    }
    return roomId;
  }

  // Update the sendMessage method in chatService.ts

  async sendMessage(
    token: string,
    senderId: string,
    receiverId: string,
    messageText: string,
    connectionId: string,
    userName: string
  ): Promise<void> {
    const roomId = await this.createChatRoom(senderId, receiverId);

    const messagesRef = ref(db, `/${roomId}`);
    const newMessageRef = push(messagesRef);

    const now = Date.now();
    const isoDate = new Date(now).toISOString().split("T")[0];

    // Send via API only if user is connected OR if premium user
    // For premium users without connection, skip API call (no notification)
    if (connectionId !== "premium_chat") {
      try {
        await axios.post(
          `${API_BASE}/sendMessage`,
          {
            connectionId: connectionId,
            toUserId: receiverId,
            title: userName,
            message: messageText,
          },
          {
            headers: {
              "x-access-token": token,
              userid: senderId,
            },
          }
        );
        console.log("✅ Message sent via API");
      } catch (err) {
        console.error("❌ Failed to send via API:", err);
        // Don't throw error - continue with Firebase save
      }
    } else {
      console.log(
        "⭐ Premium user - Skipping API notification (not connected)"
      );
    }

    // Save in Firebase (works for both connected and non-connected premium users)
    const messageData: FirebaseMessage = {
      date: isoDate,
      isRead: "0",
      message: messageText,
      replier_id: receiverId,
      sender_id: senderId,
      time: now,
      type: "text",
    };

    await set(newMessageRef, messageData);
    console.log("✅ Message saved to Firebase");
  }

  // Firebase-only subscription
  subscribeToMessages(
    roomId: string,
    callback: (messages: FirebaseMessage[]) => void
  ): () => void {
    const messagesRef = ref(db, `${roomId}`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      console.log(snapshot.exists());
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const data = snapshot.val();
      const messages: FirebaseMessage[] = Object.entries(data).map(
        ([id, val]) => {
          const msg = val as any;
          return {
            id,
            date: msg.date,
            isRead: msg.isRead,
            message: msg.message,
            replier_id: msg.replier_id,
            sender_id: msg.sender_id,
            time:
              typeof msg.time === "string"
                ? Date.parse(msg.time) || Date.now()
                : msg.time,
            type: msg.type,
          };
        }
      );

      messages.sort((a, b) => a.time - b.time);
      callback(messages);
    });

    return () => unsubscribe();
  }

  //  Filter out recent messages (hide the latest N messages)
  filterOutRecentMessages(
    messages: FirebaseMessage[],
    hideRecentCount: number = 1
  ): FirebaseMessage[] {
    if (messages.length <= hideRecentCount) {
      // If we have fewer messages than the hide count, return empty array
      return [];
    }

    // Sort messages by timestamp (oldest first) and remove the last N messages
    const sortedMessages = [...messages].sort(
      (a, b) => Number(a.time) - Number(b.time)
    );
    return sortedMessages.slice(0, -hideRecentCount);
  }

  // Alternative: Filter out messages from the last N minutes
  filterOutRecentMessagesByTime(
    messages: FirebaseMessage[],
    hideRecentMinutes: number = 5
  ): FirebaseMessage[] {
    const now = Date.now();
    const cutoffTime = now - hideRecentMinutes * 60 * 1000;

    return messages.filter((message) => Number(message.time) < cutoffTime);
  }

  async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    const messagesRef = ref(db, `${roomId}`);
    const snapshot = await get(messagesRef);

    if (!snapshot.exists()) return;

    const updates: Record<string, any> = {};
    const msgs = snapshot.val();

    for (const mid in msgs) {
      const m = msgs[mid];
      if (m.replier_id === userId && !m.read) {
        updates[`${mid}/read`] = true;
      }
    }

    if (Object.keys(updates).length > 0) {
      await update(messagesRef, updates);
    }
  }

  // Firebase-only chat list
  async getChatList(userId: string): Promise<ChatUser[]> {
    const chatRoomsRef = ref(db);
    const snapshot = await get(chatRoomsRef);

    if (!snapshot.exists()) return [];

    const rooms = snapshot.val();
    const chatUsers: ChatUser[] = [];

    for (const [roomId, roomData] of Object.entries(rooms)) {
      const room = roomData as any;
      if (!room.participants || !room.participants.includes(userId)) continue;

      const otherUserId = room.participants.find((id: string) => id !== userId);
      if (!otherUserId) continue;

      // Count unread messages
      const messagesRef = ref(db, `${roomId}`);
      const messagesSnap = await get(messagesRef);
      let unreadCount = 0;

      if (messagesSnap.exists()) {
        Object.values(messagesSnap.val()).forEach((m: any) => {
          if (m.receiverId === userId && !m.read) {
            unreadCount++;
          }
        });
      }

      chatUsers.push({
        _id: userId,
        first_name: "", // fetch separately if needed
        last_name: "",
        profileImage: "",
        lastMessage: room.lastMessage || "No messages yet",
        toUserId: "",
        lastMessageDateTime: room.lastMessageDateTime,
        updatedAt: new Date(room.lastMessageTime).toISOString(),
        unreadCount,
      });
    }

    return chatUsers.sort(
      (a, b) =>
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime()
    );
  }
}

export const chatService = new FirebaseChatService();
