import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { appUrl } from "@/constants";

// Filter notifications
export const filterListNotification = createAsyncThunk(
  "notifications/filterNotifications",
  async (
    {
      token,
      userId,
      fromUserId,
      type,
    }: { token: string; userId: string; fromUserId?: string; type?: string },
    { rejectWithValue }
  ) => {
    try {
      const payload: any = { user_id: userId };
      if (fromUserId) payload.from_user_id = fromUserId;
      if (type) payload.type = type;

      const res = await axios.post(
        `${appUrl}/api/v1/notification/filterList`,
        payload,
        { headers: { "x-access-token": token } }
      );

      console.log("Filtered notifications response:", res.data.result);

      return res.data?.result?.data || [];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch notifications" }
      );
    }
  }
);

// Types for params
interface NotificationParams {
  token: string;
  userId: string;
  fromUserId?: string; // optional
  type?: string; // optional
}

export const notificationList = createAsyncThunk(
  "notifications/list",
  async (
    { token, userId, fromUserId, type }: NotificationParams,
    { rejectWithValue }
  ) => {
    try {
      const payload: Record<string, any> = { userid: userId };
      if (fromUserId) payload.from_user_id = fromUserId;
      if (type) payload.type = type;

      // const res = await axios.post(`${appUrl}/api/v1/notification/list`, {
      //   headers: { "x-access-token": token },
      // });

      const res = await axios.post(`${appUrl}/api/v1/notification/list`, {}, {
        headers: {
          "x-access-token": token,
          "userid": userId
        }
      });

      // match your API structure
      return res.data?.result ?? [];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch notifications" }
      );
    }
  }
);

// View profile notify
export const viewProfileNotify = createAsyncThunk(
  "notification/viewProfileNotify",
  async ({
    token,
    loggedInUserId,
    toUserId,
  }: {
    token: string;
    loggedInUserId: string;
    toUserId: string;
  }) => {
    const formData = new FormData();
    formData.append("toUserId", toUserId);

    const response = await axios.post(
      `${appUrl}/api/v1/notification/viewProfileNotify`,
      formData,
      {
        headers: {
          "x-access-token": token,
          userid: loggedInUserId,
        },
      }
    );
    return response.data; // return API result to extraReducers
  }
);
