import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import { appUrl } from "@/constants";
import { blockUser, unblockUser } from "@/app-api/user";

interface BlockedUser {
  _id: string;
  first_name: string;
  last_name: string;
  profileImage?: string;
}

interface BlockUserState {
  blockedUsers: string[];
  blockedUsersList: BlockedUser[];
  loading: boolean;
  error: string | null;
}

const initialState: BlockUserState = {
  blockedUsers: [],
  blockedUsersList: [],
  loading: false,
  error: null,
};

// ✅ FIX: Moved fetchBlockedUsers ABOVE slice
export const fetchBlockedUsers = createAsyncThunk(
  "blockUser/fetchList",
  async (
    { token, userId }: { token: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${appUrl}/api/v1/user/blockListUsers`,
        { userId },
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      // ✅ API returns: { status, message, result: [...] }
      return response.data.result || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch blocked users"
      );
    }
  }
);

const blockUserSlice = createSlice({
  name: "blockUser",
  initialState,
  reducers: {
    addBlockedUser: (state, action: PayloadAction<string>) => {
      if (!state.blockedUsers.includes(action.payload)) {
        state.blockedUsers.push(action.payload);
      }
    },
    removeBlockedUser: (state, action: PayloadAction<string>) => {
      state.blockedUsers = state.blockedUsers.filter(
        (id) => id !== action.payload
      );
    },
    clearBlockedUsers: (state) => {
      state.blockedUsers = [];
      state.blockedUsersList = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Block User
    builder
      .addCase(blockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.payload.blockUserId;
        if (!state.blockedUsers.includes(userId)) {
          state.blockedUsers.push(userId);
        }
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Unblock User
    builder
      .addCase(unblockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.payload.unblockUserId;
        state.blockedUsers = state.blockedUsers.filter((id) => id !== userId);
        state.blockedUsersList = state.blockedUsersList.filter(
          (user) => user._id !== userId
        );
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ✅ Fetch Blocked Users (fixed)
    builder
      .addCase(fetchBlockedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
        state.loading = false;

        // Validate structure safely
        const result = action.payload?.result || [];

        state.blockedUsersList = result;
        state.blockedUsers = result.map((user: BlockedUser) => user._id);
      })

      .addCase(fetchBlockedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addBlockedUser,
  removeBlockedUser,
  clearBlockedUsers,
  clearError,
} = blockUserSlice.actions;

export default blockUserSlice.reducer;
