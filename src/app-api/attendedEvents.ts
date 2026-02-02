import { appUrl } from "@/constants";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface AttendedEvent {
  _id: string;
  mobileNumber: number;
  eventUUID: string;
  eventTitle: string;
  status: string;
  awardWinner: boolean;
  eventImageUrl: string;
  checkInTime: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  slug: string;
}

interface FetchAttendedEventsPayload {
  mobileNumber: string | number;
}

interface AttendedEventsResponse {
  status: boolean;
  data: AttendedEvent[];
  message: string;
}

// Redux thunk for MyProfile (uses Redux state)
export const fetchAttendedEvents = createAsyncThunk(
  "attendedEvents/fetchAll",
  async (payload: FetchAttendedEventsPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post<AttendedEventsResponse>(
        `${appUrl}/api/organiser/v1/inapp-activity/all-attended-event`,
        {
          mobileNumber: payload.mobileNumber,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch attended events"
      );
    }
  }
);

// Plain function for ProfileDetails (uses local state)
export const fetchUserAttendedEvents = async (
  mobileNumber: string | number
): Promise<AttendedEvent[]> => {
  try {
    const response = await axios.post<AttendedEventsResponse>(
      `${appUrl}/api/organiser/v1/inapp-activity/all-attended-event`,
      {
        mobileNumber: mobileNumber,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data || [];
  } catch (error: any) {
    console.error("Failed to fetch user attended events:", error);
    return [];
  }
};

export const fetchAttendees = async (
  eventUUID: string
): Promise<AttendedEvent[]> => {
  try {
    const response = await axios.get<AttendedEventsResponse>(
      `${appUrl}/api/totalattendees-list/${eventUUID}`
    );

    return response.data.data || [];
  } catch (error: any) {
    console.error("Failed to fetch attendees:", error);
    return [];
  }
};
