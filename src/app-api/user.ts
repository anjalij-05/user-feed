import { appUrl } from "@/constants";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (
    data: Record<string, any>, // This accepts any key-value pairs
    { rejectWithValue, getState }
  ) => {
    try {
      const state: any = getState();
      const token = state.auth.token;
      const userid = state.auth.user._id;

      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      const headers: any = {
        "x-access-token": token,
        userid,
        "Content-Type": "application/json",
      };

      const response = await axios.post(
        `${appUrl}/api/v1/user/userUpdate`,
        data, // ✅ This will send whatever you pass
        { headers }
      );

      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

// Fetch user's chat list
export const fetchChatList = createAsyncThunk(
  "chat/getChatList",
  async ({ token, userId }: { token: string; userId: string }) => {
    const response = await axios.get(
      `${appUrl}/api/v1/user-chat/chatUsersList`,
      {
        headers: {
          userid: userId,
          "x-access-token": token,
        },
      }
    );
    return response.data;
  }
);

interface BlockUserParams {
  token: string;
  userId: string;
  blockUserId: string;
}

interface UnblockUserParams {
  token: string;
  userId: string;
  unblockUserId: string;
}

// Block User Thunk
export const blockUser = createAsyncThunk(
  "blockUser/block",
  async (
    { token, userId, blockUserId }: BlockUserParams,
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${appUrl}/api/v1/user/blockUser`, {
        method: "POST",
        headers: {
          "x-access-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          blockUserId,
        }),
      });

      const data = await response.json();

      if (!response.ok && !data.status) {
        return rejectWithValue(data.message || "Failed to block user");
      }

      return { blockUserId, message: data.message };
    } catch (error: any) {
      return rejectWithValue(error.message || "Error blocking user");
    }
  }
);

// Unblock User Thunk
export const unblockUser = createAsyncThunk(
  "blockUser/unblock",
  async (
    { token, userId, unblockUserId }: UnblockUserParams,
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${appUrl}/api/v1/user/unblockUser`, {
        method: "POST",
        headers: {
          "x-access-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          unblockUserId,
        }),
      });

      const data = await response.json();

      if (!response.ok && !data.status) {
        return rejectWithValue(data.message || "Failed to unblock user");
      }

      return { unblockUserId, message: data.message };
    } catch (error: any) {
      return rejectWithValue(error.message || "Error unblocking user");
    }
  }
);

// Fetch Blocked Users Thunk
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
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch blocked users"
      );
    }
  }
);

// Delete Chat Thunk
export const deleteChatUser = createAsyncThunk(
  "chat/deleteChat",
  async (
    {
      token,
      userId,
      connectionId,
      toUserId,
    }: {
      token: string;
      userId: string;
      connectionId: string;
      toUserId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      if (!connectionId || !toUserId) {
        return rejectWithValue(
          "Missing required fields: connectionId or toUserId"
        );
      }

      const formData = new FormData();
      formData.append("connectionId", connectionId);
      formData.append("toUserId", toUserId);
      formData.append("isDeleted", "1");

      const response = await axios.post(
        `${appUrl}/api/v1/user-chat/updateChatUserStatus`,
        formData,
        {
          headers: {
            userid: userId,
            "x-access-token": token,
          },
        }
      );

      return { connectionId, toUserId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete chat"
      );
    }
  }
);

// fetch user profile by ID
export const fetchUserProfileByMobile = createAsyncThunk(
  "user/fetchByMobile",
  async (
    { token, mobileNumber }: { token: string; mobileNumber: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${appUrl}/api/v1/user/is-user`,
        { mobileNumber: [mobileNumber] },
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  }
);
