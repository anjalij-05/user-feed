// src/redux/slices/chatSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { fetchChatList } from "@/app-api/user";

interface ChatState {
  chatUsers: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chatUsers: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  // Add action to update chat list with Firebase data
  reducers: {
    updateChatListWithFirebase: (state, action) => {
      state.chatUsers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatList.fulfilled, (state, action) => {
        state.loading = false;
        state.chatUsers = action.payload;
      })
      .addCase(fetchChatList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load chat list";
      });
  },
});

export default chatSlice.reducer;
