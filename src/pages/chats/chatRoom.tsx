import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { checkConnectionStatus } from "@/app-api/connections";
import { useAppDispatch } from "@/redux/hooks";
import { fetchBookmarkedList } from "@/app-api/bookmark";
import { getUserProfileImage } from "@/lib/utils";
import DummyImage from "@/assets/dummy_image.webp";
import { ArrowLeft, Send, MoreVertical, X, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  chatService,
  ChatUser,
  type FirebaseMessage,
} from "@/firebase/chatService";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { fetchProfileDetails } from "@/app-api/nearbyProfiles";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
}

// Common emojis for quick access
const commonEmojis = [
  "😊",
  "😂",
  "❤️",
  "👍",
  "🔥",
  "🎉",
  "🙏",
  "👋",
  "😍",
  "🤔",
  "😎",
  "🥳",
  "🙌",
  "💯",
  "✨",
  "😢",
  "🤣",
  "🥰",
  "😘",
  "🤩",
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    // Keep popover open for quick multiple selections
    // setIsOpen(false);
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="p-2 h-10 w-10 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={popoverRef}
        className="w-80 p-4 border shadow-lg"
        align="start"
        side="top"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm text-foreground">
            Choose an emoji
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0 hover:bg-accent"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="grid grid-cols-8 gap-2">
          {commonEmojis.map((emoji, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center text-lg transition-colors duration-150 hover:scale-110 active:scale-95"
              title={`Add ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Click an emoji to add it to your message
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ChatRoom: React.FC = () => {
  const { bothUserId } = useParams<{ bothUserId: string }>();
  const chatUserId = bothUserId?.split("_")[1];
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialLoad = useRef(true);

  const { user, token } = useAppSelector((state: any) => state.auth);
  const { userProfiles, bookmarked, connectionIdData } = useAppSelector(
    (state: any) => state.connection
  );

  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<FirebaseMessage[]>([]);
  const [messages2, setMessages2] = useState<FirebaseMessage[]>([]);
  const [allMessages, setAllMessages] = useState<FirebaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const dispatch = useAppDispatch();

  // Prevent body scroll when component mounts
  useEffect(() => {
    // Save original overflow style
    const originalOverflow = document.body.style.overflow;

    // Disable body scroll
    document.body.style.overflow = "hidden";

    // Restore on unmount
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Enhanced scroll to bottom function
  const scrollToBottom = () => {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (allMessages.length > 0) {
      // For initial load, scroll instantly
      if (isInitialLoad.current) {
        // Use a longer timeout for initial load to ensure DOM is ready
        setTimeout(() => {
          scrollToBottom();
          isInitialLoad.current = false;
        }, 300);
      } else {
        // For subsequent messages, scroll with smooth behavior
        scrollToBottom();
      }
    }
  }, [allMessages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch connected + bookmarked on mount
  useEffect(() => {
    if (token && user?._id) {
      dispatch(
        checkConnectionStatus({
          token,
          userId: user._id,
        })
      );
      dispatch(
        fetchBookmarkedList({
          token,
          userId: user._id,
          latitude: 19.1723617,
          longitude: 72.8605305,
          distance: 50,
        })
      );
    }
  }, [dispatch, token, user?._id]);

  // Subscribe to messages from Firebase
  useEffect(() => {
    if (!user?._id || !chatUserId) return;
    setLoading(true);

    const roomId = chatService.getChatRoomId(user._id, chatUserId);
    const roomId2 = chatService.getChatRoomId(chatUserId, user._id);

    const unsubscribe = chatService.subscribeToMessages(
      roomId,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
      }
    );

    const unsubscribe2 = chatService.subscribeToMessages(
      roomId2,
      (newMessages) => {
        setMessages2(newMessages);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, [user?._id, chatUserId]);

  useEffect(() => {
    const newArr = [...messages, ...messages2];
    setAllMessages(newArr);
  }, [messages, messages2]);

  // Find chat user from profiles
  useEffect(() => {
    const fetchChatUser = async () => {
      if (chatUser) return; // Already found

      // First, try to find in existing profiles
      const allUsers = [...userProfiles, ...bookmarked];
      const foundUser = allUsers.find((u) => u._id === chatUserId);

      if (foundUser) {
        setChatUser(foundUser);
        return;
      }

      // If not found and user is premium, fetch profile directly
      if (user?.role?.toLowerCase() === "premium" && token && chatUserId) {
        try {
          const profileData = await fetchProfileDetails(
            token,
            user._id,
            chatUserId,
            28.6139, // fallback coords
            77.209,
            50
          );

          if (profileData?.result?.details) {
            const details = profileData.result.details;
            const formattedUser: ChatUser = {
              _id: details._id,
              first_name: details.firstName || details.first_name || "",
              last_name: details.lastName || details.last_name || "",
              profileImage: details.profileImage || "",
              toUserId: chatUserId,
              connectionId: undefined,
              lastMessage: "",
              lastMessageDateTime: "",
              unreadCount: 0,
              updatedAt: new Date().toISOString(),
            };
            setChatUser(formattedUser);
          }
        } catch (error) {
          console.error("Failed to fetch chat user profile:", error);
        }
      }
    };

    fetchChatUser();
  }, [userProfiles, bookmarked, chatUserId, chatUser, user, token]);

  const getDisplayName = () => {
    if (!chatUser) return "Unknown User";
    const firstName = chatUser.first_name || "";
    const lastName = chatUser.last_name || "";
    return `${firstName} ${lastName}`.trim() || "Unknown User";
  };

  const getProfileImage = () => {
    if (!chatUser?.profileImage) return DummyImage;
    return getUserProfileImage(
      user?.imageBaseUrl as string,
      chatUser.profileImage
    );
  };

  const userName =
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "User";

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?._id || !chatUserId || !token || isSending)
      return;

    // Find correct connectionId for the current chatUserId
    let connectionId = connectionIdData.find(
      (c: any) => c.userId === chatUserId
    )?.connectionId;

    // If no connectionId found and user is premium, use a placeholder
    const isUserPremium = user?.role?.toLowerCase() === "premium";

    if (!connectionId) {
      if (isUserPremium) {
        console.log("⭐ Premium user chatting without connection");
        connectionId = "premium_chat";
      } else {
        console.error("❌ No connectionId found for user:", chatUserId);
        toast.error(
          "Unable to send message. Please connect with this user first."
        );
        return;
      }
    }

    setIsSending(true);
    try {
      await chatService.sendMessage(
        token,
        user._id,
        chatUserId,
        newMessage.trim(),
        connectionId,
        userName
      );
      setNewMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isMyMessage = (message: FirebaseMessage) => {
    return message.sender_id === user?._id;
  };

  const getMessageStatus = (message: FirebaseMessage, index: number) => {
    if (!isMyMessage(message)) return null;

    const isRead = message.isRead === "1";
    const isLastMessage = index === allMessages.length - 1;

    return { isRead, isLastMessage };
  };

  if (!chatUser && !loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background overflow-hidden">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Chat Not Found
            </h3>
            <p className="text-muted-foreground text-sm">
              The chat you're looking for doesn't exist
            </p>
          </div>
          <Button onClick={() => navigate("/chats")} variant="outline">
            Back to Chats
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background overflow-hidden">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div>
            <p className="text-foreground font-medium">Loading conversation</p>
            <p className="text-muted-foreground text-sm">
              Getting messages ready...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header - Fixed height */}
      <div className="bg-card border-b px-4 py-3 flex items-center justify-between shrink-0 z-50 h-16">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/chats")}
            className="p-2 hover:bg-accent rounded-full shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Avatar className="w-10 h-10 border-2 border-background">
            <AvatarImage src={getProfileImage()} alt={getDisplayName()} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getDisplayName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <h2
              className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
              onClick={() =>
                navigate(
                  `/profile/${chatUser?.first_name?.toLowerCase()}-${chatUser?.last_name?.toLowerCase()}-${
                    chatUser?._id
                  }`
                )
              }
            >
              {getDisplayName()}
            </h2>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-accent rounded-full"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                navigate(
                  `/profile/${chatUser?.first_name?.toLowerCase()}-${chatUser?.last_name?.toLowerCase()}-${
                    chatUser?._id
                  }`
                )
              }
            >
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Block User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages Area - Takes remaining space with proper scrolling */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 bg-linear-to-b from-background to-muted/20"
        style={{
          height: "calc(100vh - 64px - 88px)",
          scrollBehavior: "smooth",
        }}
      >
        {allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-3xl">💬</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">No messages yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Start the conversation with {getDisplayName()} by sending a
                message below
              </p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              Say hello! 👋
            </Badge>
          </div>
        ) : (
          <div className="space-y-6 pb-8">
            {allMessages
              .filter(
                (message) =>
                  typeof message.message !== "undefined" &&
                  message.message !== null
              )
              .sort((a, b) => Number(a.time) - Number(b.time))
              .map((message, index, array) => {
                const isMine = message.sender_id === user._id;
                const messageStatus = getMessageStatus(message, index);
                const showStatus = isMine && index === array.length - 1;

                return (
                  <div
                    key={`${message.date}-${index}`}
                    className={`flex ${
                      isMine ? "justify-end" : "justify-start"
                    } group`}
                  >
                    <div
                      className={`flex ${
                        isMine ? "flex-row-reverse" : "flex-row"
                      } items-end gap-2 max-w-xs lg:max-w-md`}
                    >
                      {/* Avatar for received messages */}
                      {!isMine && (
                        <Avatar className="w-8 h-8 border-2 border-background">
                          <AvatarImage
                            src={getProfileImage()}
                            alt={getDisplayName()}
                          />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getDisplayName().charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`flex flex-col ${
                          isMine ? "items-end" : "items-start"
                        } space-y-1`}
                      >
                        {/* Message Bubble */}
                        <div
                          className={`relative px-4 py-3 rounded-2xl ${
                            isMine
                              ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm"
                              : "bg-card text-card-foreground border border-border rounded-bl-sm shadow-sm"
                          } group-hover:shadow-md transition-shadow`}
                        >
                          <p className="text-sm leading-relaxed wrap-break-words">
                            {message.message}
                          </p>
                        </div>

                        {/* Timestamp and Status */}
                        <div
                          className={`flex items-center gap-2 px-1 ${
                            isMine ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="text-xs text-muted-foreground">
                            {formatMessageTime(message.time)}
                          </span>

                          {/* Message status for sent messages */}
                          {showStatus && (
                            <div className="flex items-center gap-1">
                              {messageStatus?.isRead ? (
                                <div className="flex gap-0.5">
                                  <div className="w-3 h-3 border-2 border-primary rounded-full"></div>
                                  <div className="w-3 h-3 bg-primary rounded-full -ml-1"></div>
                                </div>
                              ) : (
                                <div className="w-3 h-3 border-2 border-muted-foreground/50 rounded-full"></div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input - Fixed height at bottom */}
      <div className="bg-card border-t px-4 py-4 shrink-0 h-[88px] z-50">
        <div className="flex items-end gap-2">
          {/* Emoji Picker */}
          <div className="flex shrink-0">
            <EmojiPicker
              onEmojiSelect={(emoji) => setNewMessage((prev) => prev + emoji)}
              disabled={isSending}
            />
          </div>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isSending}
              className="pr-12 h-11 rounded-2xl bg-background border-input focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* Character count for very long messages */}
            {newMessage.length > 200 && (
              <div className="absolute -top-6 right-0">
                <span
                  className={`text-xs ${
                    newMessage.length > 400
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {newMessage.length}/500
                </span>
              </div>
            )}
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            size="icon"
            className="rounded-full h-11 w-11 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
