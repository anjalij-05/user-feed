import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { checkConnectionStatus } from "@/app-api/connections";
import { fetchBookmarkedList, toggleBookmark } from "@/app-api/bookmark";
import DummyImage from "@/assets/dummy_image.webp";
import { getUserProfileImage } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Bookmark,
  MapPin,
  Building,
  StickyNote,
  Pencil,
} from "lucide-react";

const Connects: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"connected" | "bookmarked">(
    "connected"
  );
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { userProfiles, bookmarked, loading } = useAppSelector(
    (state) => state.connection
  );
  const { token, user } = useAppSelector((state) => state.auth);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  // Static bookmark notes for demonstration
  // const [staticBookmarkNotes] = useState<Record<string, string>>({
  //   // Add static notes by user ID
  //   // Example: "user_id_123": "Great connection for AI/ML projects",
  // });

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

  // Filtered connected
  const filteredConnected = userProfiles.filter((userProfile: any) => {
    const name = `${userProfile.firstName || userProfile.first_name || ""} ${
      userProfile.lastName || userProfile.last_name || ""
    }`.trim();
    return name.toLowerCase().includes(search.toLowerCase());
  });

  // Filtered bookmarked
  const filteredBookmarked = bookmarked.filter((userProfile: any) => {
    const name = `${userProfile.firstName || userProfile.first_name || ""} ${
      userProfile.lastName || userProfile.last_name || ""
    }`.trim();
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const UserCard = ({
    profile,
    showNote = false,
  }: {
    profile: any;
    showNote?: boolean;
  }) => {
    const displayName = `${profile.first_name || ""} ${
      profile.last_name || ""
    }`.trim();

    const profileImage =
      getUserProfileImage(
        user?.imageBaseUrl as string,
        profile?.profileImage
      ) || DummyImage;

    const designation = profile.designation || profile.role || "";
    const company = profile.company || profile.current_company || "";
    const location = profile.location || profile.city || "";

    // Get bookmark note from API response, static notes, or fallback
    const bookmarkNote =
      profile.note || profile.bookmarkNote || profile.bookmark?.note || "";

    const isEditing = editingUserId === profile._id;

    const startEdit = () => {
      setEditingUserId(profile._id);
      setNoteValue(bookmarkNote);
    };

    const saveNote = () => {
      const trimmed = noteValue.trim();
      if (!trimmed) return;

      dispatch(
        toggleBookmark({
          token: token!,
          loggedInUserId: user!._id,
          targetUserId: profile._id,
          status: "1",
          note: trimmed,
        })
      );

      setEditingUserId(null);
    };

    return (
      <Card className="group relative overflow-hidden w-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* Subtle gradient overlay on hover */}
        <div
          className="absolute z-10! inset-0 bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          // onClick={() =>
          //   navigate(
          //     `/profile/${profile.first_name.toLowerCase()}-${profile.last_name.toLowerCase()}-${
          //       profile._id
          //     }`
          //   )
          // }
        />

        <CardContent className="p-3 sm:p-4 z-50!">
          {/* Mobile: Stack layout, Desktop: Horizontal layout */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
            {/* Avatar and basic info section */}
            <div className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer">
              <Avatar className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 border-2 border-background group-hover:border-primary/20 transition-colors">
                <AvatarImage src={profileImage} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm sm:text-base">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                <div
                  className="space-y-1"
                  onClick={() =>
                    navigate(
                      `/profile/${profile.first_name.toLowerCase()}-${profile.last_name.toLowerCase()}-${
                        profile._id
                      }`
                    )
                  }
                >
                  <h3 className="font-bold text-base sm:text-lg text-foreground truncate capitalize group-hover:text-primary transition-colors duration-200">
                    {displayName}
                  </h3>

                  {designation && (
                    <Badge
                      variant="secondary"
                      className="text-xs capitalize font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {designation}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                  {company && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Building className="h-3 w-3 shrink-0" />
                      <span className="truncate capitalize">{company}</span>
                    </div>
                  )}

                  {location && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate capitalize">{location}</span>
                    </div>
                  )}
                </div>

                {showNote && (
                  <div
                    className="mt-3 z-50 p-3 rounded-md border bg-amber-50 dark:bg-amber-950/20"
                    onClick={() => {
                      setEditingUserId(profile._id);
                      console.log("Edit started for user:", profile._id);
                    }} // enable edit on container click
                  >
                    <div className="flex gap-2">
                      <StickyNote className="h-4 w-4 text-amber-500 mt-1" />

                      <div className="flex-1">
                        <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                          Your Note
                        </p>

                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              autoFocus
                              value={noteValue}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setNoteValue(e.target.value)}
                              className="h-7 text-xs"
                              placeholder="Write a note..."
                            />

                            {/* SAVE BUTTON */}
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                saveNote();
                              }}
                              disabled={!noteValue.trim()}
                            >
                              Save
                            </Button>

                            {/* CANCEL BUTTON */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingUserId(null);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs text-amber-800 dark:text-amber-200 break-words">
                              {bookmarkNote || "No note added"}
                            </p>

                            {/* EDIT ICON */}
                            <Pencil
                              className="h-3.5 w-3.5 text-amber-600 cursor-pointer shrink-0 hover:text-amber-700"
                              onClick={(e) => {
                                e.stopPropagation(); // prevent navigation
                                startEdit(); // open input
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Message button - full width on mobile, auto on desktop */}
            {/* <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto sm:mt-2 h-9 sm:h-8 z-50 text-xs text-foreground hover:text-white hover:bg-primary hover:scale-105 transition-all shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/chat/${user?._id}_${profile._id}`, {
                  state: { scrollToChat: true },
                });
              }}
            >
              <MessageCircle className="h-3 w-3 mr-1.5" />
              Message
            </Button> */}
          </div>
        </CardContent>
      </Card>
    );
  };

  const UserCardSkeleton = () => (
    <Card className="animate-pulse">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-full max-w-[140px]" />
                <Skeleton className="h-3 w-full max-w-[140px]" />
              </div>
            </div>
          </div>
          <Skeleton className="h-9 sm:h-8 w-full sm:w-20" />
        </div>
      </CardContent>
    </Card>
  );

  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardContent className="pt-8 sm:pt-12 pb-6 sm:pb-8 px-6 sm:px-8 text-center">
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
              <div className="relative bg-linear-to-br from-primary/20 to-primary/10 p-4 sm:p-6 rounded-full">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Access Your Network
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Login to view your connections and bookmarked profiles
            </p>
            <Button
              onClick={() => navigate("/user-login")}
              className="w-full h-10 sm:h-11 font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
            >
              Login to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8">
        {/* Header with gradient */}
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-2xl -mt-5 sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
            My Network
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto px-4">
            Manage your connections and saved profiles in one place
          </p>
        </div>

        {/* Search Bar with enhanced styling */}
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg sm:rounded-xl blur-xl opacity-50" />
          <div className="relative">
            <Search className="absolute z-50 left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base rounded-lg sm:rounded-xl border-border/50 bg-card/50 backdrop-blur-sm shadow-lg focus:shadow-xl focus:border-primary/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* Tabs with enhanced design */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "connected" | "bookmarked")
          }
          className="w-full"
        >
          <TabsList className="grid w-full h-auto sm:h-10 grid-cols-2 max-w-md mx-auto gap-1 p-1">
            <TabsTrigger
              value="connected"
              className="flex cursor-pointer items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-0 text-xs sm:text-sm"
            >
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="xs:hidden">Connected</span>
              <Badge
                variant="secondary"
                className="ml-0.5 sm:ml-1 h-5 min-w-5 text-xs"
              >
                {filteredConnected.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="bookmarked"
              className="flex cursor-pointer items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-0 text-xs sm:text-sm"
            >
              <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="xs:inline">Bookmarked</span>
              <Badge
                variant="secondary"
                className="ml-0.5 sm:ml-1 h-5 min-w-5 text-xs"
              >
                {filteredBookmarked.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Connected Tab */}
          <TabsContent
            value="connected"
            className="space-y-3 sm:space-y-4 mt-4 sm:mt-6"
          >
            {loading ? (
              <div className="space-y-3 sm:space-y-4">
                {[...Array(5)].map((_, i) => (
                  <UserCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredConnected.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 md:grid-cols-1">
                {filteredConnected.map((userProfile: any) => (
                  <UserCard
                    key={userProfile._id}
                    profile={userProfile}
                    showNote={false}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-border/50 shadow-lg">
                <CardContent className="text-center py-12 sm:py-16 px-4 sm:px-6">
                  <div className="relative inline-block mb-4 sm:mb-6">
                    <div className="absolute inset-0 bg-muted/50 rounded-full blur-2xl" />
                    <div className="relative bg-muted p-4 sm:p-6 rounded-full">
                      <Users className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2 sm:mb-3">
                    {search ? "No matching connections" : "No connections yet"}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                    {search
                      ? "Try adjusting your search terms"
                      : "Start connecting with people to build your network"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bookmarked Tab - NOW WITH NOTES */}
          <TabsContent
            value="bookmarked"
            className="space-y-3 sm:space-y-4 mt-4 sm:mt-6"
          >
            {loading ? (
              <div className="space-y-3 sm:space-y-4">
                {[...Array(5)].map((_, i) => (
                  <UserCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredBookmarked.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 md:grid-cols-1">
                {filteredBookmarked.map((userProfile: any) => (
                  <UserCard
                    key={userProfile._id}
                    profile={userProfile}
                    showNote={true}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-border/50 shadow-lg">
                <CardContent className="text-center py-12 sm:py-16 px-4 sm:px-6">
                  <div className="relative inline-block mb-4 sm:mb-6">
                    <div className="absolute inset-0 bg-muted/50 rounded-full blur-2xl" />
                    <div className="relative bg-muted p-4 sm:p-6 rounded-full">
                      <Bookmark className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2 sm:mb-3">
                    {search ? "No matching bookmarks" : "No bookmarks yet"}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                    {search
                      ? "Try adjusting your search terms"
                      : "Bookmark profiles to save them for later"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Connects;
