// @/redux/slices/attendedEventsSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { fetchAttendedEvents, type AttendedEvent } from "@/app-api/attendedEvents";

interface AttendedEventsState {
  events: AttendedEvent[];
  loading: boolean;
  error: string | null;
}

const initialState: AttendedEventsState = {
  events: [],
  loading: false,
  error: null,
};

const attendedEventsSlice = createSlice({
  name: "attendedEvents",
  initialState,
  reducers: {
    clearAttendedEvents: (state) => {
      state.events = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendedEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendedEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchAttendedEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAttendedEvents } = attendedEventsSlice.actions;
export default attendedEventsSlice.reducer;