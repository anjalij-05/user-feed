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
    "connected",
  );
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { userProfiles, bookmarked, loading } = useAppSelector(
    (state) => state.connection,
  );
  const { token, user } = useAppSelector((state) => state.auth);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  // Fetch connected + bookmarked on mount
  useEffect(() => {
    if (token && user?._id) {
      dispatch(
        checkConnectionStatus({
          token,
          userId: user._id,
        }),
      );
      dispatch(
        fetchBookmarkedList({
          token,
          userId: user._id,
          latitude: 19.1723617,
          longitude: 72.8605305,
          distance: 50,
        }),
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

    const goToProfile = () =>
      navigate(
        `/profile/${profile.first_name?.toLowerCase() ?? ""}-${profile.last_name?.toLowerCase() ?? ""}-${profile._id}`,
      );

    const profileImage =
      getUserProfileImage(
        user?.imageBaseUrl as string,
        profile?.profileImage,
      ) || DummyImage;

    const designation = profile.designation || profile.role || "";
    const company = profile.company || profile.current_company || "";
    const location = profile.location || profile.city || "";

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
        }),
      );

      setEditingUserId(null);
    };

    return (
      <Card className="group relative overflow-hidden w-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <div className="absolute inset-0 bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-2.5 sm:p-3 z-50!">
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
            <div className="flex items-start gap-2 flex-1 min-w-0 cursor-pointer">
              {" "}
              <Avatar
                className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 border-2 border-background group-hover:border-primary/20 transition-colors cursor-pointer"
                onClick={goToProfile}
              >
                <AvatarImage src={profileImage} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="space-y-0.5">
                  {/* Name - clickable */}
                  <h3
                    className="font-bold text-sm sm:text-base text-foreground truncate capitalize group-hover:text-primary transition-colors duration-200 cursor-pointer"
                    onClick={goToProfile}
                  >
                    {displayName}
                  </h3>

                  {designation && (
                    <Badge
                      variant="secondary"
                      className="text-xs capitalize font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors py-0 h-5"
                    >
                      {designation}
                    </Badge>
                  )}
                </div>

                <div className="space-y-0.5 text-xs text-muted-foreground">
                  {company && (
                    <div className="flex items-center gap-1.5">
                      <Building className="h-3 w-3 shrink-0" />
                      <span className="truncate capitalize">{company}</span>
                    </div>
                  )}

                  {location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate capitalize">{location}</span>
                    </div>
                  )}
                </div>

                {showNote && (
                  <div
                    className="mt-2 z-50 p-2 rounded-md border bg-amber-50 dark:bg-amber-950/20"
                    onClick={(e) => {
                      e.stopPropagation(); // ← already fires setEditingUserId, but add this
                      setEditingUserId(profile._id);
                    }}
                  >
                    <div className="flex gap-1.5">
                      <StickyNote className="h-3.5 w-3.5 text-amber-500 mt-0.5" />

                      <div className="flex-1">
                        <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                          Your Note
                        </p>

                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <Input
                              autoFocus
                              value={noteValue}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setNoteValue(e.target.value)}
                              className="h-6 text-xs"
                              placeholder="Write a note..."
                            />

                            <Button
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                saveNote();
                              }}
                              disabled={!noteValue.trim()}
                            >
                              Save
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-1.5 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingUserId(null);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-1.5">
                            <p className="text-xs text-amber-800 dark:text-amber-200 break-words">
                              {bookmarkNote || "No note added"}
                            </p>

                            <Pencil
                              className="h-3 w-3 text-amber-600 cursor-pointer shrink-0 hover:text-amber-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit();
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
          </div>
        </CardContent>
      </Card>
    );
  };

  const UserCardSkeleton = () => (
    <Card className="animate-pulse">
      <CardContent className="p-2.5 sm:p-3">
        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
          <div className="flex items-start gap-2 flex-1">
            <Skeleton className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
              <div className="space-y-1">
                <Skeleton className="h-2.5 w-full max-w-[120px]" />
                <Skeleton className="h-2.5 w-full max-w-[120px]" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-6 px-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
              <div className="relative bg-linear-to-br from-primary/20 to-primary/10 p-4 rounded-full">
                <Users className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Access Your Network
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Login to view your connections and bookmarked profiles
            </p>
            <Button
              onClick={() => navigate("/user-login")}
              className="w-full h-10 cursor-pointer font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
            >
              Login to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-background via-background to-primary/5">
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-linear-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
            My Network
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto px-4">
            Manage your connections and saved profiles in one place
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg blur-xl opacity-50" />
          <div className="relative">
            <Search className="absolute z-50 left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm rounded-lg border-border/50 bg-card/50 backdrop-blur-sm shadow-lg focus:shadow-xl focus:border-primary/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "connected" | "bookmarked")
          }
          className="w-full"
        >
          <TabsList className="grid w-full h-9 grid-cols-2 max-w-md mx-auto gap-1 p-1">
            <TabsTrigger
              value="connected"
              className="flex cursor-pointer items-center justify-center gap-1.5 py-1.5 text-xs"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Connected</span>
              <Badge
                variant="secondary"
                className="ml-0.5 h-4 min-w-4 text-xs px-1"
              >
                {filteredConnected.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="bookmarked"
              className="flex cursor-pointer items-center justify-center gap-1.5 py-1.5 text-xs"
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Bookmarked</span>
              <Badge
                variant="secondary"
                className="ml-0.5 h-4 min-w-4 text-xs px-1"
              >
                {filteredBookmarked.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Connected Tab */}
          <TabsContent
            value="connected"
            className="space-y-2 sm:space-y-2.5 mt-3 sm:mt-4"
          >
            {loading ? (
              <div className="space-y-2 sm:space-y-2.5">
                {[...Array(5)].map((_, i) => (
                  <UserCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredConnected.length > 0 ? (
              <div className="grid gap-2 sm:gap-2.5 md:grid-cols-1">
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
                <CardContent className="text-center py-10 px-4">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-muted/50 rounded-full blur-2xl" />
                    <div className="relative bg-muted p-4 rounded-full">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-2">
                    {search ? "No matching connections" : "No connections yet"}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    {search
                      ? "Try adjusting your search terms"
                      : "Start connecting with people to build your network"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bookmarked Tab */}
          <TabsContent
            value="bookmarked"
            className="space-y-2 sm:space-y-2.5 mt-3 sm:mt-4"
          >
            {loading ? (
              <div className="space-y-2 sm:space-y-2.5">
                {[...Array(5)].map((_, i) => (
                  <UserCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredBookmarked.length > 0 ? (
              <div className="grid gap-2 sm:gap-2.5 md:grid-cols-1">
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
                <CardContent className="text-center py-10 px-4">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-muted/50 rounded-full blur-2xl" />
                    <div className="relative bg-muted p-4 rounded-full">
                      <Bookmark className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-2">
                    {search ? "No matching bookmarks" : "No bookmarks yet"}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
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
