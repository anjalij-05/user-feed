import { createSlice } from "@reduxjs/toolkit";
import {
  notificationList,
  viewProfileNotify,
} from "@/app-api/notificationFilterList";

interface NotificationState {
  list: any[];
  filtered: any[];
  imageBaseUrl: string;
  userProfiles: any[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  list: [],
  filtered: [],
  imageBaseUrl: "",
  userProfiles: [],
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    removeNotification: (state, action) => {
      state.list = state.list.filter((n) => n._id !== action.payload);
      state.filtered = state.filtered.filter((n) => n._id !== action.payload);
    },
    clearFiltered: (state) => {
      state.filtered = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(notificationList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(notificationList.fulfilled, (state, action) => {
        state.loading = false;

        // Store the complete result object
        const result = action.payload?.result || action.payload;

        if (action.meta.arg?.fromUserId || action.meta.arg?.type) {
          // For filtered requests
          state.filtered = result?.data || [];
          console.log("userProfiles:", state.filtered);
        } else {
          // For regular list requests - store all result data
          state.list = result?.data || [];
          console.log("list", state.list);

          state.imageBaseUrl = result?.imageBaseUrl || "";
          state.userProfiles = result?.userProfiles || [];
        }
      })
      .addCase(notificationList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch notifications";
      });

    builder
      .addCase(viewProfileNotify.fulfilled, (state, action) => {
        if (action.payload?.result) {
          state.list = [action.payload.result, ...state.list];
        }
      })
      .addCase(viewProfileNotify.rejected, (state, action) => {
        state.error =
          action.error.message || "Failed to send profile view notification";
      });
  },
});

export const { removeNotification, clearFiltered } = notificationSlice.actions;
export default notificationSlice.reducer;
