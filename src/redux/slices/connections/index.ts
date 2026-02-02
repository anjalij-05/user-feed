// src/redux/slices/connections.ts
import { createSlice } from "@reduxjs/toolkit";
import {
  getMyConnections,
  checkConnectionStatus,
  removeConnection,
} from "@/app-api/connections";
import { fetchBookmarkedList, toggleBookmark } from "@/app-api/bookmark";

export interface ConnectionRequest {
  _id: string;
  request_user_id: string;
  receive_user_id: string;
  status: number; // 1 = pending, etc.
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionsState {
  connectionRequests: ConnectionRequest[];
  connectionsList: any[]; // raw connectionsList (records) from API
  userProfiles: any[];
  connectionIdData: {
    connectionId: string;
    userId: string;
  }[]; // connected users from checkConnectionStatus
  bookmarked: any[]; // bookmarked users from bookmarkedList
  connected: boolean;
  isFriend: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: ConnectionsState = {
  connectionRequests: [],
  connectionsList: [],
  userProfiles: [],
  connectionIdData: [],
  bookmarked: [],
  connected: false,
  isFriend: false,
  loading: false,
  error: null,
};

const connectionsSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {
    clearConnections: (state) => {
      state.connectionRequests = [];
      state.connectionsList = [];
      state.userProfiles = [];
      state.connectionIdData = [];
      state.connected = false;
      state.isFriend = false;
      state.error = null;
      state.loading = false;
    },
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    setIsFriend: (state, action) => {
      state.isFriend = action.payload;
    },
  },
  extraReducers: (builder) => {
    // getMyConnections
    builder
      .addCase(getMyConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyConnections.fulfilled, (state, action) => {
        state.loading = false;
        state.connectionRequests = action.payload.connectionRequests || [];
        state.connectionsList = action.payload.connectionsList || [];
      })
      .addCase(getMyConnections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // checkConnectionStatus -> save userProfiles from API
    builder
      .addCase(checkConnectionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkConnectionStatus.fulfilled, (state, action) => {
        state.loading = false;

        // Reset flags
        state.isFriend = false;
        state.connected = false;

        // Save connected user profiles
        state.userProfiles = action.payload?.result?.userProfiles || [];
        state.connectionIdData = action.payload?.result?.connectionIdData || [];
        console.log("user profiles", action.payload.result.userProfiles);
        console.log(
          "connection ID data",
          action.payload.result.connectionIdData
        );

        // Optionally, set isFriend if any type===1 exists
        const hasFriend =
          Array.isArray(action.payload?.data) &&
          action.payload.data.some((item: any) => item.type === 1);
        if (hasFriend) state.isFriend = true;
      })
      .addCase(checkConnectionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchBookmarkedList
    builder.addCase(fetchBookmarkedList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder
      .addCase(fetchBookmarkedList.fulfilled, (state, action) => {
        state.loading = false;

        const markedUsers = action.payload?.result?.markedUsers || [];
        const userProfiles = action.payload?.result?.userProfiles || [];

        // Create map: userId -> note
        const noteMap: Record<string, string> = {};
        markedUsers.forEach((item: any) => {
          noteMap[item.to_user_id] = item.note;
        });

        // Merge note into userProfiles
        state.bookmarked = userProfiles.map((profile: any) => ({
          ...profile,
          note: noteMap[profile._id] || "",
        }));
      })

      .addCase(fetchBookmarkedList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // toggleBookmark
    builder
      .addCase(toggleBookmark.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        state.loading = false;
        const { targetUserId, status, note } = action.meta.arg;

        if (status === "1") {
          // Adding bookmark
          // Check if user returned from API
          const newUser = action.payload?.result?.user ||
            action.payload?.data?.user ||
            action.payload?.user || { _id: targetUserId, note: note || "" };

          // Avoid duplicates
          const exists = state.bookmarked.some((u) => u._id === targetUserId);
          if (!exists) {
            state.bookmarked.push(newUser);
          } else {
            // Update existing bookmark with new note
            const index = state.bookmarked.findIndex(
              (u) => u._id === targetUserId
            );
            if (index !== -1) {
              state.bookmarked[index] = {
                ...state.bookmarked[index],
                note: note || "",
              };
            }
          }
        } else {
          // Removing bookmark (status === "0")
          state.bookmarked = state.bookmarked.filter(
            (u) => u._id !== targetUserId
          );
        }
      })
      .addCase(toggleBookmark.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // removeConnection
    builder
      .addCase(removeConnection.fulfilled, (state) => {
        state.isFriend = false;
        state.connected = false;
        state.connectionsList = [];
        state.userProfiles = [];
      })
      .addCase(removeConnection.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearConnections, setConnected, setIsFriend } =
  connectionsSlice.actions;
export default connectionsSlice.reducer;
