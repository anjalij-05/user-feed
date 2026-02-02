import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { fetchNearbyProfilesThunk } from "@/app-api/nearbyProfiles";
import type { AppUser } from "@/types";

interface UserState {
  nearbyProfiles: AppUser[];
  publicProfiles: AppUser[];
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  lastFetchedTimestamp: number | null;
  cacheValidity: number; // in milliseconds (default: 5 minutes)
}

const initialState: UserState = {
  nearbyProfiles: [],
  publicProfiles: [],
  user: null,
  loading: false,
  error: null,
  currentPage: 1,
  hasMore: true,
  lastFetchedTimestamp: null,
  cacheValidity: 5 * 60 * 1000, // 5 minutes in milliseconds
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearProfiles(state) {
      state.nearbyProfiles = [];
      state.publicProfiles = [];
      state.error = null;
      state.currentPage = 1;
      state.hasMore = true;
    },
    resetPagination(state) {
      state.currentPage = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNearbyProfilesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchNearbyProfilesThunk.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;

          let newProfiles: AppUser[] = [];

          // CASE 1️⃣: Logged-in OR Public nearby
          if (action.payload?.result?.nearByProfile) {
            newProfiles = action.payload.result.nearByProfile;
          }

          // CASE 2️⃣: Non-location API (your event-based response)
          else if (Array.isArray(action.payload?.data)) {
            newProfiles = action.payload.data;
          }

          // Paginated append logic
          if (action.payload.isPublic || action.payload.isNoLocation) {
            // public + non-location → store in publicProfiles
            state.publicProfiles =
              action.payload.currentPage === 1
                ? newProfiles
                : [...state.publicProfiles, ...newProfiles];
          } else {
            // logged-in nearby → store in nearbyProfiles
            state.nearbyProfiles =
              action.payload.currentPage === 1
                ? newProfiles
                : [...state.nearbyProfiles, ...newProfiles];
          }

          // Pagination control
          state.currentPage = action.payload.currentPage;
          state.hasMore = newProfiles.length === 10;
          state.lastFetchedTimestamp = Date.now();
        }
      )
      .addCase(fetchNearbyProfilesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfiles, resetPagination } = userSlice.actions;

// Utility function to check if cached data is still fresh
export const isCacheFresh = (state: UserState): boolean => {
  if (!state.lastFetchedTimestamp) return false;

  const now = Date.now();
  return now - state.lastFetchedTimestamp < state.cacheValidity;
};

export default userSlice.reducer;
