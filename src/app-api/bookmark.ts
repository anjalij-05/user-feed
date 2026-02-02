import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { appUrl } from "@/constants";

// Fetch bookmarked list
export const fetchBookmarkedList = createAsyncThunk(
  "connections/fetchBookmarkedList",
  async (
    { token, userId, latitude, longitude, distance }: any,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${appUrl}/api/v1/user/bookmarkedList`,
        { latitude, longitude, distance },
        {
          headers: {
            "X-Access-Token": token,
            userid: userId,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Error fetching bookmarked list"
      );
    }
  }
);

interface ToggleBookmarkArgs {
  token: string;
  loggedInUserId: string;
  targetUserId: string;
  status: "1" | "0";
  note?: string; // Optional note field
}

// Toggle bookmark using markedUser API
export const toggleBookmark = createAsyncThunk(
  "connections/toggleBookmark",
  async (
    { token, loggedInUserId, targetUserId, status, note }: ToggleBookmarkArgs,
    { rejectWithValue }
  ) => {
    try {
      const payload: any = {
        userId: targetUserId,
        status,
      };

      // Only include note if provided and status is "1" (adding bookmark)
      if (note && status === "1") {
        payload.note = note;
      }

      const response = await axios.post(
        `${appUrl}/api/v1/user/markedUser`,
        payload,
        {
          headers: {
            "X-Access-Token": token,
            userid: loggedInUserId,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Bookmark request failed"
      );
    }
  }
);