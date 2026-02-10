import React, { useEffect, useState, useCallback, useMemo } from "react";
import DummyImage from "@/assets/dummy_image.webp";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getUserProfileImage } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { chatService, type ChatUser } from "@/firebase/chatService";
import { deleteChatUser, fetchChatList } from "@/app-api/user";
import { ref, onValue } from "firebase/database";
import { db } from "@/firebase/config";
import { checkConnectionStatus } from "@/app-api/connections";
import {
  MoreVertical,
  Trash2,
  Search,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile } from "@/pages/explore";

const ChatPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  const { user, token } = useAppSelector((state) => state.auth);
  const {
    userProfiles,
    loading: connectionLoading,
    connectionIdData,
  } = useAppSelector((state) => state.connection);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user?._id) {
      dispatch(
        checkConnectionStatus({
          token,
          userId: user._id,
        }),
      );
    }
  }, [dispatch, token, user?._id]);

  // Fetch chat list from API + Firebase
  const getChats = useCallback(async () => {
    if (!user?._id || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiResult = await dispatch(
        fetchChatList({ token, userId: user._id }),
      ).unwrap();
      const apiChatUsers: ChatUser[] = apiResult?.result?.chatUsers || [];

      const fbChatUsers: ChatUser[] = await chatService.getChatList(user._id);

      const merged = apiChatUsers.map((apiUser) => {
        const fbUser = fbChatUsers.find((f) => f._id === apiUser.connectionId);
        return {
          ...fbUser,
          ...apiUser,
        };
      });

      setChatUsers(merged);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
      setError("Failed to load chats");
      setChatUsers([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id, token, dispatch]);

  useEffect(() => {
    getChats();
  }, [getChats]);

  // Subscribe to Firebase chatRooms for real-time updates
  useEffect(() => {
    if (!user?._id) return;
    const chatRoomsRef = ref(db);
    const unsubscribe = onValue(chatRoomsRef, async (snapshot) => {
      if (!snapshot.exists()) return;

      const fbChatUsers: ChatUser[] = await chatService.getChatList(user._id);

      setChatUsers((prev) => {
        return prev.map((apiUser) => {
          const fbUser = fbChatUsers.find(
            (f) => f._id === apiUser.connectionId,
          );
          return {
            ...fbUser,
            ...apiUser,
          };
        });
      });
    });

    return () => unsubscribe();
  }, [user?._id]);

  // Filter chat users and connections by search term
  const filteredUsers = useMemo(() => {
    return chatUsers.filter((u) => {
      const userDetail = u.userDetails?.[0];
      const fullName = userDetail
        ? `${userDetail.first_name || ""} ${userDetail.last_name || ""}`.trim()
        : `${u.first_name || ""} ${u.last_name || ""}`.trim();
      return fullName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [chatUsers, searchTerm]);

  const filteredConnections = useMemo(() => {
    return userProfiles.filter((profile: Profile) => {
      const fullName = `${profile.first_name || ""} ${
        profile.last_name || ""
      }`.trim();
      return fullName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [userProfiles, searchTerm]);

  const getUserDisplayName = useCallback((chatUser: ChatUser) => {
    const userDetail = chatUser.userDetails?.[0];
    const fn = userDetail?.first_name?.trim() || chatUser.first_name?.trim();
    const ln = userDetail?.last_name?.trim() || chatUser.last_name?.trim();
    if (fn && ln) return `${fn} ${ln}`;
    return fn || ln || "Unknown User";
  }, []);

  // Handle delete chat
  const handleDeleteChat = useCallback(
    async (e: React.MouseEvent, chatUser: ChatUser) => {
      e.stopPropagation(); // Prevent chat click

      if (!user?._id || !token) return;

      // Validate required fields
      if (!chatUser.connectionId || !chatUser.toUserId) {
        console.error("Missing required fields for delete:", chatUser);
        alert("Unable to delete chat. Missing required information.");
        return;
      }

      const confirmDelete = window.confirm(
        `Are you sure you want to delete this chat with ${getUserDisplayName(
          chatUser,
        )}?`,
      );

      if (!confirmDelete) return;

      setDeletingChatId(chatUser._id);

      try {
        await dispatch(
          deleteChatUser({
            token,
            userId: user._id,
            connectionId: chatUser.connectionId,
            toUserId: chatUser.toUserId,
          }),
        ).unwrap();

        // Remove from local state
        setChatUsers((prev) =>
          prev.filter((chat) => chat._id !== chatUser._id),
        );
      } catch (error) {
        console.error("Failed to delete chat:", error);
        alert("Failed to delete chat. Please try again.");
      } finally {
        setDeletingChatId(null);
      }
    },
    [user?._id, token, dispatch, getUserDisplayName],
  );

  // Handle chat click
  const handleChatClick = useCallback(
    async (chatUser: ChatUser) => {
      if (!user?._id) return;

      const userDetail = chatUser.userDetails?.[0];
      const actualUserId = userDetail?._id;

      const connectionId = chatUser.connectionId;

      console.log("🔍 Navigating to chat with:", {
        chatUser,
        userDetail,
        actualUserId,
        connectionId,
      });

      try {
        await chatService.createChatRoom(
          user._id,
          chatUser?.toUserId as string,
        );

        navigate(`/chat/${user._id}_${chatUser?.toUserId}`, {
          state: {
            chatUser: {
              ...chatUser,
              connectionId,
              userDetails:
                chatUser.userDetails || (userDetail ? [userDetail] : []),
            },
          },
        });
      } catch (error) {
        console.error("Error creating/accessing chat room:", error);
        navigate(`/chat/${user._id}_${chatUser._id}`, {
          state: {
            chatUser: {
              ...chatUser,
              connectionId,
              userDetails:
                chatUser.userDetails || (userDetail ? [userDetail] : []),
            },
          },
        });
      }
    },
    [user?._id, navigate],
  );

  // Handle new connection click
  const handleNewConnectionClick = useCallback(
    (profile: Profile) => {
      const connectionId = connectionIdData[0]?.connectionId;

      console.log("🔍 Starting new chat with connection:", {
        profile,
        connectionId,
      });

      navigate(
        `/profile/${profile.first_name.toLowerCase()}-${profile.last_name.toLowerCase()}-${
          profile._id
        }`,
        {
          state: {
            chatUser: {
              _id: profile._id,
              connectionId,
              first_name: profile.first_name,
              last_name: profile.last_name,
              profileImage: profile.profileImage,
              userDetails: [profile],
            },
          },
        },
      );
    },
    [navigate, connectionIdData],
  );

  const formatLastMessageTime = useCallback((dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday)
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }, []);

  const getProfileImage = useCallback(
    (chatUser: ChatUser) => {
      const userDetail = chatUser.userDetails?.[0];
      return (
        (userDetail?.profileImage &&
          getUserProfileImage(
            user?.imageBaseUrl || "",
            userDetail.profileImage,
          )) ||
        (chatUser.profileImage &&
          getUserProfileImage(
            user?.imageBaseUrl || "",
            chatUser.profileImage,
          )) ||
        DummyImage
      );
    },
    [user],
  );

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Your Messages</h3>
            <p className="text-muted-foreground mb-4">
              Login to view and continue your conversations
            </p>
            <Button onClick={() => navigate("/user-login")} className="w-full cursor-pointer">
              Login to View Chats
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="w-full text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r bg-foreground bg-clip-text text-transparent">
          Messages
        </h1>
        <p className="text-muted-foreground text-sm">
          Connect and chat with your connections
        </p>
      </div>

      {/* Search Bar */}
      <div className="w-full relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 pl-10 pr-4 rounded-2xl bg-background border-input"
        />
      </div>

      {/* New Connections Section */}
      <Card className="w-full">
        <CardContent className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">New Connections</h2>
              <p className="text-sm text-muted-foreground">
                {filteredConnections.length} people to start chatting with
              </p>
            </div>
            {/* {filteredConnections.length > 6 && (
              <div className="flex gap-1">
                <CarouselPrevious className="static translate-y-0 h-8 w-8" />
                <CarouselNext className="static translate-y-0 h-8 w-8" />
              </div>
            )} */}
          </div>

          {connectionLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="w-12 h-3 rounded" />
                </div>
              ))}
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="text-center py-6">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                {searchTerm
                  ? "No matching connections"
                  : "No new connections yet"}
              </p>
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="flex gap-4 overflow-x-scroll">
                {filteredConnections.map((profile) => {
                  const profileImg =
                    getUserProfileImage(
                      user?.imageBaseUrl || "",
                      profile.profileImage,
                    ) || DummyImage;
                  const displayName = `${profile.first_name || ""} ${
                    profile.last_name || ""
                  }`.trim();

                  return (
                    <CarouselItem
                      key={profile._id}
                      className="basis-1/3 sm:basis-1/4 md:basis-1/6 flex justify-center"
                    >
                      <div
                        onClick={() => handleNewConnectionClick(profile)}
                        className="flex flex-col items-center cursor-pointer group text-center space-y-2"
                      >
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border shadow-sm group-hover:scale-105 transition-all duration-200 group-hover:border-primary">
                            <img
                              src={profileImg}
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
                        </div>
                        <p className="text-xs font-medium capitalize text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {displayName}
                        </p>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          )}
        </CardContent>
      </Card>

      {/* Messages Section */}
      <Card className="w-full">
        <CardContent className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">Your Conversations</h2>
              <p className="text-sm text-muted-foreground">
                {filteredUsers.length} active chats
              </p>
            </div>
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={getChats}
                disabled={loading}
                className="h-8"
              >
                <RefreshCw
                  className={`h-3 w-3 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Loading..." : "Retry"}
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {loading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-1">
                  No conversations yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "No matching chats found"
                    : "Start a conversation with your connections"}
                </p>
              </div>
            )}

            {filteredUsers.map((chatUser) => {
              const profileImg = getProfileImage(chatUser);
              const displayName = getUserDisplayName(chatUser);
              const unreadCount = chatUser.unreadCount ?? 0;
              const hasUnread = unreadCount > 0;
              const isDeleting = deletingChatId === chatUser._id;

              return (
                <div
                  key={chatUser._id}
                  onClick={() => !isDeleting && handleChatClick(chatUser)}
                  className={`flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 cursor-pointer transition-all duration-200 group ${
                    hasUnread ? "ring-1 ring-primary/20" : ""
                  } ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-12 h-12 border-2 border-background">
                      <AvatarImage
                        src={profileImg}
                        alt={displayName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {hasUnread && (
                      <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs min-w-5 h-5 rounded-full flex items-center justify-center p-0 shadow-sm border-2 border-background">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`truncate capitalize text-sm font-medium ${
                          hasUnread ? "text-foreground" : "text-foreground"
                        }`}
                      >
                        {displayName}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {formatLastMessageTime(
                          chatUser.lastMessageDateTime || chatUser.updatedAt,
                        )}
                      </span>
                    </div>
                    <p
                      className={`text-sm truncate ${
                        hasUnread
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {chatUser.lastMessage || "Start a conversation..."}
                    </p>
                  </div>

                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {chatUser.connectionId && chatUser.toUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteChat(e, chatUser)}
                            className="text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPage;
