import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { domain } from "@/constants";

// 🔹 Send Attendee
export const fetchEventDetails = createAsyncThunk(
  "agenda/fetchEventDetails",
  async (uuid: string, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${domain}/api/event_details_attendee_list/`,
        {
          event_uuid: uuid,
          phone_number: 9643314331, // static
        }
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        (error as any)?.response?.data || "Error sending attendee"
      );
    }
  }
);
