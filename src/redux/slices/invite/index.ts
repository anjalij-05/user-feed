import { createSlice } from "@reduxjs/toolkit";
import { sendInvite } from "@/app-api/event";

interface InviteState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: InviteState = {
  loading: false,
  error: null,
  success: false,
};

const inviteSlice = createSlice({
  name: "invite",
  initialState,
  reducers: {
    resetInvite: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendInvite.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendInvite.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendInvite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetInvite } = inviteSlice.actions;
export default inviteSlice.reducer;
