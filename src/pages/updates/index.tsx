import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { removeNotification } from "@/redux/slices/notification";
import { notificationList } from "@/app-api/notificationFilterList";
import { getUserProfileImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { connectionRequestStatusUpdate } from "@/app-api/connections";
import { toast } from "sonner";
import { Eye, Bell, Check, X, UserPlus, UserCheck } from "lucide-react";

interface NotificationData {
  Type?: string;
  Title?: string;
  Body?: string;
  ProfileImage?: string;
  Name?: string;
  Designation?: string;
  ConnectionId?: string;
  RequesterId?: string;
  RequestId?: string;
}

const Updates: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list, loading, userProfiles } = useAppSelector(
    (state) => state.notification
  );
  console.log("user profile details:", userProfiles);
  
  const { user, token } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "requests" | "visits">(
    "all"
  );

  useEffect(() => {
    if (!token || !user?._id) return;
    dispatch(notificationList({ token, userId: user._id }));
  }, [dispatch, token, user?._id]);

  useEffect(() => {
    localStorage.setItem("hasViewedUpdates", "true");
  }, []);

  const handleAccept = async (
    notification: any,
    parsedData: NotificationData
  ) => {
    dispatch(removeNotification(notification._id));
    try {
      await dispatch(
        connectionRequestStatusUpdate({
          token: token!,
          userId: user!._id,
          connectionReqId: parsedData.RequestId!,
          notificationId: notification._id,
          status: "1",
        })
      ).unwrap();
      toast.success("Connection request accepted!");
    } catch (err) {
      console.error("Accept failed:", err);
      toast.error("Failed to accept request");
    }
  };

  const handleReject = async (
    notification: any,
    parsedData: NotificationData
  ) => {
    dispatch(removeNotification(notification._id));
    try {
      await dispatch(
        connectionRequestStatusUpdate({
          token: token!,
          userId: user!._id,
          connectionReqId: parsedData.RequestId!,
          notificationId: notification._id,
          status: "2",
        })
      ).unwrap();
      toast.success("Connection request declined");
    } catch (err) {
      console.error("Reject failed:", err);
      toast.error("Failed to decline request");
    }
  };

  const uniqueList = useMemo(() => {
    const seen = new Map<string, any>();
    list.forEach((n: any) => {
      const key = `${n.from_user_id}-${n.type}`;
      if (!seen.has(key)) seen.set(key, n);
    });
    return Array.from(seen.values());
  }, [list]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  const getNotificationMeta = (type?: string) => {
    switch (type) {
      case "1":
        return {
          icon: UserPlus,
          color: "text-primary",
          bgColor: "bg-primary-50",
        };
      case "2":
        return { icon: Eye, color: "text-green-500", bgColor: "bg-green-50" };
      case "3":
        return {
          icon: UserCheck,
          color: "text-green-500",
          bgColor: "bg-green-50",
        };
      default:
        return { icon: Bell, color: "text-gray-500", bgColor: "bg-gray-50" };
    }
  };

  const filteredList = useMemo(() => {
    if (activeTab === "requests") {
      return uniqueList.filter((n: any) => {
        const d = n.data ? JSON.parse(n.data) : {};
        return d.Type === "1";
      });
    }
    if (activeTab === "visits") {
      return uniqueList.filter((n: any) => {
        const d = n.data ? JSON.parse(n.data) : {};
        return d.Type === "2";
      });
    }
    return uniqueList;
  }, [activeTab, uniqueList]);

  const counts = useMemo(() => {
    const requests = uniqueList.filter((n: any) => {
      const d = n.data ? JSON.parse(n.data) : {};
      return d.Type === "1";
    }).length;

    const visits = uniqueList.filter((n: any) => {
      const d = n.data ? JSON.parse(n.data) : {};
      return d.Type === "2";
    }).length;

    return { all: uniqueList.length, requests, visits };
  }, [uniqueList]);

  if (!token || !user?._id) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-semibold mb-2">Access Your Updates</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Login to view your notifications and connection requests
            </p>
            <Button onClick={() => navigate("/user-login")} className="w-full h-9">
              Login to View Updates
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-3 sm:p-4 space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r bg-foreground bg-clip-text text-transparent">
          Updates
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Stay updated with your network activity
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="all" className="flex items-center gap-1.5 text-xs">
            <Bell className="h-3.5 w-3.5" />
            All
            {counts.all > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 text-xs px-1">
                {counts.all}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-1.5 text-xs">
            <UserPlus className="h-3.5 w-3.5" />
            Requests
            {counts.requests > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 text-xs px-1">
                {counts.requests}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="visits" className="flex items-center gap-1.5 text-xs">
            <Eye className="h-3.5 w-3.5" />
            Visits
            {counts.visits > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 text-xs px-1">
                {counts.visits}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All Tab */}
        <TabsContent value="all" className="space-y-2 mt-3">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <EmptyState type="all" />
          ) : (
            filteredList.map((n: any) => (
              <NotificationItem
                key={n._id}
                notification={n}
                user={user}
                userProfiles={userProfiles}
                onAccept={handleAccept}
                onReject={handleReject}
                formatDate={formatDate}
                getNotificationMeta={getNotificationMeta}
              />
            ))
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-2 mt-3">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <EmptyState type="requests" />
          ) : (
            filteredList.map((n: any) => (
              <NotificationItem
                key={n._id}
                notification={n}
                user={user}
                userProfiles={userProfiles}
                onAccept={handleAccept}
                onReject={handleReject}
                formatDate={formatDate}
                getNotificationMeta={getNotificationMeta}
              />
            ))
          )}
        </TabsContent>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-2 mt-3">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <EmptyState type="visits" />
          ) : (
            filteredList.map((n: any) => (
              <NotificationItem
                key={n._id}
                notification={n}
                user={user}
                userProfiles={userProfiles} 
                onAccept={handleAccept}
                onReject={handleReject}
                formatDate={formatDate}
                getNotificationMeta={getNotificationMeta}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Notification Item Component
const NotificationItem = ({
  notification,
  user,
  onAccept,
  onReject,
  formatDate,
  getNotificationMeta,
  userProfiles, 
}: any) => {
  let parsedData: NotificationData = {};
  try {
    parsedData = notification.data ? JSON.parse(notification.data) : {};
    console.log("Data:", parsedData);
  } catch {
    parsedData = {};
  }

  const targetId =
    parsedData.RequesterId ||
    parsedData.ConnectionId ||
    notification.from_user_id;

  const userProfile = userProfiles?.find(
    (profile: any) => profile._id === targetId
  );

  const profileUrl = userProfile
    ? `/profile/${userProfile.first_name}-${userProfile.last_name}-${userProfile._id}`
    : `/profile/${targetId}`;

  const { icon: Icon, color, bgColor } = getNotificationMeta(parsedData.Type);
  const profileImage = getUserProfileImage(
    user?.imageBaseUrl || "",
    parsedData.ProfileImage as string
  );

  return (
    <Card className="group transition-all duration-200 hover:shadow-md hover:border-border">
      <CardContent className="p-2.5 sm:p-3">
        <div className="flex items-start gap-2">
          {/* Notification Icon */}
          <div className={`p-1.5 rounded-full ${bgColor} shrink-0`}>
            <Icon className={`h-3.5 w-3.5 ${color}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {profileImage && (
                  <Avatar className="w-9 h-9 border">
                    <AvatarImage src={profileImage} alt={parsedData.Name} />
                    <AvatarFallback className="text-xs">
                      {parsedData.Name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className="min-w-0 flex-1">
                  <Link to={profileUrl} className="block">
                    <h3 className="font-semibold text-sm text-foreground truncate capitalize hover:text-primary transition-colors">
                      {userProfile
                        ? `${userProfile.first_name} ${userProfile.last_name}`
                        : parsedData.Name || "Unknown User"}
                    </h3>
                  </Link>
                  {parsedData.Designation && (
                    <p className="text-xs text-muted-foreground capitalize truncate">
                      {parsedData.Designation}
                    </p>
                  )}
                  <p className="text-xs text-foreground mt-0.5">
                    {parsedData.Body || notification.body}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(notification.createdAt)}
                </span>
              </div>
            </div>

            {/* Connection Request Actions */}
            {parsedData.Type === "1" && (
              <div className="flex gap-1.5 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(notification, parsedData)}
                  className="h-7 text-xs border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  <X className="h-3 w-3 mr-1" />
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAccept(notification, parsedData)}
                  className="h-7 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Accept
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Skeleton Loader
const NotificationSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-2.5 sm:p-3">
      <div className="flex items-start gap-2">
        <Skeleton className="w-7 h-7 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2 flex-1">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="flex gap-1.5 pt-1">
            <Skeleton className="h-7 w-18 rounded" />
            <Skeleton className="h-7 w-18 rounded" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Empty State Component
const EmptyState = ({ type }: { type: string }) => (
  <Card>
    <CardContent className="text-center py-10">
      {type === "all" && (
        <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      )}
      {type === "requests" && (
        <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      )}
      {type === "visits" && (
        <Eye className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      )}

      <h3 className="font-semibold text-base text-foreground mb-1.5 capitalize">
        No {type === "all" ? "updates" : type} yet
      </h3>
      <p className="text-muted-foreground text-sm">
        {type === "all" && "Your notifications will appear here"}
        {type === "requests" && "Connection requests will appear here"}
        {type === "visits" && "Profile visits will appear here"}
      </p>
    </CardContent>
  </Card>
);

export default Updates;