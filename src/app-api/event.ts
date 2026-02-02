import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { domain } from "@/constants";

// Fetch all events
export const fetchEvents = createAsyncThunk<Event[]>(
  "events/fetchAll",
  async () => {
    const response = await axios.get(`${domain}/api/all_events`);
    return response.data.data;
  }
);

// Send invite request
export const sendInvite = createAsyncThunk(
  "invite/sendInvite",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${domain}/api/request_event_invitation`,
        data
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to send invite");
    }
  }
);
