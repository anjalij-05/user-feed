import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Event } from "@/types";
import { fetchEvents } from "@/app-api/event";
import { fetchCompanyEvents } from "@/app-api/company";

interface EventState {
  events: Event[];
  companyEvents: Event[];
  loading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  companyEvents: [],
  loading: false,
  error: null,
};

export const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchAllEvents (GET /api/all_events)
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.events = action.payload;
        // console.log("All Events:", action.payload);
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch events";
      })

      // Handle fetchCompanyEvents (POST /api/all-events)
      .addCase(fetchCompanyEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchCompanyEvents.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.companyEvents = action.payload;
          console.log("Company Events:", action.payload);
        }
      )
      .addCase(fetchCompanyEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch company events";
      });
  },
});

export default eventSlice.reducer;
