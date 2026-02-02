import { createSlice } from "@reduxjs/toolkit";
import type { EventDetails, AppUser as User } from "@/types";
import { fetchEventDetails } from "@/app-api/agenda";
import { fetchUserProfileByMobile } from "@/app-api/user";

interface AgendaState {
  details: EventDetails | null;
  loading: boolean;
  profile: User | null;
  error: string | null;
}

const initialState: AgendaState = {
  details: null,
  loading: false,
  profile: null,
  error: null,
};

const agendaSlice = createSlice({
  name: "eventDetails",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAgenda
      .addCase(fetchEventDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.details = action.payload;
        state.loading = false;
        state.error = null;
        // console.log("event details:", action.payload);
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // fetch user profile by mobile    builder
      .addCase(fetchUserProfileByMobile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileByMobile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfileByMobile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default agendaSlice.reducer;
