import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { googleMapsApiKey } from "@/constants";
import { fetchNearbyProfilesThunk } from "@/app-api/nearbyProfiles";
import { fetchCompanies, fetchDesignation } from "@/app-api/company";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import DummyImage from "@/assets/dummy_image.webp";
import { getUserProfileImage } from "@/lib/utils";
import { Search, UserPlus, Filter, MessageCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TlsImage from "@/assets/tlsImage.webp";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  sendConnectionRequest,
  cancelConnectionRequest,
  getMyConnections,
  checkConnectionStatus,
} from "@/app-api/connections";
import { toast } from "sonner";
import ImageDialog from "@/components/imageDialogBox";
import PremiumLogo from "@/assets/premium.webp";
import ExploreLoader from "@/components/Loader/exploreLoader";
import { appUrl, imageBaseUrl } from "@/constants";
// import { resetPagination } from "@/redux/slices/nearByProfiles";
import axios from "axios";
import { Button } from "@/components/ui/button";
import EventHighlight from "./EventHighlight";
// import { Helmet } from "react-helmet-async";

const containerStyle = { width: "100%", height: "300px" };
const DEFAULT_MAX_DISTANCE = 50;

export interface Profile {
  _id: string;
  first_name: string;
  last_name: string;
  emailId: string;
  company?: string;
  designation?: string;
  industry?: string;
  profileImage?: string;
  city?: string;
  score?: number;
  role?: string;
  latitude?: number | string;
  longitude?: number | string;
  distanceBetween?: string;
}

interface FilterState {
  companies: string[];
  industries: string[];
  designations: string[];
}

interface ConnectionStatus {
  [userId: string]: {
    isFriend: boolean;
    isPending: boolean;
    loading: boolean;
  };
}

const Explore: React.FC = () => {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [usingCachedData, setUsingCachedData] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [infoWindowProfile, setInfoWindowProfile] = useState<Profile | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<
    "Company" | "Designation" | "Industry"
  >("Company");
  const [filters, setFilters] = useState<FilterState>({
    companies: [],
    industries: [],
    designations: [],
  });
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [filterSearchTerm, setFilterSearchTerm] = useState("");
  const [connectionStatuses, setConnectionStatuses] =
    useState<ConnectionStatus>({});
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isFilterMode, setIsFilterMode] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  // NEW: Local state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isLoadingRef = useRef(false);
  const connectionDataCache = useRef<{
    connectionIdData: any[];
    connectionRequests: any[];
    lastFetched: number;
  } | null>(null);

  const isFetchingConnectionData = useRef(false);
  const connectionDataPromise = useRef<Promise<any> | null>(null);
  const isFetchingProfiles = useRef<{ [key: string]: Promise<any> }>({});

  const tabs: ("Company" | "Designation" | "Industry")[] = [
    "Company",
    "Designation",
    "Industry",
  ];
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { companies, designations, companiesLoading, designationsLoading } =
    useAppSelector((state) => state.company);
  const {
    nearbyProfiles: cachedProfiles,
    publicProfiles: cachedPublicProfiles,
    lastFetchedTimestamp,
    cacheValidity,
    // loading: reduxLoading,
    hasMore: reduxHasMore,
    currentPage: reduxCurrentPage,
  } = useAppSelector((state) => state.nearByProfiles);

  const isLoggedIn = !!token && !!user?._id;
  const maxDistance = user?.maxDistance || DEFAULT_MAX_DISTANCE;

  // Utility function to check if cached data is still fresh
  const isCacheFresh = useCallback((): boolean => {
    if (!lastFetchedTimestamp) return false;
    const now = Date.now();
    return now - lastFetchedTimestamp < (cacheValidity || 5 * 60 * 1000);
  }, [lastFetchedTimestamp, cacheValidity]);

  const fetchConnectionData = useCallback(
    async (lat: number, lng: number, forceRefresh: boolean = false) => {
      if (!isLoggedIn) return null;

      const now = Date.now();
      if (
        !forceRefresh &&
        connectionDataCache.current &&
        now - connectionDataCache.current.lastFetched < 5 * 60 * 1000
      ) {
        return connectionDataCache.current;
      }

      if (isFetchingConnectionData.current && connectionDataPromise.current) {
        return connectionDataPromise.current;
      }

      isFetchingConnectionData.current = true;

      const fetchPromise = (async () => {
        try {
          const checkRes = await dispatch(
            checkConnectionStatus({ token, userId: user._id }),
          ).unwrap();
          const connectionData = checkRes?.result?.connectionIdData || [];

          const myRes = await dispatch(
            getMyConnections({
              token,
              userId: user._id,
              latitude: lat,
              longitude: lng,
              distance: maxDistance,
            }),
          ).unwrap();

          const requests = myRes.connectionRequests || [];

          connectionDataCache.current = {
            connectionIdData: connectionData,
            connectionRequests: requests,
            lastFetched: now,
          };

          return connectionDataCache.current;
        } catch (err) {
          console.error("Failed to fetch connection data:", err);
          return null;
        } finally {
          isFetchingConnectionData.current = false;
          connectionDataPromise.current = null;
        }
      })();

      connectionDataPromise.current = fetchPromise;
      return fetchPromise;
    },
    [isLoggedIn, token, user?._id, dispatch, maxDistance],
  );

  const refreshConnectionStatuses = useCallback(
    async (
      profilesToCheck: Profile[],
      lat: number,
      lng: number,
      isInitialLoad: boolean = false,
    ) => {
      if (!isLoggedIn) return;

      try {
        const data = await fetchConnectionData(lat, lng, isInitialLoad);
        if (!data) return;

        const { connectionIdData, connectionRequests } = data;

        const statusMap: ConnectionStatus = {};
        profilesToCheck.forEach((profile) => {
          const isAccepted = connectionIdData.some(
            (conn: any) =>
              conn.userId === profile._id || conn._id === profile._id,
          );
          const isPending = connectionRequests.some(
            (req: any) =>
              req.request_user_id === user._id &&
              req.receive_user_id === profile._id &&
              req.status === 1,
          );

          statusMap[profile._id] = {
            isFriend: isAccepted,
            isPending: !isAccepted && isPending,
            loading: false,
          };
        });

        setConnectionStatuses((prev) => ({ ...prev, ...statusMap }));
      } catch (err) {
        console.error("Failed to refresh connection statuses:", err);
      }
    },
    [isLoggedIn, user?._id, fetchConnectionData],
  );

  // Enhanced function to get profiles with Redux cache check
  const getProfilesWithCacheCheck = useCallback(
    async (
      lat: number,
      lng: number,
      page: number = 1,
      forceRefresh: boolean = false,
    ) => {
      // Check if we have fresh cached data and this is page 1
      if (page === 1 && !forceRefresh && isCacheFresh()) {
        const cachedData = isLoggedIn ? cachedProfiles : cachedPublicProfiles;

        if (cachedData && cachedData.length > 0) {
          console.log("Using cached profiles data");
          setUsingCachedData(true);
          setProfiles(cachedData);
          setCurrentPage(reduxCurrentPage || 1);
          setHasMore(reduxHasMore || false);

          if (isLoggedIn && cachedData.length > 0) {
            await refreshConnectionStatuses(cachedData, lat, lng, true);
          }

          // Reset cached data flag after a short delay
          setTimeout(() => setUsingCachedData(false), 2000);

          return { success: true, fromCache: true };
        }
      }

      return getNearbyProfiles(lat, lng, page);
    },
    [
      isLoggedIn,
      cachedProfiles,
      cachedPublicProfiles,
      isCacheFresh,
      reduxCurrentPage,
      reduxHasMore,
      refreshConnectionStatuses,
    ],
  );

  const getNearbyProfiles = useCallback(
    async (lat: number, lng: number, page: number = 1) => {
      const fetchKey = `${lat}-${lng}-${page}`;

      if (await isFetchingProfiles.current[fetchKey]) {
        return await isFetchingProfiles.current[fetchKey];
      }

      const fetchPromise = (async () => {
        try {
          if (page === 1) {
            setLoading(true);
            setCurrentPage(1);
            setHasMore(true);
          } else {
            setLoadingMore(true);
          }

          const authToken = isLoggedIn ? token : undefined;
          const userId = isLoggedIn ? user._id : undefined;

          const data = await dispatch(
            fetchNearbyProfilesThunk({
              token: authToken,
              userId,
              latitude: lat,
              longitude: lng,
              distance: maxDistance,
              page,
            }),
          ).unwrap();

          const fetchedProfiles = data?.result?.nearByProfile || [];

          const hasMoreProfiles = fetchedProfiles.length > 0;
          setHasMore(hasMoreProfiles);

          if (page === 1) {
            setProfiles(fetchedProfiles);
          } else {
            setProfiles((prev) => [...prev, ...fetchedProfiles]);
            setCurrentPage(page);
          }

          if (isLoggedIn) {
            await refreshConnectionStatuses(
              fetchedProfiles,
              lat,
              lng,
              page === 1,
            );
          }

          return data;
        } catch (err) {
          console.error("Failed to fetch nearby profiles:", err);
          toast.error("Unable to fetch nearby profiles");
          setHasMore(false);
          throw err;
        } finally {
          setLoading(false);
          setLoadingMore(false);
          isLoadingRef.current = false;
          delete isFetchingProfiles.current[fetchKey];
        }
      })();

      isFetchingProfiles.current[fetchKey] = fetchPromise;
      return fetchPromise;
    },
    [
      isLoggedIn,
      token,
      user?._id,
      dispatch,
      maxDistance,
      refreshConnectionStatuses,
    ],
  );

  const fetchingProfileMap = useRef<Record<string, Promise<any> | undefined>>(
    {},
  );

  const getNearbyProfilesWithoutLocation = useCallback(
    async (page: number = 1) => {
      const fetchKey = `no-location-${page}`;

      if (fetchingProfileMap.current[fetchKey]) {
        return fetchingProfileMap.current[fetchKey];
      }

      const fetchPromise = (async () => {
        try {
          if (page === 1) {
            setLoading(true);
            setCurrentPage(1);
            setHasMore(true);
          } else {
            setLoadingMore(true);
          }

          const authToken = isLoggedIn ? token : undefined;
          const userId = isLoggedIn ? user._id : undefined;
          const mobileNumber = String(isLoggedIn ? user.mobileNumber : 0);

          const data = await dispatch(
            fetchNearbyProfilesThunk({
              token: authToken,
              userId,
              mobileNumber,
              page,
            }),
          ).unwrap();

          const fetchedProfiles = data?.data || [];

          // Check if there are more profiles
          const hasMoreProfiles = fetchedProfiles.length > 0;
          setHasMore(hasMoreProfiles);

          if (page === 1) {
            setProfiles(fetchedProfiles);
          } else {
            setProfiles((prev) => [...prev, ...fetchedProfiles]);
            setCurrentPage(page);
          }

          if (isLoggedIn && fetchedProfiles.length > 0) {
            const statusMap: ConnectionStatus = {};
            fetchedProfiles.forEach((profile: Profile) => {
              statusMap[profile._id] = {
                isFriend: false,
                isPending: false,
                loading: false,
              };
            });
            setConnectionStatuses((prev) => ({ ...prev, ...statusMap }));
          }

          return data;
        } catch (err) {
          console.error("Failed to fetch profiles without location:", err);
          toast.error("Unable to fetch profiles");
          setHasMore(false);
          throw err;
        } finally {
          setLoading(false);
          setLoadingMore(false);
          isLoadingRef.current = false;
          delete fetchingProfileMap.current[fetchKey];
        }
      })();

      fetchingProfileMap.current[fetchKey] = fetchPromise;
      return fetchPromise;
    },
    [isLoggedIn, token, user?._id, user?.mobileNumber, dispatch],
  );

  const getFilteredProfiles = useCallback(
    async (lat: number, lng: number) => {
      if (!center) return;

      setLoading(true);
      setIsFilterMode(true);

      try {
        const response = await axios.post(
          `${appUrl}/api/v1/user/nearby-Profiles-Filter`,
          {
            company: filters.companies,
            designation: filters.designations,
            industryName: filters.industries,
            latitude: lat,
            longitude: lng,
            distance: maxDistance,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const data = response.data;

        if (data.status) {
          const filteredProfiles = data.result?.filteredProfiles || [];
          setProfiles(filteredProfiles);

          if (isLoggedIn) {
            await refreshConnectionStatuses(filteredProfiles, lat, lng, false);
          }

          return { success: true, profiles: filteredProfiles };
        } else {
          toast.error(data.message || "Failed to apply filters");
          setProfiles([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch filtered profiles:", err);
        toast.error(err?.response?.data?.message || "Unable to apply filters");
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    },
    [filters, maxDistance, isLoggedIn, refreshConnectionStatuses, center],
  );

  const searchProfilesByName = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setIsSearchMode(false);
        if (center) {
          getProfilesWithCacheCheck(center.lat, center.lng, 1);
        }
        return;
      }

      setSearchLoading(true);
      setIsSearchMode(true);

      try {
        const response = await axios.get(
          `${appUrl}/api/v1/user/nearBy-profile-public-search/${encodeURIComponent(
            searchQuery.trim(),
          )}`,
        );

        const data = response.data;
        const searchedProfiles = data?.result?.nearByProfile || [];

        setProfiles(searchedProfiles);

        if (isLoggedIn && center) {
          await refreshConnectionStatuses(
            searchedProfiles,
            center.lat,
            center.lng,
            false,
          );
        }
      } catch (err) {
        console.error("Failed to search profiles:", err);
        toast.error("Unable to search profiles");
        setProfiles([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [isLoggedIn, center, refreshConnectionStatuses, getNearbyProfiles],
  );

  useEffect(() => {
    if (!center) return;

    if (searchTerm) {
      searchProfilesByName(searchTerm);
    } else {
      setIsSearchMode(false);
      if (
        filters.companies.length > 0 ||
        filters.designations.length > 0 ||
        filters.industries.length > 0
      ) {
        getFilteredProfiles(center.lat, center.lng);
      }
    }
  }, [
    searchTerm,
    filters.companies.length,
    filters.designations.length,
    filters.industries.length,
  ]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported");
      setLocationDenied(true);
      getNearbyProfilesWithoutLocation(1);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCenter({ lat: latitude, lng: longitude });
        setLocationDenied(false);
        getProfilesWithCacheCheck(latitude, longitude, 1);
      },
      (error) => {
        console.log("Location access denied or unavailable:", error);
        setLocationDenied(true);

        // Only fetch fallback profiles
        getNearbyProfilesWithoutLocation(1);

        // Optional toast ONLY for guests
        if (!isLoggedIn) {
          toast.info("Enable location to see nearby profiles");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, []);

  const handleLoadMore = useCallback(() => {
    // console.log("handleLoadMore called", {
    //   isLoadingRef: isLoadingRef.current,
    //   hasMore,
    //   loadingMore,
    //   isSearchMode,
    //   isFilterMode,
    //   currentPage,
    // });

    if (isLoadingRef.current) {
      console.log("Already loading, skipping");
      return;
    }

    if (!hasMore || loadingMore || isSearchMode || isFilterMode) {
      console.log("Cannot load more", {
        hasMore,
        loadingMore,
        isSearchMode,
        isFilterMode,
      });
      return;
    }

    isLoadingRef.current = true;
    const nextPage = currentPage + 1;

    // console.log("Loading page:", nextPage);

    if (locationDenied) {
      getNearbyProfilesWithoutLocation(nextPage).finally(() => {
        isLoadingRef.current = false;
      });
    } else if (center) {
      getProfilesWithCacheCheck(center.lat, center.lng, nextPage).finally(
        () => {
          isLoadingRef.current = false;
        },
      );
    } else {
      isLoadingRef.current = false;
    }
  }, [
    center,
    hasMore,
    loadingMore,
    isSearchMode,
    isFilterMode,
    getNearbyProfiles,
    getNearbyProfilesWithoutLocation,
    currentPage,
    locationDenied,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop - clientHeight < 300) {
        handleLoadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleLoadMore]);

  const handleConnect = async (profileId: string) => {
    if (!isLoggedIn) {
      toast.error("Please login to send connection requests");
      navigate("/user-login");
      return;
    }

    setConnectionStatuses((prev) => ({
      ...prev,
      [profileId]: { ...prev[profileId], loading: true },
    }));

    try {
      const res = await sendConnectionRequest(token, user._id, profileId);
      if (res?.status) {
        toast.success(res?.message || "Request sent!");
        connectionDataCache.current = null;
        setConnectionStatuses((prev) => ({
          ...prev,
          [profileId]: { isFriend: false, isPending: true, loading: false },
        }));
      } else {
        toast.error(res?.message || "Request failed");
        setConnectionStatuses((prev) => ({
          ...prev,
          [profileId]: { ...prev[profileId], loading: false },
        }));
      }
    } catch (err: any) {
      toast.error("Something went wrong", { description: err?.message });
      setConnectionStatuses((prev) => ({
        ...prev,
        [profileId]: { ...prev[profileId], loading: false },
      }));
    }
  };

  const handleCancel = async (profileId: string) => {
    if (!isLoggedIn || !center) {
      toast.error("Please login to cancel connection requests");
      return;
    }

    setConnectionStatuses((prev) => ({
      ...prev,
      [profileId]: { ...prev[profileId], loading: true },
    }));

    try {
      const myRes = await dispatch(
        getMyConnections({
          token,
          userId: user._id,
          latitude: center.lat,
          longitude: center.lng,
          distance: maxDistance,
        }),
      ).unwrap();

      const requests = myRes.connectionRequests || [];
      const pendingReq = requests.find(
        (r: any) =>
          r.request_user_id === user._id &&
          r.receive_user_id === profileId &&
          r.status === 1,
      );

      if (!pendingReq) {
        toast.error("No pending request found");
        setConnectionStatuses((prev) => ({
          ...prev,
          [profileId]: { isFriend: false, isPending: false, loading: false },
        }));
        return;
      }

      const cancelRes = await cancelConnectionRequest(
        token,
        user._id,
        pendingReq.receive_user_id,
      );

      if (cancelRes?.status) {
        toast.success(cancelRes?.message || "Cancelled");
        connectionDataCache.current = null;
        setConnectionStatuses((prev) => ({
          ...prev,
          [profileId]: { isFriend: false, isPending: false, loading: false },
        }));
      } else {
        toast.error(cancelRes?.message || "Cancel failed");
        setConnectionStatuses((prev) => ({
          ...prev,
          [profileId]: { ...prev[profileId], loading: false },
        }));
      }
    } catch (err: any) {
      toast.error("Something went wrong", { description: err?.message });
      setConnectionStatuses((prev) => ({
        ...prev,
        [profileId]: { ...prev[profileId], loading: false },
      }));
    }
  };

  useEffect(() => {
    if (showFilterSidebar) {
      if (activeTab === "Company" || activeTab === "Industry") {
        dispatch(fetchCompanies(""));
      } else if (activeTab === "Designation") {
        dispatch(fetchDesignation(""));
      }
    }
  }, [showFilterSidebar, activeTab, dispatch]);

  useEffect(() => {
    if (!showFilterSidebar || !filterSearchTerm.trim()) {
      setSearchSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      if (activeTab === "Company" || activeTab === "Industry") {
        const result = await dispatch(fetchCompanies(filterSearchTerm));
        if (result?.payload?.length > 0) {
          const list =
            activeTab === "Industry"
              ? [
                  ...new Set(
                    result.payload.map((c: any) => c.industry).filter(Boolean),
                  ),
                ]
              : result.payload.map((c: any) => c.company);
          setSearchSuggestions(list.slice(0, 10));
        } else {
          setSearchSuggestions([]);
        }
      } else if (activeTab === "Designation") {
        const result = await dispatch(fetchDesignation(filterSearchTerm));
        if (result?.payload?.length > 0) {
          const list = result.payload.map((d: any) => d.designation);
          setSearchSuggestions(list.slice(0, 10));
        } else {
          setSearchSuggestions([]);
        }
      }
    };

    fetchSuggestions();
  }, [filterSearchTerm, activeTab, showFilterSidebar, dispatch]);

  const handleTabChange = (tab: "Company" | "Designation" | "Industry") => {
    setActiveTab(tab);
    setFilterSearchTerm("");

    if (tab === "Company" || tab === "Industry") {
      dispatch(fetchCompanies(""));
    } else if (tab === "Designation") {
      dispatch(fetchDesignation(""));
    }
  };

  const handleFilterChange = (
    filterType: keyof FilterState,
    value: string,
    checked: boolean,
  ) => {
    const normalizedValue = value.toLowerCase().trim();

    setFilters((prev) => {
      let updatedArray;

      if (checked) {
        if (prev[filterType].includes(normalizedValue)) {
          updatedArray = prev[filterType];
        } else {
          updatedArray = [...prev[filterType], normalizedValue];
        }
      } else {
        updatedArray = prev[filterType].filter(
          (item) => item !== normalizedValue,
        );
      }

      return {
        ...prev,
        [filterType]: updatedArray,
      };
    });
  };

  const clearAllFilters = () => {
    setFilters({ companies: [], industries: [], designations: [] });
    setIsFilterMode(false);

    // Reload profiles without filters
    if (center) {
      getNearbyProfiles(center.lat, center.lng, 1);
    }
  };

  // const handleFilterInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "Enter") {
  //     e.preventDefault();
  //     const typedValue = filterSearchTerm.trim().toLowerCase();

  //     if (typedValue) {
  //       const filterType =
  //         activeTab === "Company"
  //           ? "companies"
  //           : activeTab === "Designation"
  //             ? "designations"
  //             : "industries";

  //       if (!filters[filterType].includes(typedValue)) {
  //         handleFilterChange(filterType, typedValue, true);
  //       }

  //       setFilterSearchTerm("");
  //       setSearchSuggestions([]);
  //     }
  //   }
  // };

  const applyFilters = async () => {
    if (!center) return;

    const typedValue = filterSearchTerm.trim().toLowerCase();
    const updatedFilters = { ...filters };

    // If user typed something, add it to the appropriate filter
    if (typedValue) {
      const filterType =
        activeTab === "Company"
          ? "companies"
          : activeTab === "Designation"
            ? "designations"
            : "industries";

      if (!updatedFilters[filterType].includes(typedValue)) {
        updatedFilters[filterType] = [
          ...updatedFilters[filterType],
          typedValue,
        ];
        // Update filters state
        setFilters(updatedFilters);
      }

      // Clear the input field after adding
      setFilterSearchTerm("");
    }

    // Check if there are any active filters
    const hasActiveFilters =
      updatedFilters.companies.length > 0 ||
      updatedFilters.designations.length > 0 ||
      updatedFilters.industries.length > 0;

    if (hasActiveFilters) {
      // Use updatedFilters directly for the API call
      setLoading(true);
      setIsFilterMode(true);

      try {
        const response = await axios.post(
          `${appUrl}/api/v1/user/nearby-Profiles-Filter`,
          {
            company: updatedFilters.companies,
            designation: updatedFilters.designations,
            industryName: updatedFilters.industries,
            latitude: center.lat,
            longitude: center.lng,
            distance: maxDistance,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const data = response.data;

        if (data.status) {
          const filteredProfiles = data.result?.filteredProfiles || [];
          setProfiles(filteredProfiles);

          if (isLoggedIn) {
            await refreshConnectionStatuses(
              filteredProfiles,
              center.lat,
              center.lng,
              false,
            );
          }

          toast.success("Filters applied successfully");
          setIsFilterMode(true);
        } else {
          toast.error(data.message || "Failed to apply filters");
          setProfiles([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch filtered profiles:", err);
        toast.error(err?.response?.data?.message || "Unable to apply filters");
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    } else {
      setIsFilterMode(false);
      getNearbyProfiles(center.lat, center.lng, 1);
    }

    setShowFilterSidebar(false);
  };

  const allFilteredCompanies = companies.filter((c: any) =>
    c.company.toLowerCase().includes(filterSearchTerm.toLowerCase()),
  );
  const allFilteredDesignations = designations.filter((d: any) =>
    d.designation.toLowerCase().includes(filterSearchTerm.toLowerCase()),
  );

  const allIndustries = companies
    .filter((c: any) => c.industry)
    .map((c: any) => ({
      industry: c.industry,
      _id: c._id,
    }));

  const uniqueIndustries = allIndustries.filter(
    (item: any, index: number, self: any[]) =>
      index ===
        self.findIndex(
          (t: any) => t.industry.toLowerCase() === item.industry.toLowerCase(),
        ) &&
      item.industry.toLowerCase().includes(filterSearchTerm.toLowerCase()),
  );

  const visibleCompanies = allFilteredCompanies.slice(0, 25);
  const visibleDesignations = allFilteredDesignations.slice(0, 25);
  const visibleIndustries = uniqueIndustries.slice(0, 25);

  const createMarkerIcon = (isSelected: boolean = false) => ({
    path: window.google?.maps?.SymbolPath?.CIRCLE,
    fillColor: isSelected ? "#1e40af" : "#3b82f6",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: isSelected ? 8 : 6,
  });

  const isLoadingFilters =
    activeTab === "Company" || activeTab === "Industry"
      ? companiesLoading
      : designationsLoading;

  const renderConnectionButton = (profile: Profile) => {
    if (!isLoggedIn) {
      return (
        <button
          className="p-2 rounded-full bg-primary/20 backdrop-blur-2xl transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            toast.info("Please login to connect with users");
            navigate("/user-login");
          }}
          title="Login to Connect"
        >
          <UserPlus className="w-5 h-5 text-klout-primary" />
        </button>
      );
    }

    const status = connectionStatuses[profile._id] || {
      isFriend: false,
      isPending: false,
      loading: false,
    };

    if (status.isFriend) {
      return (
        <button
          className="p-2 rounded-full cursor-pointer bg-green-100 hover:bg-green-200 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/chat/${user._id}_${profile._id}`);
          }}
          title="Chat"
        >
          <MessageCircle className="w-5 h-5 text-green-600" />
        </button>
      );
    }

    if (status.isPending) {
      return (
        <button
          className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleCancel(profile._id);
          }}
          disabled={status.loading}
          title="Cancel Request"
        >
          <Clock className="w-5 h-5 text-yellow-600" />
        </button>
      );
    }

    return (
      <button
        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          handleConnect(profile._id);
        }}
        disabled={status.loading}
        title="Send Connection Request"
      >
        <UserPlus className="w-5 h-5 text-klout-primary" />
      </button>
    );
  };

  const handleProfileImageClick = (profile: Profile) => {
    if (!isLoggedIn) {
      // For logged-out users, show login message
      setSelectedImageUrl(""); // No need to set actual image URL
      setShowImageDialog(true);
    } else {
      // For logged-in users, show the actual image
      const imageUrl = profile.profileImage
        ? getUserProfileImage(user?.imageBaseUrl || "", profile.profileImage)
        : DummyImage;
      setSelectedImageUrl(imageUrl);
      setShowImageDialog(true);
    }
  };

  const handleProfileClick = (profile: Profile) => {
    if (!isLoggedIn) {
      toast.info("Please login to view full profiles");
      navigate("/user-login");
      return;
    }
    navigate(
      `/profile/${profile.first_name.toLowerCase()}-${profile.last_name.toLowerCase()}-${
        profile._id
      }`,
    );
  };

  // Set page title
  const pageTitle = "Business Professionals Near Me | Klout Club";

  // Update document title
  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
  });

  return (
    <>
      {/* <Helmet>
        <title>{pageTitle}</title>
      </Helmet> */}
      <div className="max-w-7xl mx-auto min-h-screen mt-5 dark:bg-muted bg-white rounded-xl shadow-lg p-4 space-y-6">
        <EventHighlight />

        {!isLoggedIn && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm text-foreground">
              <strong>Guest Mode:</strong> You're viewing profiles as a guest.
              Login to connect with users and access all features.
            </span>
            <button
              onClick={() => navigate("/user-login")}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              Login
            </button>
          </div>
        )}

        {!isLoggedIn && locationDenied && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm text-foreground">
              <strong>Location Required:</strong> Please allow location access
              from your browser to see nearby profiles.
            </span>
            <button
              onClick={() => {
                toast.info(
                  "Enable location from browser settings and refresh the page",
                );
              }}
              className="px-4 py-2 bg-red-600 cursor-pointer text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              How to enable?
            </button>
          </div>
        )}

        <div className="bg-blue-500/20 border border-primary rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-primary dark:text-blue-200">
            {isSearchMode ? (
              <>
                Showing search results for <strong>"{searchTerm}"</strong>
              </>
            ) : isFilterMode ? (
              <>
                Showing filtered profiles within{" "}
                <strong>{maxDistance}km</strong>
              </>
            ) : (
              <>
                Showing profiles within <strong>{maxDistance}km</strong>
              </>
            )}
          </span>
          {isLoggedIn && !isSearchMode && (
            <button
              onClick={() => navigate("/settings")}
              className="text-xs text-primary hover:primary underline cursor-pointer"
            >
              Adjust Distance
            </button>
          )}
        </div>
        {isLoaded && center && !locationDenied && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
          >
            <Marker
              position={center}
              icon={
                window.google
                  ? {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      fillColor: "#ef4444",
                      fillOpacity: 1,
                      strokeColor: "#ffffff",
                      strokeWeight: 2,
                      scale: 8,
                    }
                  : undefined
              }
              title="Your location"
            />

            {profiles.map((profile) => {
              const lat = parseFloat(profile.latitude as string);
              const lng = parseFloat(profile.longitude as string);
              if (isNaN(lat) || isNaN(lng)) return null;

              const profileImg =
                getUserProfileImage(
                  user?.imageBaseUrl || "",
                  profile.profileImage || "",
                ) || DummyImage;

              return (
                <Marker
                  key={profile._id}
                  position={{ lat, lng }}
                  icon={createMarkerIcon(selectedProfile?._id === profile._id)}
                  onMouseOver={() => setInfoWindowProfile(profile)}
                  onMouseOut={() => setInfoWindowProfile(null)}
                  onClick={() => setSelectedProfile(profile)}
                >
                  {infoWindowProfile?._id === profile._id && (
                    <InfoWindow onCloseClick={() => setInfoWindowProfile(null)}>
                      <div className="p-2 max-w-xs">
                        <div className="flex items-center gap-3 mb-2">
                          {isLoggedIn ? (
                            <img
                              src={profileImg}
                              alt={`${profile.first_name} ${profile.last_name}`}
                              className="w-12 h-12 rounded-full border"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg border border-gray-200"
                              title={`${profile.first_name} ${profile.last_name}`}
                            >
                              {`${profile.first_name?.charAt(0) || ""}${
                                profile.last_name?.charAt(0) || ""
                              }`.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-sm capitalize">
                              {profile.first_name} {profile.last_name}
                            </h3>
                            {profile.designation && (
                              <p className="text-xs text-gray-600 capitalize">
                                {profile.designation}
                              </p>
                            )}
                          </div>
                        </div>
                        {profile.company && (
                          <p className="text-xs text-gray-700 mb-2 capitalize">
                            <span className="font-medium">Company:</span>{" "}
                            {profile.company}
                          </p>
                        )}
                        <button
                          onClick={() => handleProfileClick(profile)}
                          className="text-xs bg-klout-primary text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          View Profile
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              );
            })}
          </GoogleMap>
        )}
        <div className="w-full flex flex-col items-center px-2 gap-3">
          <div className="relative w-full sm:w-1/2 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search profiles by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="animate-spin h-5 w-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              )}
            </div>

            <Dialog
              open={showFilterSidebar}
              onOpenChange={setShowFilterSidebar}
            >
              <DialogTrigger asChild>
                <button className="px-4 py-2 border cursor-pointer border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors relative">
                  <Filter className="w-5 h-5 text-gray-600" />
                  {(filters.companies.length > 0 ||
                    filters.designations.length > 0 ||
                    filters.industries.length > 0) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {filters.companies.length +
                        filters.designations.length +
                        filters.industries.length}
                    </span>
                  )}
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-3xl flex flex-1 justify-between flex-col min-h-[80vh] w-full p-6">
                <DialogHeader className="h-fit">
                  <DialogTitle className="text-lg font-semibold">
                    Filters
                  </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col h-full! flex-1 sm:flex-row gap-6">
                  <div className="flex sm:flex-col h-full gap-2 sm:w-40 w-full">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`px-4 py-2 rounded-lg text-sm cursor-pointer font-medium transition-colors ${
                          activeTab === tab
                            ? "bg-primary text-white shadow"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 flex flex-col">
                    <input
                      type="text"
                      placeholder={`Search ${activeTab.toLowerCase()}...`}
                      value={filterSearchTerm}
                      onChange={(e) => setFilterSearchTerm(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchSuggestions.length > 0 && (
                      <ul className="border border-gray-200 rounded-lg shadow-sm mb-3 bg-white max-h-48 overflow-y-auto">
                        {searchSuggestions.map((item, idx) => (
                          <li
                            key={idx}
                            onClick={() => {
                              handleFilterChange(
                                activeTab.toLowerCase() as keyof FilterState,
                                item,
                                true,
                              );
                              setFilterSearchTerm(""); // Clear the input
                              setSearchSuggestions([]); // Clear suggestions
                            }}
                            className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer capitalize"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="h-80 overflow-y-auto space-y-3 pr-2">
                      {isLoadingFilters ? (
                        <div className="text-center py-8 text-gray-500">
                          Loading...
                        </div>
                      ) : (
                        <>
                          {activeTab === "Company" &&
                            visibleCompanies.map((c: any) => {
                              const companyName = c.company
                                .toLowerCase()
                                .trim();
                              const isChecked =
                                filters.companies.includes(companyName);

                              return (
                                <label
                                  key={c._id}
                                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) =>
                                      handleFilterChange(
                                        "companies",
                                        c.company,
                                        e.target.checked,
                                      )
                                    }
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm font-medium capitalize">
                                    {c.company}
                                  </span>
                                </label>
                              );
                            })}

                          {activeTab === "Designation" &&
                            visibleDesignations.map((d: any) => {
                              const designationName = d.designation
                                .toLowerCase()
                                .trim();
                              const isChecked =
                                filters.designations.includes(designationName);

                              return (
                                <label
                                  key={d._id}
                                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) =>
                                      handleFilterChange(
                                        "designations",
                                        d.designation,
                                        e.target.checked,
                                      )
                                    }
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm font-medium capitalize">
                                    {d.designation}
                                  </span>
                                </label>
                              );
                            })}

                          {activeTab === "Industry" &&
                            visibleIndustries.map((i: any, idx: number) => {
                              const industryName = i.industry
                                .toLowerCase()
                                .trim();
                              const isChecked =
                                filters.industries.includes(industryName);

                              return (
                                <label
                                  key={i._id || idx}
                                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) =>
                                      handleFilterChange(
                                        "industries",
                                        i.industry,
                                        e.target.checked,
                                      )
                                    }
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-blue-500"
                                  />
                                  <span className="text-sm font-medium capitalize">
                                    {i.industry}
                                  </span>
                                </label>
                              );
                            })}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex justify-between max-h-fit items-center mt-4">
                  <Button
                    className="text-sm text-white cursor-pointer hover:text-primary-dark font-medium"
                    onClick={() => {
                      clearAllFilters();
                      setFilterSearchTerm("");
                    }}
                  >
                    Clear All
                  </Button>
                  <Button
                    className="bg-primary text-white cursor-pointer px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {(filters.companies.length > 0 ||
            filters.designations.length > 0 ||
            filters.industries.length > 0) && (
            <div className="w-full sm:w-1/2 flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-semibold text-blue-800">
                Active Filters:
              </span>

              {filters.companies.map((company, idx) => (
                <span
                  key={`company-${idx}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded-full capitalize"
                >
                  Company: {company}
                  <button
                    onClick={() => {
                      handleFilterChange("companies", company, false);
                      // Re-apply filters after removal
                      if (center) {
                        const hasRemainingFilters =
                          filters.companies.filter((c) => c !== company)
                            .length > 0 ||
                          filters.designations.length > 0 ||
                          filters.industries.length > 0;

                        if (hasRemainingFilters) {
                          getFilteredProfiles(center.lat, center.lng);
                        } else {
                          setIsFilterMode(false);
                          getNearbyProfiles(center.lat, center.lng, 1);
                        }
                      }
                    }}
                    className="ml-1 hover:bg-blue-600 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}

              {filters.designations.map((designation, idx) => (
                <span
                  key={`designation-${idx}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs rounded-full capitalize"
                >
                  Designation: {designation}
                  <button
                    onClick={() => {
                      handleFilterChange("designations", designation, false);
                      // Re-apply filters after removal
                      if (center) {
                        const hasRemainingFilters =
                          filters.companies.length > 0 ||
                          filters.designations.filter((d) => d !== designation)
                            .length > 0 ||
                          filters.industries.length > 0;

                        if (hasRemainingFilters) {
                          getFilteredProfiles(center.lat, center.lng);
                        } else {
                          setIsFilterMode(false);
                          getNearbyProfiles(center.lat, center.lng, 1);
                        }
                      }
                    }}
                    className="ml-1 hover:bg-green-600 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}

              {filters.industries.map((industry, idx) => (
                <span
                  key={`industry-${idx}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500 text-white text-xs rounded-full capitalize"
                >
                  Industry: {industry}
                  <button
                    onClick={() => {
                      handleFilterChange("industries", industry, false);
                      // Re-apply filters after removal
                      if (center) {
                        const hasRemainingFilters =
                          filters.companies.length > 0 ||
                          filters.designations.length > 0 ||
                          filters.industries.filter((i) => i !== industry)
                            .length > 0;

                        if (hasRemainingFilters) {
                          getFilteredProfiles(center.lat, center.lng);
                        } else {
                          setIsFilterMode(false);
                          getNearbyProfiles(center.lat, center.lng, 1);
                        }
                      }
                    }}
                    className="ml-1 hover:bg-purple-600 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}

              <button
                onClick={clearAllFilters}
                className="ml-auto text-xs text-primary cursor-pointer hover:text-blue-800 font-medium underline"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
        <div>
          {(loading || searchLoading) && <ExploreLoader />}
          {usingCachedData && (
            <div className="text-center text-green-600 text-sm mb-4">
              {/* ✓ Using cached data for faster performance */}
              <button
                onClick={() => {
                  if (center && !locationDenied) {
                    getProfilesWithCacheCheck(center.lat, center.lng, 1, true);
                  } else if (locationDenied) {
                    getNearbyProfilesWithoutLocation(1);
                  }
                }}
                className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline cursor-pointer"
              >
                Refresh data
              </button>
            </div>
          )}
          {!loading && !searchLoading && profiles.length === 0 && (
            <p className="text-center text-gray-500">
              {isSearchMode
                ? `No profiles found for "${searchTerm}"`
                : filters.companies.length > 0 ||
                    filters.designations.length > 0 ||
                    filters.industries.length > 0
                  ? "No profiles match your selected filters"
                  : "No profiles found."}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {profiles.map((p) => {
              const profileImg =
                getUserProfileImage(
                  user?.imageBaseUrl || (imageBaseUrl as string),
                  p.profileImage as string,
                ) || DummyImage;
              const isSelected = selectedProfile?._id === p._id;

              return (
                <div
                  key={p._id}
                  id={`profile-${p._id}`}
                  onClick={() => {
                    setSelectedProfile(p);
                    navigate(
                      `/profile/${p.first_name.toLowerCase()}-${p.last_name.toLowerCase()}-${
                        p._id
                      }`,
                    );
                  }}
                  className={`flex items-center justify-between border rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all bg-background/50 cursor-pointer ${
                    isSelected ? "ring-2 ring-klout-primary bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                    {p.profileImage ? (
                      <img
                        src={profileImg}
                        alt={`${p.first_name} ${p.last_name}`}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border object-cover shrink-0"
                        loading="lazy"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileImageClick(p);
                        }}
                        aria-label={profileImg}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-klout-primary flex items-center justify-center text-white font-semibold text-base sm:text-lg border border-gray-200 shrink-0"
                        title={`${p.first_name} ${p.last_name}`}
                      >
                        {`${p.first_name?.charAt(0) || ""}${
                          p.last_name?.charAt(0) || ""
                        }`.toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <p className="font-semibold text-sm sm:text-base md:text-lg capitalize truncate">
                          {p.first_name} {p.last_name}
                        </p>

                        {p.role?.toLowerCase() === "premium" && (
                          <img
                            src={PremiumLogo}
                            alt="Premium User"
                            title="Premium Member"
                            className="w-4 h-5 sm:w-5 sm:h-6 shrink-0"
                            width={24}
                            height={24}
                            loading="lazy"
                          />
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-accent-foreground/50 capitalize truncate">
                        {p.designation || "No designation"}
                      </p>
                      <p className="text-xs sm:text-sm text-accent-foreground/50 capitalize truncate">
                        {p.company || "No company"}
                      </p>
                      <p className="text-xs sm:text-sm text-accent-foreground/50 truncate">
                        {p.city || "No city"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0 relative">
                    {renderConnectionButton(p)}
                    <>
                      {p.score !== undefined && (
                        <div className="relative w-16 h-12">
                          <img
                            src={TlsImage}
                            alt="TLS"
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                          <span className="absolute inset-y-0 right-2 top-1 flex items-center text-white font-semibold text-sm">
                            {p.score}
                          </span>
                        </div>
                      )}
                    </>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading &&
            !searchLoading &&
            !isSearchMode &&
            !isFilterMode &&
            profiles.length > 0 &&
            loadingMore && (
              <div className="flex justify-center mt-6">
                <span className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading more profiles...
                </span>
              </div>
            )}

          {!loading &&
            !searchLoading &&
            !isSearchMode &&
            !isFilterMode &&
            profiles.length > 0 &&
            !hasMore && (
              <div className="text-center mt-6 text-gray-500 text-sm">
                No more profiles to load
              </div>
            )}

          {isFilterMode && profiles.length > 0 && (
            <div className="text-center mt-6 text-gray-500 text-sm">
              Showing {profiles.length} filtered result
              {profiles.length !== 1 ? "s" : ""}
            </div>
          )}

          <ImageDialog
            isOpen={showImageDialog}
            imageUrl={selectedImageUrl}
            onClose={() => setShowImageDialog(false)}
            showLoginMessage={!isLoggedIn} // Pass the logged-in status
          />
        </div>
      </div>
    </>
  );
};

export default Explore;
